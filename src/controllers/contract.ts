import { Controller, ValidationSchema } from "./BaseController";
import { Request, Response } from "express-serve-static-core";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";
import { getRepo } from "../data-source";
import { Like } from "typeorm";

class ContractController extends Controller {
  contractValidationPattern: ValidationSchema = {
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
  }


  public async getOne(req: Request, res: Response) {
    const { id } = req.query;
    if (!id) {
      res.status(400).json("Veuillez spécifié l'identifiant du contrat lors de la demande");
      return;
    }

    try {
      // Récupérer l'utilisateur connecté avec ses contrats
      const user = await getRepo(User).findOne({
        where: { id: res.locals.user.id },
        relations: ["contracts"]
      });

      if (!user) {
        res.status(404).send("Utilisateur non trouvé.");
        return;
      }

      // Vérifier si le contrat existe dans les contrats de l'utilisateur
      const contract = user.contracts.find(contract => contract.id === parseInt(id as string));

      if (!contract) {
        res.status(404).send("Le contrat n'existe pas ou vous n'avez pas accès à ce contrat.");
        return;
      }

      res.status(200).send(contract);
    } catch (error) {
      console.log(error);
      res.status(500).send("Une erreur s'est produite, veuillez réessayer.");
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const user = await getRepo(User).findOne({
        where: [{ id: res.locals.user.id }],
        relations: ["contracts"]
      });

      res.status(200).send(user.contracts);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching contracts.");
    }
  }

  public create = async (req: Request, res: Response) => {
    const validator = this.validators(req.body, this.contractValidationPattern)
    if (validator.errors.length > 0) {
      return res.status(400).json({ error: validator.errors });
    }

    try {
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
        res.status(404).send("Contract not found.");
        return;
      }

      if (contract.user.id !== res.locals.user.id) {
        res.status(403).send("You are not allowed to update this contract.");
        return;
      }

      const updatedContract = getRepo(Contract).merge(contract, contractData);
      await getRepo(Contract).save(updatedContract);

      res.status(200).send(contract);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error deleting contract.");
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
      res.status(500).send("Error deleting contract.");
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
        res.status(404).send({ error: "Utilisateur non trouvé." });
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

      res.status(200).send(contracts);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Error searching for contracts." });
    }
  }
}

export const contractController = new ContractController();
