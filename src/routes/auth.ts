import { authController } from "../controllers/auth";
import express, { Router } from "express";

const AuthRouter: Router = express.Router();

AuthRouter.patch("/", authController.register);
AuthRouter.post("/", authController.login);
AuthRouter.get("/me", authController.me);

export default AuthRouter;
