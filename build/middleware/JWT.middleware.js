"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTMiddleware = void 0;
var auth_util_1 = require("../utils/auth.util");
var public_1 = __importDefault(require("../routes/public"));
var JWTMiddleware = /** @class */ (function () {
    function JWTMiddleware() {
    }
    JWTMiddleware.checkBearerToken = function (req, res, next) {
        // console.log("path");
        // console.log(req.path, req.method);
        // console.log(JWTMiddleware.isPublic(req.method, req.path));
        if (JWTMiddleware.isPublic(req.method, req.path))
            return next();
        var token = auth_util_1.UtilsAuthentication.getBearerToken(req);
        // console.log("before check token", UtilsAuthentication.checkToken(token));
        if (typeof auth_util_1.UtilsAuthentication.checkToken(token) == "object") {
            res.locals.user = auth_util_1.UtilsAuthentication.checkToken(token);
            // console.log("token: ", token);
            console.log("user: ", res.locals.user);
            return next();
        }
        else {
            return res.status(401).json({ error: "Veuillez vous reconnecter." });
        }
    };
    JWTMiddleware.isPublic = function (method, path) {
        return public_1.default.some(function (route) { return route.method == method && route.path.includes(path); });
    };
    return JWTMiddleware;
}());
exports.JWTMiddleware = JWTMiddleware;
//# sourceMappingURL=JWT.middleware.js.map