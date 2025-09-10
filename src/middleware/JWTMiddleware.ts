import { Request, Response, NextFunction } from "express";
import { UtilsAuthentication } from "../utils/auth.util";
import _public from "../routes/public";
import { error } from "console";

export class JWTMiddleware {
  static checkBearerToken(req: Request, res: Response, next: NextFunction) {
    // console.log("path");
    // console.log(req.path, req.method);
    // console.log(JWTMiddleware.isPublic(req.method, req.path));

    if (JWTMiddleware.isPublic(req.method, req.path)) return next();

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
    return _public.some(
      (route) => route.method == method && route.path.includes(path)
    );
  }
}
