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
    console.log("Database connection established successfully.");
  })
  .catch((error) => console.log(error));

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

// Middleware pour vérifier la connexion à la base de données
app.use((req, res, next) => {
  if (!AppDataSource.isInitialized) {
    return res.status(503).json({
      message: "Database not initialized",
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }
  next();
});

setRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
