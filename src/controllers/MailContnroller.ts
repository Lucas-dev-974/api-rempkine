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


}
export const mailController = new MailController()