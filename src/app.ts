import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import express from "express";
import { setRoutes } from "./routes/index";
import { JWTMiddleware } from "./middleware/JWT.middleware";
import { AppDataInitialisation } from "./middleware/AppDataInitialisation";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

app.options("*", cors());

app.use(AppDataInitialisation.init);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(JWTMiddleware.checkBearerToken);

setRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
