import { Controller, ValidationSchema } from "./BaseController";
import { Request, Response } from "express-serve-static-core";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";
import { getRepo } from "../dataSource";
import { Like } from "typeorm";
import { logger } from "../utils/Logger";

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
    doneAtDate: { type: "date" },

    // ------------------- Replaced kinesitherapist -------------------
    replacedGender: { type: "enum", values: ["male", "female"] },
    replacedEmail: { type: "email" },
    replacedName: { type: "string", required: true },
    replacedBirthday: { type: "date" },
    replacedBirthdayLocation: { type: "string" },
    replacedOrderDepartement: { type: "string" },
    replacedOrderDepartmentNumber: { type: "string" },
    replacedProfessionnalAddress: { type: "string" },

    // ------------------- Substitute kinesitherapist -------------------
    substituteGender: { type: "enum", values: ["male", "female"] },
    substituteEmail: { type: "email" },
    substituteName: { type: "string", required: true },
    substituteBirthday: { type: "date" },
    substituteBirthdayLocation: { type: "string" },
    substituteOrderDepartement: { type: "string" },
    substituteOrderDepartmentNumber: { type: "string" },
    substituteAdress: { type: "string" },
    replacedSignatureDataUrl: { type: "string" },
    substituteSignatureDataUrl: { type: "string" },
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

  public create = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)

    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    try {
      const user = await getRepo(User).findOneBy({ id: res.locals.user.id });

      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé." });
        return;
      }

      const contract = getRepo(Contract).create({ ...validator.data as Partial<Contract> });
      contract.user = user;

      await getRepo(Contract).save(contract);

      res.status(201).json(contract);
    } catch (error) {
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
        where: { id: contractId },
        relations: ["user"]
      });

      if (!contract) {
        res.status(404).json({ error: "Contrat non trouvé." });
        return;
      }

      if (!contract.user || contract.user.id !== res.locals.user.id) {
        res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce contrat." });
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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "L'identifiant du contrat est requis." });
    }

    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "L'identifiant du contrat doit être un nombre valide." });
    }

    try {
      const contract = await getRepo(Contract).findOne({
        where: { id: contractId },
        relations: ["user"]
      });


      if (!contract) {
        res.status(404).json({ error: "Contrat non trouvé." });
        return;
      }

      if (!contract.user || contract.user.id !== res.locals.user.id) {
        res.status(403).json({ error: "Vous n'êtes pas l'auteur du contrat. Seul ce dernier peut effectuer des modifications." });
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

  private async SyncContractsSaveLocalToBDD(localContracts: Contract[], user: User) {
    try {
      for (const contract of localContracts) {
        if (!contract) continue;
        const { id, ...contractData } = contract;
        const contract_ = getRepo(Contract).create(contractData);

        contract_.user = user;
        await getRepo(Contract).save(contract_);
      }
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      throw error;
    }
  }

  private async SyncContractToDelete(contractsToDelete: Contract[]) {
    try {
      for (const contract of contractsToDelete) {
        if (!contract || !contract.id) continue;
        await getRepo(Contract).delete({ id: contract.id });
      }
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      throw error;
    }
  }

  private async SyncContractsUpdate(contracts: Contract[], user: User) {
    try {
      for (const contract of user.contracts) {
        const contract_ = contracts.find(_contract => _contract.id === contract.id);
        if (!contract_) continue;

        if (!contract_.updatedAt) continue;

        const incomingContractDate = new Date(contract_.updatedAt);
        if (isNaN(incomingContractDate.getTime())) continue;

        const contractDate = new Date(contract.updatedAt);
        if (isNaN(contractDate.getTime())) continue;

        if (contractDate < incomingContractDate) {
          const { id, ...datas } = contract_;
          await getRepo(Contract).update({ id: contract.id }, datas);
        }
      }
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      throw error;
    }
  }

  public synchronizeContracts = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, { contracts: { type: "array", required: true } });

    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    const inComingContracts: Partial<Contract & { id: string | number; deleted?: boolean }>[] = validator.data?.contracts || [];

    // Valider chaque contrat individuellement
    const validationErrors: string[] = [];
    for (let i = 0; i < inComingContracts.length; i++) {
      const contract = inComingContracts[i];

      // Vérifier que le contrat existe
      if (!contract) {
        validationErrors.push(`Contrat à l'index ${i}: Le contrat est null ou undefined`);
        continue;
      }

      // Pour les contrats à supprimer, on skip la validation (seul deleted: true est nécessaire)
      if (contract.deleted) {
        continue;
      }

      // Valider le contrat avec le schéma de validation
      const contractValidator = this.validators(contract, this.contractValidationPattern);
      if (contractValidator.errors.length > 0) {
        validationErrors.push(`Contrat à l'index ${i}: ${contractValidator.errors.join(', ')}`);
        continue; // Ne pas traiter ce contrat
      }

      // Validation supplémentaire pour les valeurs numériques négatives
      if (contract.percentReturnToSubstitute !== undefined && contract.percentReturnToSubstitute < 0) {
        validationErrors.push(`Contrat à l'index ${i}: Le champ 'percentReturnToSubstitute' ne peut pas être négatif`);
      }
      if (contract.nonInstallationRadius !== undefined && contract.nonInstallationRadius < 0) {
        validationErrors.push(`Contrat à l'index ${i}: Le champ 'nonInstallationRadius' ne peut pas être négatif`);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors });
    }

    const isLocalID = (id: string | number | undefined) => {
      if (typeof id === "string") {
        if (id.startsWith("contract_")) return true;
      }
      return false;
    };

    const savedContracts = inComingContracts.filter(contract => contract.id && !isLocalID(contract.id) && !contract.deleted);
    const unSavedContracts = inComingContracts.filter(contract => contract.id && isLocalID(contract.id));
    const contractsToDelete = inComingContracts.filter(contract => contract.deleted && contract.id && !isLocalID(contract.id));

    try {
      const user = await getRepo(User).findOne({ where: { id: res.locals.user.id }, relations: ["contracts"] });

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }

      await this.SyncContractToDelete(contractsToDelete as Contract[]);
      await this.SyncContractsUpdate(savedContracts as Contract[], user as User);
      await this.SyncContractsSaveLocalToBDD(unSavedContracts as Contract[], user as User);

      const refreshUser = await getRepo(User).findOne({ where: { id: res.locals.user.id }, relations: ["contracts"] });

      if (!refreshUser) {
        return res.status(404).json({ error: "Erreur lors de la récupération des contrats." });
      }

      return res.status(200).json(refreshUser.contracts || []);
    } catch (error) {
      logger.write("Contract", logger.getContentErrorMessage(error));
      const isDevelopment = process.env.NODE_ENV !== 'production';
      return res.status(500).json({
        error: "Une erreur est survenue, veuillez contacter l'administrateur du site",
        ...(isDevelopment && { details: (error as Error).message })
      });
    }
  }
}

export const contractController = new ContractController();
