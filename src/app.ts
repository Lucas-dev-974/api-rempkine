import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { JWTMiddleware } from "./middleware/JWTMiddleware";
import { AppDataSource } from "./dataSource";
import { setRoutes } from "./routes/index";

dotenv.config();

AppDataSource.initialize().then(() => {
  const PORT = process.env.PORT || 3001;
  const app = express();

  const corsOptions = {
    origin: "*",
    methods: "DELETE,PUT,PATCH,GET,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  app.use(express.urlencoded({ extended: true, limit: "20mb" }));
  app.use(express.json({ limit: "20mb" }));

  app.use(JWTMiddleware.checkBearerToken);

  setRoutes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
