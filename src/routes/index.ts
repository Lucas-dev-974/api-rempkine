import { Application, Request, Response } from "express";
import express from "express";
import { Multer } from "multer";
import AuthRouter from "./auth";
import ContractRouter from "./contract";
import MailRouter from "./mail";

export function setRoutes(app: Application, upload: Multer): void {
  app.get("/", (req: Request, res: Response) => {
    res.send("rempkiné  server api." + process.env.CORS_ORIGIN);
  });

  // Route mail avec multer (pas de JSON middleware ici)
  app.use("/api/mail", MailRouter(upload))

  // Middleware JSON pour les routes qui n'ont pas besoin de fichiers
  app.use("/api/auth", express.json({ limit: "20mb" }), AuthRouter);
  app.use("/api/contract", express.json({ limit: "20mb" }), ContractRouter)
}
