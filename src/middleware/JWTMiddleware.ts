import { Request, Response, NextFunction } from "express";
import { UtilsAuthentication } from "../utils/auth.util";
import _public from "../routes/public";
import { error } from "console";

export class JWTMiddleware {
  static checkBearerToken(req: Request, res: Response, next: NextFunction) {
    // console.log("path", req.path);
    // console.log(req.path, req.method);
    // console.log(JWTMiddleware.isPublic(req.method, req.path));

    if (JWTMiddleware.isPublic(req.method, req.path)) {
      console.log(`Route publique autorisée: ${req.method} ${req.path}`);
      return next();
    }

    const token = UtilsAuthentication.getBearerToken(req);

    // console.log("before check token", UtilsAuthentication.checkToken(token));

    if (typeof UtilsAuthentication.checkToken(token) == "object") {
      res.locals.user = UtilsAuthentication.checkToken(token);

      // console.log("token: ", token);
      // console.log("user: ", res.locals.user);

      return next();
    } else {
      return res.status(401).json({ error: "Veuillez vous reconnecter." });
    }
  }

  static isPublic(method: string, path: string) {
    return _public.some((route) => {
      if (route.method !== method) return false;

      // Si la route contient des paramètres dynamiques (avec :)
      if (route.path.includes(':')) {
        // Convertir la route en regex pour matcher les paramètres
        const routePattern = route.path
          .replace(/:[^/]+/g, '[^/]+') // Remplacer :param par [^/]+
          .replace(/\//g, '\\/'); // Échapper les slashes
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(path);
      } else {
        // Pour les routes statiques, utiliser includes comme avant
        return route.path.includes(path);
      }
    });
  }
}
