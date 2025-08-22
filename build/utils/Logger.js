"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var logger = /** @class */ (function () {
    function logger() {
    }
    logger.write = function (filename, content) {
        var logFilePath = path_1.default.join(__dirname, "../logs/" + filename + ".log");
        fs_1.default.appendFileSync(logFilePath, content, { encoding: "utf8" });
    };
    logger.getContentErrorMessage = function (error) {
        var detailedError = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code || "UNKNOWN_ERROR",
        };
        return ("------------------------------------" +
            detailedError.name +
            "------------------------------------\n" +
            detailedError.message +
            "\n" +
            detailedError.stack +
            "\n------------------------------------------------------------------------");
    };
    return logger;
}());
exports.logger = logger;
//# sourceMappingURL=Logger.js.map