import { Request, Response, NextFunction } from "express";
import { UtilsAuthentication } from "../utils/auth.util";
import _public from "../routes/public";

export class JWTMiddleware {
  static checkBearerToken(req: Request, res: Response, next: NextFunction) {
    if (JWTMiddleware.isPublic(req.method, req.path)) {
      return next();
    }

    const token = UtilsAuthentication.getBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: "Token manquant. Veuillez vous reconnecter." });
    }

    const tokenResult = UtilsAuthentication.checkToken(token);

    // Vérifier que le token est valide (objet avec id et email)
    if (tokenResult && typeof tokenResult === 'object' && 'id' in tokenResult && 'email' in tokenResult) {
      res.locals.user = tokenResult;
      return next();
    } else {
      return res.status(401).json({ error: "Token invalide ou expiré. Veuillez vous reconnecter." });
    }
  }

  static isPublic(method: string, path: string) {
    return _public.some((route) => {
      if (route.method !== method) return false;

      // Normaliser les chemins (enlever le trailing slash)
      const normalizedRoutePath = route.path.replace(/\/$/, '');
      const normalizedPath = path.replace(/\/$/, '');

      // Si la route contient des paramètres dynamiques (avec :)
      if (normalizedRoutePath.includes(':')) {
        // Convertir la route en regex pour matcher les paramètres
        const routePattern = normalizedRoutePath
          .replace(/:[^/]+/g, '[^/]+') // Remplacer :param par [^/]+
          .replace(/\//g, '\\/'); // Échapper les slashes
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(normalizedPath);
      } else {
        // Pour les routes statiques, utiliser une comparaison exacte
        return normalizedRoutePath === normalizedPath;
      }
    });
  }
}
