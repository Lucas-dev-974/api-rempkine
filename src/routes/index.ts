import { Application, Request, Response } from "express";
import AuthRouter from "./auth";
import ContractRouter from "./contract";
import MailRouter from "./mail";

export function setRoutes(app: Application): void {
  app.get("/", (req: Request, res: Response) => {
    res.send("rempkiné  server api." + process.env.CORS_ORIGIN);
  });

  app.use("/api/auth", AuthRouter);
  app.use("/api/contract", ContractRouter);
  app.use("/api/mail", MailRouter)
}
