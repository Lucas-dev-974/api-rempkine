import { Application, Request, Response } from "express";
import AuthRouter from "./auth";
import ContractRouter from "./contract";

export function setRoutes(app: Application): void {
  app.get("/", (req: Request, res: Response) => {
    res.send("rempkiné api server.");
  });

  app.use("/api/auth", AuthRouter);
  app.use("/api/contract", ContractRouter);
}
