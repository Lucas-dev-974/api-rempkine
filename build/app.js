"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var JWT_middleware_1 = require("./middleware/JWT.middleware");
var data_source_1 = require("./data-source");
var index_1 = require("./routes/index");
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
data_source_1.AppDataSource.initialize().then(function () {
    var PORT = process.env.PORT || 3001;
    var app = (0, express_1.default)();
    var corsOptions = {
        origin: "*",
        methods: "DELETE,PUT,PATCH,GET,POST,OPTIONS",
        allowedHeaders: "Content-Type,Authorization",
        optionsSuccessStatus: 200,
    };
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    app.use(JWT_middleware_1.JWTMiddleware.checkBearerToken);
    (0, index_1.setRoutes)(app);
    app.listen(PORT, function () {
        console.log("Server is running on http://localhost:".concat(PORT));
    });
});
//# sourceMappingURL=app.js.map