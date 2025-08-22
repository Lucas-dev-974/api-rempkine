"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var contract_1 = require("../controllers/contract");
var express_1 = __importDefault(require("express"));
var ContractRouter = express_1.default.Router();
ContractRouter.get("/", contract_1.contractController.list);
ContractRouter.post("/", contract_1.contractController.create);
ContractRouter.patch("/", contract_1.contractController.update);
ContractRouter.get("/search", contract_1.contractController.search);
// ContractRouter.get("/list-ids", contractController.listFromIDS);
ContractRouter.get("/one", contract_1.contractController.getOne);
ContractRouter.delete("/:id", contract_1.contractController.delete);
exports.default = ContractRouter;
//# sourceMappingURL=contract.js.map