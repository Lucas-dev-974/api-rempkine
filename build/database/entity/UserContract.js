"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserContract = void 0;
var typeorm_1 = require("typeorm");
var Contract_1 = require("./Contract");
var User_1 = require("./User");
var UserContract = /** @class */ (function () {
    function UserContract() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], UserContract.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return Contract_1.Contract; }, function (contract) { return contract.contractUsers; }, {
            onDelete: "CASCADE",
        }),
        __metadata("design:type", Contract_1.Contract)
    ], UserContract.prototype, "contract", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return User_1.User; }, function (user) { return user.userContracts; }, {
            onDelete: "CASCADE",
        }),
        __metadata("design:type", User_1.User)
    ], UserContract.prototype, "user", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: "enum", enum: ["remplacé", "remplaçant"] }),
        __metadata("design:type", String)
    ], UserContract.prototype, "role", void 0);
    UserContract = __decorate([
        (0, typeorm_1.Entity)("contrat_utilisateur"),
        (0, typeorm_1.Unique)(["contract", "role"]) // Empêche d'avoir plusieurs fois le même rôle par contrat
    ], UserContract);
    return UserContract;
}());
exports.UserContract = UserContract;
//# sourceMappingURL=UserContract.js.map