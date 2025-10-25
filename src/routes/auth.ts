import { authController } from "../controllers/AuthController";
import express, { Router } from "express";

const AuthRouter: Router = express.Router();

AuthRouter.use(express.json({ limit: "20mb" }));
AuthRouter.patch("/", authController.register);
AuthRouter.post("/", authController.login);
AuthRouter.get("/me", authController.me);

export default AuthRouter;
