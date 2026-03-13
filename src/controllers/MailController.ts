import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { Request, Response } from "express";
import { Controller } from "./BaseController";
import { logger } from "../utils/Logger";
import { getRepo } from "../dataSource";
import { Contract } from "../database/entity/Contract";
import jwt from "jsonwebtoken";

interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface SendContractRequest {
    to: string;
    from: string;
    body?: string;
    contractData: Partial<Contract> | "";
}

class MailController extends Controller {
    private transporter: Transporter;

    constructor() {
        super();
        this.transporter = this.initializeTransporter();
    }

    private initializeTransporter(): Transporter {
        if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error("Variables d'environnement SMTP manquantes. Vérifiez SMTP_HOST, SMTP_PORT, MAIL_USER et MAIL_PASS.");
        }

        const config: MailConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        };

        if (isNaN(config.port)) {
            throw new Error("SMTP_PORT doit être un nombre valide.");
        }

        return nodemailer.createTransport(config);
    }

    public sendContract = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = this.validateRequestSendContract(req);
            if (validationResult.error || !validationResult.data) {
                res.status(400).json(validationResult.error);
                return;
            }

            try {
                const contractData = this.buildContractData(validationResult.data.contractData as string | undefined);
                const { contract, created } = await this.createOrLoadContract(contractData);

                if (!created && contract.token !== contractData?.token) {
                    res.status(400).json({ error: "Vous n'êtes pas autorisé à envoyer cet e-mail" });
                    return;
                }

                const mailOptions = this.prepareMailOptions(validationResult.data, contract.token, req.file);
                const info = await this.transporter.sendMail(mailOptions);

                const creatingContractResponse = created ? { contract } : {};

                res.status(200).json({
                    message: "E-mail envoyé avec succès",
                    messageId: info.messageId,
                    creatingContract: creatingContractResponse
                });
            } catch (error) {
                logger.write("Mail", logger.getContentErrorMessage(error));
                res.status(400).json({ error });
                return;
            }
        } catch (error) {
            logger.write("Mail", logger.getContentErrorMessage(error));
            const isDevelopment = process.env.NODE_ENV !== 'production';
            res.status(500).json({
                error: "Erreur interne du serveur",
                ...(isDevelopment && { details: error instanceof Error ? error.message : 'Erreur inconnue' })
            });
        }
    }

    private validateRequestSendContract(req: Request): { data?: SendContractRequest; error?: any } {
        const validator = this.validators(req.body, {
            to: { type: "email", required: true },
            body: { type: "string", required: false },
            contractData: { type: "string", required: false }
        });

        if (validator.errors.length > 0) {
            return { error: validator.errors };
        }

        return { data: validator.data as SendContractRequest };
    }

    private buildContractData(rawContractData?: string): Partial<Contract> {
        if (!rawContractData) {
            throw new Error("Données de contrat manquantes");
        }

        const parsedData: Partial<Contract> = JSON.parse(rawContractData);
        const contractData: Partial<Contract> = { ...parsedData };

        const dateFields: (keyof Contract)[] = [
            "startDate",
            "endDate",
            "percentReturnToSubstituteBeforeDate",
            "doneAt",
            "replacedBirthday",
            "substituteBirthday",
        ];

        for (const field of dateFields) {
            const value = (contractData as any)[field];

            if (value === "" || value === null || value === undefined) {
                delete (contractData as any)[field];
                continue;
            }

            if (typeof value === "string") {
                const d = new Date(value);
                if (isNaN(d.getTime())) {
                    delete (contractData as any)[field];
                } else {
                    (contractData as any)[field] = d;
                }
            }
        }

        const numericFields: (keyof Contract)[] = [
            "percentReturnToSubstitute",
            "nonInstallationRadius",
            "replacedOrderDepartmentNumber",
            "substituteOrderDepartmentNumber",
        ];

        for (const field of numericFields) {
            const value = (contractData as any)[field];

            if (value === "" || value === null || value === undefined) {
                delete (contractData as any)[field];
                continue;
            }

            const n = typeof value === "string" ? Number(value) : value;

            if (typeof n !== "number" || isNaN(n)) {
                delete (contractData as any)[field];
            } else {
                (contractData as any)[field] = n;
            }
        }

        return contractData;
    }

    private async createOrLoadContract(contractData: Partial<Contract>): Promise<{ contract: Contract, created: boolean }> {
        const contractRepo = getRepo(Contract);

        if (!contractData.id || !contractData.token) {
            const contract = contractRepo.create({
                token: jwt.sign({ contractId: contractData?.id }, process.env.JWT_PRIVATE as string),
                isPublic: true,
                ...contractData
            });

            await contractRepo.save(contract);

            return { contract: contract as Contract, created: true };
        }

        const existingContract = await contractRepo.findOne({ where: { id: contractData.id } });

        if (!existingContract) {
            throw new Error("Contrat introuvable");
        }

        // Explicitly cast existingContract as Contract to satisfy type checker
        return { contract: existingContract as Contract, created: false };
    }

    private prepareMailOptions(data: SendContractRequest, contractToken: string, file?: Express.Multer.File): SendMailOptions {
        const signeBackLink = `http://${process.env.FRONTEND_URL}?signe-back=${contractToken}`;

        const mailOptions: SendMailOptions = {
            from: `"Kiné de poce" <${process.env.MAIL_USER}>`,
            to: data.to,
            subject: "Vous avez reçu un contrat de remplacement",
            text: "Contrat de remplacement proposé. Vous trouverez le contrat en pièce jointe.\n\n" + (data.body || "") + "\n\nPour signer le contrat, cliquez sur le lien suivant : " + signeBackLink,
        };

        if (file) {
            this.logFileInfo(file);

            if (!this.isValidFile(file)) {
                throw new Error("Le fichier reçu est vide ou corrompu");
            }

            mailOptions.attachments = [{
                filename: file.originalname || 'contract.pdf',
                content: file.buffer,
                contentType: file.mimetype || 'application/pdf'
            }];
        }

        return mailOptions;
    }

    private logFileInfo(file: Express.Multer.File): void {
        if (process.env.NODE_ENV === 'development') {
            logger.write("Mail", `File received: ${file.originalname}, Size: ${file.buffer?.length || 0} bytes, Type: ${file.mimetype}`);
        }
    }

    private isValidFile(file: Express.Multer.File): boolean {
        return !!(file.buffer && file.buffer.length > 0);
    }

}
export const mailController = new MailController()