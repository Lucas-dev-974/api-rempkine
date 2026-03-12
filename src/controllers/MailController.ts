import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { Request, Response } from "express";
import { Controller } from "./BaseController";
import { logger } from "../utils/Logger";
import { getRepo } from "../dataSource";
import { Contract } from "../database/entity/Contract";

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
    contractAuth: {
        id: number;
        token: string;
    } | "";
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
            // Validate input data
            const validationResult = this.validateRequestSendContract(req);
            if (validationResult.error) {
                res.status(400).json(validationResult.error);
                return;
            }

            try {
                const contractAuth = JSON.parse(validationResult.data?.contractAuth as string);
                const contract = await getRepo(Contract).findOne({ where: { id: contractAuth?.id } });
                if (contract.token !== contractAuth?.token) {
                    res.status(400).json({ error: "Vous n'êtes pas autorisé à envoyer cet e-mail" });
                    return;
                }

                // Prepare email options
                const mailOptions = this.prepareMailOptions(validationResult.data, contract.token, req.file);

                // Send email
                const info = await this.transporter.sendMail(mailOptions);

                res.status(200).json({
                    message: "E-mail envoyé avec succès",
                    messageId: info.messageId
                });
            } catch (error) {
                logger.write("Mail", "teste");
                logger.write("Mail", logger.getContentErrorMessage(error));
                // res.status(400).json({ error: "Erreur lors de la validation du contrat" });
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
            contractAuth: { type: "string", required: true }
        });

        if (validator.errors.length > 0) {
            return { error: validator.errors };
        }

        return { data: validator.data as SendContractRequest };
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