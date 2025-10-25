import { Controller, ValidationSchema } from "./BaseController";
import { Request, Response } from "express-serve-static-core";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";
import { getRepo } from "../dataSource";
import { Like } from "typeorm";
import { logger } from "../utils/Logger";

class ContractController extends Controller {
  contractValidationPattern: ValidationSchema = {
    id: { type: "string" },

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
      const contract = user.contracts.find(contract => contract.id === parseInt(id as string));

      if (!contract) {
        res.status(404).json("Le contrat n'existe pas ou vous n'avez pas accès à ce contrat.");
        return;
      }

      res.status(200).json(contract);
    } catch (error) {
      console.log(error);
      res.status(500).json("Une erreur s'est produite, veuillez réessayer.");
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const user = await getRepo(User).findOne({
        where: [{ id: res.locals.user.id }],
        relations: ["contracts"]
      });

      res.status(200).json(user.contracts);
    } catch (error) {
      console.log(error);
      res.status(500).json("Error fetching contracts.");
    }
  }

  public create = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)
    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    console.log("before try create contract");

    try {
      console.log("try create contract");

      const user = await getRepo(User).findOneBy({ id: res.locals.user.id })
      const contract = getRepo(Contract).create({ ...validator.data as Partial<Contract> });
      contract.user = user

      await getRepo(Contract).save(contract);
      res.status(201).json(contract);
    } catch (error) {
      console.log(error);
      res.status(500).json("Error creating contract.");
    }
  }

  public update = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)
    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    const contractData: Partial<Contract> = validator.data as Partial<Contract>;

    try {
      const contract = await getRepo(Contract).findOne({
        where: { id: contractData.id },
        relations: ["user"]
      });

      if (!contract) {
        res.status(404).json("Contract not found.");
        return;
      }

      if (contract.user.id !== res.locals.user.id) {
        res.status(403).json("You are not allowed to update this contract.");
        return;
      }

      const updatedContract = getRepo(Contract).merge(contract, contractData);
      await getRepo(Contract).save(updatedContract);

      res.status(200).json(contract);
    } catch (error) {
      console.log(error);
      res.status(500).json("Error deleting contract.");
    }
  }

  public delete = async (req: Request, res: Response) => {
    const validator = this.validators(req.params, this.contractValidationPattern)
    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    try {
      const contract = await getRepo(Contract).findOne({
        where: { id: validator.data.id, },
        relations: ["user"]
      });

      if (contract.user.id !== res.locals.user.id) {
        res.status(401).json({ message: "vous n'êtes pas l'auteur du contract seul ce dernier peux effectué des modifications" })
        return
      }

      await getRepo(Contract).remove(contract);
      res.status(200).json("ok");
    } catch (error) {
      console.log(error);
      res.status(500).json("Error deleting contract.");
    }
  }

  public search = async (req: Request, res: Response) => {
    const validator = this.validators(req.query, { q: { type: "string" } });
    const query = validator.data.q;

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
      console.log(error);
      res.status(500).json({ error: "Error searching for contracts." });
    }
  }

  private async SyncContractsSaveLocalToBDD(localContracts: Contract[], user: User) {
    try {

      for (const contract of localContracts) {
        if (!contract) return
        const { id, ...contractData } = contract
        const contract_ = getRepo(Contract).create(contractData)
        contract_.user = user
        await getRepo(Contract).save(contract_)
      }
    } catch (error) {
      console.log(error)
    }
  }

  private async SyncContractToDelete(contractsToDelete: Contract[]) {
    try {
      for (const contract of contractsToDelete) {
        if (!contract) return
        await getRepo(Contract).delete(contract)
      };
    } catch (error) {
      console.log(error);
      throw (error)
    }
  }

  private async SyncContractsUpdate(contracts: Contract[], user: User) {
    for (const contract of user.contracts) {
      const contract_ = contracts.find(_contract => _contract.id == contract.id)
      if (!contract_) return

      const inCoContracDate = new Date(contract_.updatedAt)

      if (contract.updatedAt < inCoContracDate) {
        const { id, ...datas } = contract_
        await getRepo(Contract).update({ id }, datas)
      }
    }
  }

  // todo review this to diff received and DTB contracts and update/delet/append contracts
  public synchronizeContracts = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, { contracts: { type: "array" } })
    const inComingContracts: Partial<Contract & { id: string | number; deleted?: boolean }>[] = validator.data.contracts

    const isLocalID = (id: string | number) => {
      if (typeof id === "string") {
        if (id.startsWith("contract_")) return true
      }
      return false
    }

    const savedContracts = inComingContracts.filter(contract => !isLocalID(contract.id) && !contract.deleted)
    const unSavedContracts = inComingContracts.filter(contract => isLocalID(contract.id))
    const contractsToDelete = inComingContracts.filter(contracts => contracts.deleted)


    try {
      const user = await getRepo(User).findOne({ where: { id: res.locals.user.id }, relations: ["contracts"] })

      await this.SyncContractToDelete(contractsToDelete as Contract[])
      await this.SyncContractsUpdate(savedContracts as Contract[], user as User)
      await this.SyncContractsSaveLocalToBDD(unSavedContracts as Contract[], user as User)

      const refreshUser = await getRepo(User).findOne({ where: { id: res.locals.user.id }, relations: ["contracts"] })

      return res.status(200).json(refreshUser.contracts)
    } catch (error) {
      console.log(error);
      logger.write("Contract", logger.getContentErrorMessage(error))
      return res.status(500).json({ error: "Une erreur est survenue veuillez contacté l'administrateur du site" })
    }
  }
}

export const contractController = new ContractController();
