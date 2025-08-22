import { JWTMiddleware } from "./middleware/JWT.middleware";
import { AppDataSource } from "./data-source";
import { setRoutes } from "./routes/index";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(JWTMiddleware.checkBearerToken);

  setRoutes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
