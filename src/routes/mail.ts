import { mailController } from "../controllers/MailController";
import express, { Router } from "express";
import { Multer } from "multer";


const MailRouter = (upload: Multer): Router => {

    const router = express.Router();

    // Middleware pour parser les données du formulaire (nécessaire pour req.body)
    router.use(express.urlencoded());

    router.post("/send-contract", upload.single('contractFile'), mailController.sendContract);

    return router;
};

export default MailRouter;
