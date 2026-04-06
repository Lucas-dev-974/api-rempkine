import { mailController } from "../controllers/MailController";
import express, { Router } from "express";
import { upload } from "../multerUpload";

const MAX_BUG_SCREENSHOTS = 15;

const MailRouter: Router = express.Router();

MailRouter.use(express.urlencoded());
MailRouter.post("/send-contract", upload.single("contractFile"), mailController.sendContract);
MailRouter.post("/report-bug", upload.array("screenshots", MAX_BUG_SCREENSHOTS), mailController.reportBug);

export default MailRouter;
