import { contractController } from "../controllers/contract";
import express, { Router } from "express";
import { mailController } from "../controllers/MailContnroller";

const MailRouter: Router = express.Router();

MailRouter.post("/send-contract", mailController.sendContract);

export default MailRouter;
