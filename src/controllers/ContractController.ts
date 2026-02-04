import { Controller, ValidationSchema } from "./BaseController";
import { Request, Response } from "express-serve-static-core";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";
import { getRepo } from "../dataSource";
import { Like } from "typeorm";
import { logger } from "../utils/Logger";
import jwt from "jsonwebtoken";

class ContractController extends Controller {
  contractValidationPattern: ValidationSchema = {
    id: { type: "string|number" },

    startDate: { type: "string" },
    endDate: { type: "string" },
    percentReturnToSubstitute: { type: "number" },
    percentReturnToSubstituteBeforeDate: { type: "date" },
    nonInstallationRadius: { type: "number" },
    conciliationCDOMK: { type: "string" },
    doneAtLocation: { type: "string" },
    doneAt: { type: "date" },

    // ------------------- Replaced kinesitherapist -------------------
    replacedGender: { type: "enum", values: ["male", "female"] },
    replacedEmail: { type: "email" },
    replacedName: { type: "string" },
    replacedBirthday: { type: "date" },
    replacedBirthdayLocation: { type: "string" },
    replacedOrderDepartement: { type: "string" },
    replacedOrderDepartmentNumber: { type: "string|number" },
    replacedProfessionnalAddress: { type: "string" },

    // ------------------- Substitute kinesitherapist -------------------
    substituteGender: { type: "enum", values: ["male", "female"] },
    substituteEmail: { type: "email" },
    substituteName: { type: "string" },
    substituteBirthday: { type: "date" },
    substituteBirthdayLocation: { type: "string" },
    substituteOrderDepartement: { type: "string" },
    substituteOrderDepartmentNumber: { type: "string|number" },
    substituteAdress: { type: "string" },
    replacedSignatureDataUrl: { type: "string" },
    substituteSignatureDataUrl: { type: "string" },

    token: { type: "string" },
  }


  public async getOne(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
      res.status(400).json("Veuillez spécifié l'identifiant du contrat lors de la demande");
      return;
    }

    try {
      const user = await getRepo(User).findOne({
        where: { id: res.locals.user.id },
        relations: ["contracts"]
      });

      if (!user) {
        res.status(404).json("Utilisateur non trouvé.");
        return;
      }
      const contractId = parseInt(id as string, 10);
      if (isNaN(contractId)) {
        res.status(400).json({ error: "L'identifiant du contrat doit être un nombre valide." });
        return;
      }

      const contract = user.contracts.find(contract => contract.id === contractId);

      if (!contract) {
        res.status(404).json({ error: "Le contrat n'existe pas ou vous n'avez pas accès à ce contrat." });
        return;
      }

      res.status(200).json(contract);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Une erreur s'est produite, veuillez réessayer.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const user = await getRepo(User).findOne({
        where: { id: res.locals.user.id },
        relations: ["contracts"]
      });

      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé." });
        return;
      }

      res.status(200).json(user.contracts || []);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la récupération des contrats.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

  private generateContractToken = (contract: Contract) => {
    const token = jwt.sign({ contractId: contract.id }, process.env.JWT_PRIVATE as string);
    return token;
  }

  public create = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)

    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    try {
      const contract = getRepo(Contract).create({ ...validator.data as Partial<Contract> });
      const token = this.generateContractToken(contract as Contract);
      contract.token = token;

      if (res.locals.user) {
        const user = await getRepo(User).findOneBy({ id: res.locals.user.id }) as User;
        contract.user = user;
      }

      await getRepo(Contract).save(contract);
      res.status(201).json(contract);
    } catch (error) {
      console.log(error);
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la création du contrat.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

  public update = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)
    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    const contractData: Partial<Contract> = validator.data as Partial<Contract>;

    try {
      if (!contractData.id) {
        res.status(400).json({ error: "L'identifiant du contrat est requis." });
        return;
      }

      const contractId = typeof contractData.id === 'string' ? parseInt(contractData.id, 10) : contractData.id;
      if (isNaN(contractId)) {
        res.status(400).json({ error: "L'identifiant du contrat doit être un nombre valide." });
        return;
      }

      const contract = await getRepo(Contract).findOne({
        where: { id: contractId }
      });

      if (!contract) {
        res.status(404).json({ error: "Contrat non trouvé." });
        return;
      }

      if (contract.token !== contractData.token) {
        res.status(401).json({ error: "Vous n'êtes pas autorisé à modifier ce contrat." });
        return;
      }

      const updatedContract = getRepo(Contract).merge(contract, contractData);
      await getRepo(Contract).save(updatedContract);

      res.status(200).json(updatedContract);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la mise à jour du contrat.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

  public delete = async (req: Request, res: Response) => {
    const { id, token } = req.params;

    if (!id) {
      return res.status(400).json({ error: "L'identifiant du contrat est requis." });
    }

    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "L'identifiant du contrat doit être un nombre valide." });
    }

    try {
      const contract = await getRepo(Contract).findOne({ where: { id: contractId } });

      if (!contract) {
        res.status(404).json({ error: "Contrat non trouvé." });
        return;
      }

      if (contract.token !== token) {
        res.status(401).json({ error: "Vous n'êtes pas autorisé à supprimer ce contrat." });
        return;
      }

      await getRepo(Contract).remove(contract);
      res.status(200).json({ message: "Contrat supprimé avec succès." });
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la suppression du contrat.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

  public search = async (req: Request, res: Response) => {
    const validator = this.validators(req.query, { q: { type: "string", required: false } });
    const query = validator.data?.q;

    const contractRepository = getRepo(Contract);
    const userRepository = getRepo(User);

    try {
      // Récupérer l'utilisateur connecté
      const user = await userRepository.findOneBy({
        id: res.locals.user.id,
      });

      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé." });
        return;
      }

      let contracts = [];

      if (query && query !== "") {
        // Recherche dans les contrats de l'utilisateur connecté
        contracts = await contractRepository.find({
          where: [
            { user: user, replacedName: Like(`%${query}%`) },
            { user: user, substituteName: Like(`%${query}%`) },
          ],
        });
      } else {
        // Si pas de requête, retourner tous les contrats de l'utilisateur
        contracts = await contractRepository.find({
          where: { user: user },
        });
      }

      res.status(200).json(contracts);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la recherche de contrats.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }



  public listFromIDS = async (req: Request, res: Response) => {
    const { ids } = req.body;
    const ids_ = JSON.parse(ids);
    let contracts: Contract[] = [];

    if (Array.isArray(ids_)) {
      for (const id of ids_) {
        const contract = await getRepo(Contract).findOne({ where: { id: id[0] } });
        if (contract.token == id[1]) {
          contracts.push(contract as Contract);
        }
      }
    }

    return res.status(200).json(contracts);
  }

  public getByToken = async (req: Request, res: Response) => {
    const { token } = req.query;
    try {
      const contract = await getRepo(Contract).findOne({ where: { token: token as string } });
      if (!contract) {
        return res.status(404).json({ error: "Contrat non trouvé." });
      }
      return res.status(200).json(contract);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: "Erreur lors de la récupération du contrat.",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }

}

export const contractController = new ContractController();
