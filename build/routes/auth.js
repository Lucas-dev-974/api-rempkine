"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var auth_1 = require("../controllers/auth");
var express_1 = __importDefault(require("express"));
var AuthRouter = express_1.default.Router();
AuthRouter.patch("/", auth_1.authController.register);
AuthRouter.post("/", auth_1.authController.login);
AuthRouter.get("/me", auth_1.authController.me);
exports.default = AuthRouter;
//# sourceMappingURL=auth.js.map