import { Application, Request, Response } from "express";
import express from "express";
import AuthRouter from "./auth";
import ContractRouter from "./contract";
import MailRouter from "./mail";

export function setRoutes(app: Application): void {
  app.get("/", (req: Request, res: Response) => {
    res.send("rempkiné  server api." + process.env.CORS_ORIGIN);
  });

  app.use("/api/mail", MailRouter);

  app.use("/api/auth", express.json({ limit: "20mb" }), AuthRouter);
  app.use("/api/contract", express.json({ limit: "20mb" }), ContractRouter);
}
