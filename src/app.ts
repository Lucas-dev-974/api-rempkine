import cors from "cors";
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
    origin: [process.env.CORS_ORIGIN],
    methods: "DELETE,PUT,GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    optionsSuccessStatus: 200,
  };

  // app.use(
  //   cors({
  //     allowedHeaders: ["Content-Type"],
  //     origin: "*",
  //     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  //     preflightContinue: false,
  //   })
  // );

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // app.use(AppDataInitialisation.init);

  app.use(JWTMiddleware.checkBearerToken);

  setRoutes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
