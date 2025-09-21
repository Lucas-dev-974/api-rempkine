import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { Request, Response } from "express";
import { Controller } from "./BaseController";

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
    body?: string
}

class MailController extends Controller {
    private transporter: Transporter;

    constructor() {
        super();
        this.transporter = this.initializeTransporter();
    }

    private initializeTransporter(): Transporter {
        const config: MailConfig = {
            host: process.env.SMTP_HOST!,
            port: parseInt(process.env.SMTP_PORT!),
            secure: true,
            auth: {
                user: process.env.MAIL_USER!,
                pass: process.env.MAIL_PASS!,
            },
        };

        console.log("Initialisation du transporteur mail:", {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.auth.user,
        });

        return nodemailer.createTransport(config);
    }

    public sendContract = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validation des données d'entrée
            const validationResult = this.validateRequestSendContract(req);
            if (validationResult.error) {
                res.status(400).json(validationResult.error);
                return;
            }

            // Préparation des options d'email
            const mailOptions = this.prepareMailOptions(validationResult.data, req.file);

            // Envoi de l'email
            const info = await this.transporter.sendMail(mailOptions);

            // Nettoyage de la mémoire
            this.cleanupMemory(req.file);

            res.status(200).json({
                message: "Email envoyé avec succès",
                messageId: info.messageId
            });

        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            res.status(500).json({
                error: "Erreur interne du serveur",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private validateRequestSendContract(req: Request): { data?: SendContractRequest; error?: any } {
        const validator = this.validators(req.body, {
            from: { type: "string", required: true },
            to: { type: "string", required: true },
            body: { type: "string" }

        });

        if (validator.errors.length > 0) {
            return { error: validator.errors };
        }

        return { data: validator.data as SendContractRequest };
    }

    private prepareMailOptions(data: SendContractRequest, file?: Express.Multer.File): SendMailOptions {
        const mailOptions: SendMailOptions = {
            from: `"Kiné de poce" <${process.env.MAIL_USER}>`,
            to: data.to,
            subject: "Vous avez reçu un contrat de remplacement",
            text: "Contrat de remplacement proposé. Retrouvez le contrat en pièce jointe. \n\n" + data.body,
        };

        if (file) {
            this.logFileInfo(file);

            if (!this.isValidFile(file)) {
                throw new Error("Le fichier reçu est vide ou corrompu");
            }

            mailOptions.attachments = [{
                filename: file.originalname || 'contrat.pdf',
                content: file.buffer,
                contentType: file.mimetype || 'application/pdf'
            }];
        }

        return mailOptions;
    }

    private logFileInfo(file: Express.Multer.File): void {
        console.log("=== DEBUG FICHIER ===");
        console.log("Nom du fichier:", file.originalname);
        console.log("Taille du buffer:", file.buffer?.length || 0, "octets");
        console.log("Type MIME:", file.mimetype);
        console.log("Taille du fichier:", file.size || 0, "octets");
        console.log("====================");
    }

    private isValidFile(file: Express.Multer.File): boolean {
        return !!(file.buffer && file.buffer.length > 0);
    }

    private cleanupMemory(file?: Express.Multer.File): void {
        if (file) {
            console.log("Fichier traité et envoyé, nettoyage de la mémoire...");
            delete file.buffer;
        }
    }

}
export const mailController = new MailController()