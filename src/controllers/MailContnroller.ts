import nodemailer, { Transporter } from "nodemailer";
import { Request, Response } from "express";
import { Controller } from "./BaseController";

class MailController extends Controller {
    private transporter: Transporter;

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    public sendContract = async (req: Request, res: Response) => {
        const validator = this.validators(req, {
            from: { type: "string" },
            to: { type: "string" },
            token: { type: "string" }
        })

        if (validator.errors.length > 0) {
            return res.status(400).json(validator.errors)
        }

        const info = await this.transporter.sendMail({
            from: `"Mon App" <${process.env.MAIL_USER}>`,
            to: validator.data.to,
            subject: "Vous avez reçus un contrat de remplacement",
            text: "Contrat de remplacement proposé par .... retrouvez le contrat en pièce jointe.",
        });

        res.status(200).json({ message: "Email envoyé avec succès", info });


    }

}
export const mailController = new MailController()