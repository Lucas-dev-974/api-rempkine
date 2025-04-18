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
  .then(async () => {})
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
    return res.status(503).json({ message: "Database not initialized" });
  }
  next();
});

setRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
