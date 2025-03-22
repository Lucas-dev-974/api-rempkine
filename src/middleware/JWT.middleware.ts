import { Request, Response, NextFunction } from "express";
import { UtilsAuthentication } from "../utils/auth.util";
import _public from "../routes/public";

export class JWTMiddleware {
  static checkBearerToken(req: Request, res: Response, next: NextFunction) {
    console.log("path");
    console.log(req.path, req.method);
    console.log(JWTMiddleware.isPublic(req.method, req.path));

    if (JWTMiddleware.isPublic(req.method, req.path)) return next();

    const token = UtilsAuthentication.getBearerToken(req);
    if (typeof UtilsAuthentication.checkToken(token) == "object") {
      res.locals.user = UtilsAuthentication.checkToken(token);
      return next();
    } else return res.status(401).json("Accès non autorisé.");
  }

  static isPublic(method: string, path: string) {
    return _public.some(
      (route) => route.method == method && route.path.includes(path)
    );
  }
}
