"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractController = void 0;
var BaseController_1 = require("./BaseController");
var Contract_1 = require("../database/entity/Contract");
var User_1 = require("../database/entity/User");
var data_source_1 = require("../data-source");
var typeorm_1 = require("typeorm");
var ContractController = /** @class */ (function (_super) {
    __extends(ContractController, _super);
    function ContractController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.contractValidationPattern = {
            id: { type: "string" },
            authorEmail: { type: "email" },
            authorName: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            percentReturnToSubstitute: { type: "string" },
            percentReturnToSubstituteBeforeDate: { type: "date" },
            nonInstallationRadius: { type: "string" },
            conciliationCDOMK: { type: "string" },
            doneAtLocation: { type: "string" },
            doneAtDate: { type: "date" },
            // ------------------- Replaced kinesitherapist -------------------
            replacedGender: { type: "string" },
            replacedEmail: { type: "email" },
            replacedName: { type: "string" },
            replacedBirthday: { type: "date" },
            replacedBirthdayLocation: { type: "string" },
            replacedOrderDepartement: { type: "string" },
            replacedOrderDepartmentNumber: { type: "string" },
            replacedProfessionnalAddress: { type: "string" },
            // ------------------- Substitute kinesitherapist -------------------
            substituteGender: { type: "string" },
            substituteEmail: { type: "email" },
            substituteName: { type: "string" },
            substituteBirthday: { type: "date" },
            substituteBirthdayLocation: { type: "string" },
            substituteOrderDepartement: { type: "string" },
            substituteOrderDepartmentNumber: { type: "string" },
            substituteAdress: { type: "string" },
            replacedSignatureDataUrl: { type: "string" },
            substituteSignatureDataUrl: { type: "string" },
        };
        _this.create = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validator, user, contract, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = this.validators(req.body, this.contractValidationPattern);
                        if (validator.errors.length > 0) {
                            return [2 /*return*/, res.status(400).json({ error: validator.errors })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(User_1.User).findOneBy({ id: res.locals.user.id })];
                    case 2:
                        user = _a.sent();
                        contract = (0, data_source_1.getRepo)(Contract_1.Contract).create(__assign({}, validator.data));
                        contract.user = user;
                        return [4 /*yield*/, (0, data_source_1.getRepo)(Contract_1.Contract).save(contract)];
                    case 3:
                        _a.sent();
                        res.status(201).json(contract);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.log(error_1);
                        res.status(500).json("Error creating contract.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.update = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validator, contractData, contract, updatedContract, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = this.validators(req.body, this.contractValidationPattern);
                        if (validator.errors.length > 0) {
                            return [2 /*return*/, res.status(400).json({ error: validator.errors })];
                        }
                        contractData = validator.data;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(Contract_1.Contract).findOne({
                                where: { id: contractData.id },
                                relations: ["user"]
                            })];
                    case 2:
                        contract = _a.sent();
                        if (!contract) {
                            res.status(404).send("Contract not found.");
                            return [2 /*return*/];
                        }
                        if (contract.user.id !== res.locals.user.id) {
                            res.status(403).send("You are not allowed to update this contract.");
                            return [2 /*return*/];
                        }
                        updatedContract = (0, data_source_1.getRepo)(Contract_1.Contract).merge(contract, contractData);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(Contract_1.Contract).save(updatedContract)];
                    case 3:
                        _a.sent();
                        res.status(200).send(contract);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.log(error_2);
                        res.status(500).send("Error deleting contract.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.delete = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validator, contract, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = this.validators(req.params, this.contractValidationPattern);
                        if (validator.errors.length > 0) {
                            return [2 /*return*/, res.status(400).json({ error: validator.errors })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(Contract_1.Contract).findOne({
                                where: { id: validator.data.id, },
                                relations: ["user"]
                            })];
                    case 2:
                        contract = _a.sent();
                        if (contract.user.id !== res.locals.user.id) {
                            res.status(401).json({ message: "vous n'êtes pas l'auteur du contract seul ce dernier peux effectué des modifications" });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, data_source_1.getRepo)(Contract_1.Contract).remove(contract)];
                    case 3:
                        _a.sent();
                        res.status(200).json("ok");
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.log(error_3);
                        res.status(500).send("Error deleting contract.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.search = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validator, query, contractRepository, userRepository, user, contracts, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = this.validators(req.query, { q: { type: "string" } });
                        query = validator.data.q;
                        contractRepository = (0, data_source_1.getRepo)(Contract_1.Contract);
                        userRepository = (0, data_source_1.getRepo)(User_1.User);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, userRepository.findOneBy({
                                id: res.locals.user.id,
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).send({ error: "Utilisateur non trouvé." });
                            return [2 /*return*/];
                        }
                        contracts = [];
                        if (!(query && query !== "")) return [3 /*break*/, 4];
                        return [4 /*yield*/, contractRepository.find({
                                where: [
                                    { user: user, replacedName: (0, typeorm_1.Like)("%".concat(query, "%")) },
                                    { user: user, substituteName: (0, typeorm_1.Like)("%".concat(query, "%")) },
                                ],
                            })];
                    case 3:
                        // Recherche dans les contrats de l'utilisateur connecté
                        contracts = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, contractRepository.find({
                            where: { user: user },
                        })];
                    case 5:
                        // Si pas de requête, retourner tous les contrats de l'utilisateur
                        contracts = _a.sent();
                        _a.label = 6;
                    case 6:
                        res.status(200).send(contracts);
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        console.log(error_4);
                        res.status(500).send({ error: "Error searching for contracts." });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        return _this;
    }
    ContractController.prototype.getOne = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user, contract, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.query.id;
                        if (!id) {
                            res.status(400).json("Veuillez spécifié l'identifiant du contrat lors de la demande");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(User_1.User).findOne({
                                where: { id: res.locals.user.id },
                                relations: ["contracts"]
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).send("Utilisateur non trouvé.");
                            return [2 /*return*/];
                        }
                        contract = user.contracts.find(function (contract) { return contract.id === parseInt(id); });
                        if (!contract) {
                            res.status(404).send("Le contrat n'existe pas ou vous n'avez pas accès à ce contrat.");
                            return [2 /*return*/];
                        }
                        res.status(200).send(contract);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.log(error_5);
                        res.status(500).send("Une erreur s'est produite, veuillez réessayer.");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContractController.prototype.list = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, data_source_1.getRepo)(User_1.User).findOne({
                                where: [{ id: res.locals.user.id }],
                                relations: ["contracts"]
                            })];
                    case 1:
                        user = _a.sent();
                        res.status(200).send(user.contracts);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.log(error_6);
                        res.status(500).send("Error fetching contracts.");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ContractController;
}(BaseController_1.Controller));
exports.contractController = new ContractController();
//# sourceMappingURL=contract.js.map