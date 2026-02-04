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
            throw new Error("Missing SMTP environment variables. Check SMTP_HOST, SMTP_PORT, MAIL_USER and MAIL_PASS.");
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
            throw new Error("SMTP_PORT must be a valid number.");
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
                    res.status(400).json({ error: "You are not authorized to send this email" });
                    return;
                }

                // Prepare email options
                const mailOptions = this.prepareMailOptions(validationResult.data, contract.token, req.file);

                // Send email
                const info = await this.transporter.sendMail(mailOptions);

                res.status(200).json({
                    message: "Email sent successfully",
                    messageId: info.messageId
                });
            } catch (error) {
                logger.write("Mail", logger.getContentErrorMessage(error));
                res.status(400).json({ error: "Error validating contract" });
                return;
            }


        } catch (error) {
            logger.write("Mail", logger.getContentErrorMessage(error));
            const isDevelopment = process.env.NODE_ENV !== 'production';
            res.status(500).json({
                error: "Internal server error",
                ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
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
            subject: "You have received a replacement contract",
            text: "Replacement contract proposed. Find the contract in the attachment. \n\n" + (data.body || "") + "\n\nTo sign the contract, click on the following link: " + signeBackLink,
        };

        if (file) {
            this.logFileInfo(file);

            if (!this.isValidFile(file)) {
                throw new Error("The received file is empty or corrupted");
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