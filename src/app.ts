import express, { Request, Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer, { FileFilterCallback, Multer } from "multer";
import path from "path";

import { JWTMiddleware } from "./middleware/JWTMiddleware";
import { AppDataSource } from "./dataSource";
import { setRoutes } from "./routes/index";

// Configuration des variables d'environnement
dotenv.config();

interface CorsOptions {
  origin: string;
  methods: string;
  allowedHeaders: string;
  optionsSuccessStatus: number;
}

interface MulterConfig {
  storage: multer.StorageEngine;
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => void;
  limits: {
    fileSize: number;
  };
}

class AppConfig {
  private static readonly ALLOWED_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];
  private static readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  private static readonly DEFAULT_PORT = 3001;

  static createCorsOptions(): CorsOptions {
    return {
      origin: "*",
      methods: "DELETE,PUT,PATCH,GET,POST,OPTIONS",
      allowedHeaders: "Content-Type,Authorization",
      optionsSuccessStatus: 200,
    };
  }

  static createMulterConfig(): MulterConfig {
    return {
      storage: multer.memoryStorage(),
      fileFilter: this.createFileFilter(),
      limits: {
        fileSize: this.MAX_FILE_SIZE,
      },
    };
  }

  private static createFileFilter(): (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => void {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const ext = path.extname(file.originalname).toLowerCase();

      if (this.ALLOWED_FILE_EXTENSIONS.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Type de fichier non autorisé. Extensions autorisées: ${this.ALLOWED_FILE_EXTENSIONS.join(", ")}`));
      }
    };
  }

  static getPort(): number {
    return parseInt(process.env.PORT || this.DEFAULT_PORT.toString());
  }
}

class App {
  private app: Application;
  private upload: Multer;

  constructor() {
    this.app = express();
    this.upload = multer(AppConfig.createMulterConfig());
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(cors(AppConfig.createCorsOptions()));

    // JWT Middleware
    this.app.use(JWTMiddleware.checkBearerToken);
  }

  public async start(): Promise<void> {
    try {
      // Initialisation de la base de données
      await AppDataSource.initialize();
      console.log("Base de données initialisée avec succès");

      // Configuration des routes
      setRoutes(this.app, this.upload);

      // Démarrage du serveur
      const port = AppConfig.getPort();
      this.app.listen(port, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
        console.log(`📧 Service d'envoi d'emails activé`);
        console.log(`📁 Gestion des fichiers configurée (max: 20MB)`);
      });

    } catch (error) {
      console.error("❌ Erreur lors du démarrage de l'application:", error);
      process.exit(1);
    }
  }
}

// Démarrage de l'application
const app = new App();
app.start();
