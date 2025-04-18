import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import fs from "fs";
import path from "path";

const logFilePath = path.join(__dirname, "../AppDataSource.log");

export class AppDataInitialisation {
  static async init(req: Request, res: Response, next: NextFunction) {
    AppDataSource.initialize()
      .then(async () => {
        const logMessage = `AppDataSource initialized successfully at ${new Date().toISOString()}\n`;
        fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
        next();
      })
      .catch((error) => {
        const logMessage = `AppDataSource initialization failed at ${new Date().toISOString()}: ${
          error.message
        }\n`;
        fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
        console.log(error);
        res.send({
          error: "error database",
          type: process.env.DB_TYPE as any,
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || "5432", 10),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        });
      });
  }
}
