import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

// import { AppDataSource } from "./database/ormconfig";
import express from "express";
import { setRoutes } from "./routes/index";
import { AppDataSource } from "./data-source";
import { JWTMiddleware } from "./middleware/JWT.middleware";
import cors from "cors";

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    const corsOptions = {
      origin: process.env.CORS_ORIGIN,
      optionsSuccessStatus: 200,
    };

    app.use(cors(corsOptions));

    const PORT = process.env.PORT || 8080;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(JWTMiddleware.checkBearerToken);

    setRoutes(app);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
