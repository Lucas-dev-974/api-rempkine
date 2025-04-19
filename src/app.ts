import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

// import { AppDataSource } from "./database/ormconfig";
import express from "express";
import { setRoutes } from "./routes/index";
import { AppDataSource } from "./data-source";
import { JWTMiddleware } from "./middleware/JWT.middleware";
import cors from "cors";

import fs from "fs";
import path from "path";
import { AppDataInitialisation } from "./middleware/AppDataInitialisation";

const logFilePath = path.join(__dirname, "../AppDataSource.log");

// AppDataSource.initialize()
//   .then(async () => {
//     const logMessage = `AppDataSource initialized successfully at ${new Date().toISOString()}\n`;
//     fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
//   })
//   .catch((error) => {
//     const logMessage = `AppDataSource initialization failed at ${new Date().toISOString()}: ${
//       error.message
//     }\n`;
//     fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
//     console.log(error);
//   });

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(AppDataInitialisation.init);
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(JWTMiddleware.checkBearerToken);

setRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
