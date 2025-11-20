import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { Request, Response } from "express";
import { Controller } from "./BaseController";
import { logger } from "../utils/Logger";

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
            logger.write("Mail", logger.getContentErrorMessage(error));
            const isDevelopment = process.env.NODE_ENV !== 'production';
            res.status(500).json({
                error: "Erreur interne du serveur",
                ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
            });
        }
    }

    private validateRequestSendContract(req: Request): { data?: SendContractRequest; error?: any } {
        const validator = this.validators(req.body, {
            to: { type: "email", required: true },
            body: { type: "string", required: false }
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
        if (process.env.NODE_ENV === 'development') {
            logger.write("Mail", `Fichier reçu: ${file.originalname}, Taille: ${file.buffer?.length || 0} octets, Type: ${file.mimetype}`);
        }
    }

    private isValidFile(file: Express.Multer.File): boolean {
        return !!(file.buffer && file.buffer.length > 0);
    }

    private cleanupMemory(file?: Express.Multer.File): void {
        // Le garbage collector de Node.js gère automatiquement la mémoire
        // Pas besoin de supprimer manuellement le buffer
    }

}
export const mailController = new MailController()