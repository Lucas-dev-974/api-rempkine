import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import express from "express";
import { setRoutes } from "./routes/index";
import { JWTMiddleware } from "./middleware/JWT.middleware";
import { AppDataInitialisation } from "./middleware/AppDataInitialisation";
import { AppDataSource } from "./data-source";

dotenv.config();

AppDataSource.initialize().then(() => {
  const PORT = process.env.PORT || 3001;
  const app = express();

  const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: "DELETE,PUT,GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // app.use(AppDataInitialisation.init);

  app.use(JWTMiddleware.checkBearerToken);

  setRoutes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
