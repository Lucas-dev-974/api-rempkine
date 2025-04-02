import { contractController } from "../controllers/contract";
import express, { Router } from "express";

const ContractRouter: Router = express.Router();

ContractRouter.get("/", contractController.list);
ContractRouter.post("/", contractController.create);
ContractRouter.patch("/", contractController.update);
ContractRouter.get("/search", contractController.search);

export default ContractRouter;
