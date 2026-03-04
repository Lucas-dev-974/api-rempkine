import express, { Request, Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer, { FileFilterCallback, Multer } from "multer";
import path from "path";

import { JWTMiddleware } from "./middleware/JWTMiddleware";
import { AppDataSource } from "./dataSource";
import { setRoutes } from "./routes/index";
import { logger } from "./utils/Logger";

// Configuration des variables d'environnement
dotenv.config();

interface CorsOptions {
  origin: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods: string | string[];
  allowedHeaders: string | string[];
  optionsSuccessStatus: number;
  credentials?: boolean;
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
    // En production, utiliser la variable d'environnement CORS_ORIGIN
    // Si non définie, utiliser "*" pour le développement
    const corsOrigin = process.env.CORS_ORIGIN;

    let origin: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);

    if (corsOrigin) {
      // Si plusieurs origines sont séparées par des virgules
      if (corsOrigin.includes(',')) {
        origin = corsOrigin.split(',').map(o => o.trim());
      } else {
        origin = corsOrigin.trim();
      }
    } else {
      // En développement, permettre toutes les origines
      origin = "*";
    }

    return {
      origin: origin,
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
    const corsOptions = AppConfig.createCorsOptions();

    // Log de la configuration CORS pour le débogage
    const corsOrigin = process.env.CORS_ORIGIN || "*";
    logger.write("App", `Configuration CORS - CORS_ORIGIN: ${corsOrigin}\n`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔧 CORS Origin configuré: ${corsOrigin}`);
    }

    // Middleware CORS - doit être en premier, avant tout autre middleware
    this.app.use(cors(corsOptions));

    // JWT Middleware - les requêtes OPTIONS sont déjà gérées par CORS et passent dans le middleware JWT
    this.app.use(JWTMiddleware.checkBearerToken);
  }

  public async start(): Promise<void> {
    try {
      // Initialisation de la base de données
      await AppDataSource.initialize();
      logger.write("App", "Base de données initialisée avec succès\n");

      // Configuration des routes
      setRoutes(this.app, this.upload);

      // Démarrage du serveur
      const port = AppConfig.getPort();
      this.app.listen(port, () => {
        logger.write("App", `Serveur démarré sur http://localhost:${port}\n`);
        logger.write("App", "Service d'envoi d'emails activé\n");
        logger.write("App", "Gestion des fichiers configurée (max: 20MB)\n");
        // Afficher aussi dans la console pour le développement
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
          console.log(`📧 Service d'envoi d'emails activé`);
          console.log(`📁 Gestion des fichiers configurée (max: 20MB)`);
        }
      });

    } catch (error) {
      logger.write("App", logger.getContentErrorMessage(error));
      console.error("❌ Erreur lors du démarrage de l'application:", error);
      process.exit(1);
    }
  }
}

const app = new App();
app.start();
