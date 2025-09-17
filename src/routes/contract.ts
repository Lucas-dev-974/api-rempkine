import { contractController } from "../controllers/contract";
import express, { Router } from "express";

const ContractRouter: Router = express.Router();

ContractRouter.get("/", contractController.list);
ContractRouter.post("/", contractController.create);
ContractRouter.patch("/", contractController.update);
ContractRouter.get("/search", contractController.search);
// ContractRouter.get("/list-ids", contractController.listFromIDS);
ContractRouter.get("/one", contractController.getOne);
ContractRouter.delete("/:id", contractController.delete);

ContractRouter.post("/register-local-contrats", contractController.synchronizeContracts)

export default ContractRouter;
