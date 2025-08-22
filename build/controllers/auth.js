"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
var auth_util_1 = require("../utils/auth.util");
var User_1 = require("../database/entity/User");
var data_source_1 = require("../data-source");
var validatorjs_1 = __importDefault(require("validatorjs"));
var path_1 = __importDefault(require("path"));
var Logger_1 = require("../utils/Logger");
var logFilePath = path_1.default.join(__dirname, "../Authentication.log");
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.prototype.login = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var validator, _a, email, password, userRepository, user, isPasswordValid, token, error_1, detailedError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validator = new validatorjs_1.default(req.body, {
                            email: "required|email",
                            password: "string|required",
                        });
                        if (validator.fails()) {
                            res.status(400).send(validator.errors.all());
                            return [2 /*return*/];
                        }
                        _a = req.body, email = _a.email, password = _a.password;
                        userRepository = (0, data_source_1.getRepo)(User_1.User);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, userRepository.findOne({ where: { email: email } })];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            res.status(400).send({ error: "Vos identifiants sont incorrects." });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, auth_util_1.UtilsAuthentication.check(password, user.password)];
                    case 3:
                        isPasswordValid = _b.sent();
                        if (!isPasswordValid) {
                            res.status(400).send({ error: "Vos identifiants sont incorrects." });
                            return [2 /*return*/];
                        }
                        token = auth_util_1.UtilsAuthentication.generateToken({ email: email, id: user.id });
                        res.status(200).send({
                            user: user,
                            token: token,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        detailedError = {
                            message: error_1.message,
                            stack: error_1.stack,
                            name: error_1.name,
                            code: error_1.code || "UNKNOWN_ERROR",
                        };
                        Logger_1.logger.write("Authentication", Logger_1.logger.getContentErrorMessage(error_1));
                        res.status(500).send({
                            error: "Une erreur c'est produite, veuillez réesayer ultérieurement",
                            detailedError: detailedError,
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.register = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var validator, _a, fullname, email, password, birthday, bornLocation, department, orderNumber, personalAdress, officeAdress, status, phoneNumber, gender, userRepository, existingUser, user, _b, _c, error_2, detailedError;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        validator = new validatorjs_1.default(req.body, {
                            email: "required|email",
                            fullname: "string|required",
                            password: "string|required",
                            birthday: "date|required",
                            bornLocation: "string|required",
                            department: "string|required",
                            orderNumber: "numeric|required",
                            personalAdress: "string|required",
                            officeAdress: "string",
                            status: "string|required",
                            phoneNumber: "string|required",
                            gender: "string|required",
                        });
                        if (validator.fails())
                            res.status(400).send(validator.errors.all());
                        _a = req.body, fullname = _a.fullname, email = _a.email, password = _a.password, birthday = _a.birthday, bornLocation = _a.bornLocation, department = _a.department, orderNumber = _a.orderNumber, personalAdress = _a.personalAdress, officeAdress = _a.officeAdress, status = _a.status, phoneNumber = _a.phoneNumber, gender = _a.gender;
                        userRepository = (0, data_source_1.getRepo)(User_1.User);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, userRepository.findOne({ where: { email: email } })];
                    case 2:
                        existingUser = _e.sent();
                        if (existingUser) {
                            res.status(400).send({
                                error: "Un compte avec l'addresse email que vous avez renseigner existe déjà, veuillez vous connecté.",
                            });
                            return [2 /*return*/];
                        }
                        _c = (_b = userRepository).create;
                        _d = {
                            email: email
                        };
                        return [4 /*yield*/, auth_util_1.UtilsAuthentication.hash(password)];
                    case 3:
                        user = _c.apply(_b, [(_d.password = _e.sent(),
                                _d.fullname = fullname,
                                _d.birthday = birthday,
                                _d.bornLocation = bornLocation,
                                _d.department = department,
                                _d.orderNumber = orderNumber,
                                _d.personalAdress = personalAdress,
                                _d.officeAdress = officeAdress,
                                _d.status = status,
                                _d.phoneNumber = phoneNumber,
                                _d.gender = gender,
                                _d)]);
                        // Save the user to the database
                        return [4 /*yield*/, userRepository.save(user)];
                    case 4:
                        // Save the user to the database
                        _e.sent();
                        res.status(201).send({
                            user: user,
                            token: auth_util_1.UtilsAuthentication.generateToken({ email: email, id: user.id }),
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _e.sent();
                        detailedError = {
                            message: error_2.message,
                            stack: error_2.stack,
                            name: error_2.name,
                            code: error_2.code || "UNKNOWN_ERROR",
                        };
                        Logger_1.logger.write("Authentication", detailedError.name + detailedError.message);
                        res.status(500).send({
                            error: "Une erreur c'est produite, veuillez réesayer ultérieurement",
                            detailedError: detailedError,
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.me = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bearer, tokenData, userRepository, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bearer = auth_util_1.UtilsAuthentication.getBearerToken(req);
                        if (!bearer) {
                            res
                                .status(400)
                                .send({ error: "token invalide, veuillez vous reconnecté." });
                            return [2 /*return*/];
                        }
                        tokenData = auth_util_1.UtilsAuthentication.checkToken(bearer);
                        userRepository = (0, data_source_1.getRepo)(User_1.User);
                        return [4 /*yield*/, userRepository.findOne({
                                where: { email: tokenData.email },
                            })];
                    case 1:
                        user = _a.sent();
                        res.status(200).send(user);
                        return [2 /*return*/];
                }
            });
        });
    };
    return AuthController;
}());
exports.authController = new AuthController();
//# sourceMappingURL=auth.js.map