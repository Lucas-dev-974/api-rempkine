"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = setRoutes;
var auth_1 = __importDefault(require("./auth"));
var contract_1 = __importDefault(require("./contract"));
function setRoutes(app) {
    app.get("/", function (req, res) {
        res.send("rempkiné  server api." + process.env.CORS_ORIGIN);
    });
    app.use("/api/auth", auth_1.default);
    app.use("/api/contract", contract_1.default);
}
//# sourceMappingURL=index.js.map