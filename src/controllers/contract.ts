import { Request, Response } from "express-serve-static-core";
import fs from "fs";
import path from "path";

// Extend the Request interface to include the 'files' property
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

import { getRepo } from "../data-source";
import Validator from "validatorjs";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";
import { In, Like } from "typeorm";
import { UtilsAuthentication } from "../utils/auth.util";

class ContractController {
  public async list(req: Request, res: Response) {
    const contractRepository = getRepo(Contract);
    const userRepo = getRepo(User);

    try {
      const user = await userRepo.findOne({
        where: [{ id: res.locals.user.id }, { isPublic: true }],
      });

      const contracts = await contractRepository.find({
        where: { user: user },
      });

      res.status(200).send(contracts);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error fetching contracts.");
    }
  }

  public async listFromIDS(req: Request, res: Response) {
    // todo: check contracts expiration date (3 months) if > 3: contract.public = false
    let { ids } = req.query;
    let finalIDS = [];

    if (!ids) ids = [];
    if (typeof ids === "string") {
      finalIDS = ids
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    } else if (!Array.isArray(ids)) {
      ids = [];
    }

    const contractRepository = getRepo(Contract);
    try {
      const contracts = await contractRepository.findBy({ id: In(finalIDS) });
      res.status(200).send(contracts);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(
          "Une erreur s'est produite lors de la récupération des contrats, veuillez réessayer plus tard."
        );
      console.log("files:", (req as MulterRequest).files);
    }
  }

  public async create(req: Request, res: Response) {
    const validator = new Validator(req.body, {
      authorEmail: "email",
      authorName: "string",
      startDate: "date",
      endDate: "date",
      percentReturnToSubstitute: "numeric",
      percentReturnToSubstituteBeforeDate: "date",
      nonInstallationRadius: "numeric",
      conciliationCDOMK: "string",
      doneAtLocation: "string",
      doneAtDate: "date",

      // ------------------- Replaced kinesitherapist -------------------
      replacedGender: "string",
      replacedEmail: "email",
      replacedName: "string",
      replacedBirthday: "date",
      replacedBirthdayLocation: "string",
      replacedOrderDepartement: "string",
      replacedOrderDepartmentNumber: "numeric",
      replacedProfessionnalAddress: "string",

      // ------------------- Substitute kinesitherapist -------------------
      substituteGender: "string",
      substituteEmail: "email",
      substituteName: "string",
      substituteBirthday: "date",
      substituteBirthdayLocation: "string",
      substituteOrderDepartement: "string",
      substituteOrderDepartmentNumber: "numeric",

      replacedSignatureDataUrl: "string",
      substituteSignatureDataUrl: "string",
    });

    if (validator.fails()) {
      return res.status(400).send({
        error: "Des champs obligatoires sont manquants",
      });
    }

    const {
      authorEmail,
      authorName,
      startDate,
      endDate,
      percentReturnToSubstitute,
      percentReturnToSubstituteBeforeDate,
      nonInstallationRadius,
      conciliationCDOMK,
      doneAtLocation,
      doneAtDate,
      // ------------------- Replaced kinesitherapist -------------------
      replacedGender,
      replacedEmail,
      replacedName,
      replacedBirthday,
      replacedBirthdayLocation,
      replacedOrderDepartement,
      replacedOrderDepartmentNumber,
      replacedProfessionnalAddress,

      // ------------------- Substitute kinesitherapist -------------------
      substituteGender,
      substituteEmail,
      substituteName,
      substituteBirthday,
      substituteBirthdayLocation,
      substituteOrderDepartement,
      substituteOrderDepartmentNumber,

      replacedSignatureDataUrl,
      substituteSignatureDataUrl,
    } = req.body;

    const contractRepository = getRepo(Contract);

    let userField = {};
    if (res.locals.user) userField = { user: res.locals.user };

    let fileName = null;

    try {
      const id = await UtilsAuthentication.generateRandomNumber(
        contractRepository
      );
      const contract = contractRepository.create({
        id,
        authorEmail,
        authorName,
        startDate,
        endDate,
        percentReturnToSubstitute,
        percentReturnToSubstituteBeforeDate,
        nonInstallationRadius,
        conciliationCDOMK,
        doneAtLocation,
        doneAtDate,

        replacedGender,
        replacedEmail,
        replacedName,
        replacedBirthday,
        replacedBirthdayLocation,
        replacedOrderDepartement,
        replacedOrderDepartmentNumber,
        replacedProfessionnalAddress,

        substituteGender,
        substituteEmail,
        substituteName,
        substituteBirthday,
        substituteBirthdayLocation,
        substituteOrderDepartement,
        substituteOrderDepartmentNumber,

        replacedSignaturePath: fileName,
        replacedSignatureDataUrl,
        substituteSignatureDataUrl,
        ...userField,
      });
      await contractRepository.save(contract);
      res.status(201).send(contract);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error creating contract.");
    }
  }

  public async update(req: Request, res: Response) {
    const validator = new Validator(req.body, {
      id: "numeric|required",
      authorEmail: "email",
      authorName: "string",
      authorStatut: "string",
      startDate: "date",
      endDate: "date",
      percentReturnToSubstitute: "numeric",
      percentReturnToSubstituteBeforeDate: "date",
      nonInstallationRadius: "numeric",
      conciliationCDOMK: "string",
      doneAtLocation: "string",
      doneAtDate: "date",

      // ------------------- Replaced kinesitherapist -------------------
      replacedGender: "string",
      replacedEmail: "email",
      replacedName: "string",
      replacedBirthday: "date",
      replacedBirthdayLocation: "string",
      replacedOrderDepartement: "string",
      replacedOrderDepartmentNumber: "numeric",
      replacedProfessionnalAddress: "string",

      // ------------------- Substitute kinesitherapist -------------------
      substituteGender: "string",
      substituteEmail: "email",
      substituteName: "string",
      substituteBirthday: "date",
      substituteBirthdayLocation: "string",
      substituteOrderDepartement: "string",
      substituteOrderDepartmentNumber: "numeric",
    });

    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }

    const contractData: Partial<Contract> = req.body as Partial<Contract>;

    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }
    const contractRepository = getRepo(Contract);
    const userRepository = getRepo(User);

    try {
      const contract = await contractRepository.findOneBy({
        id: contractData.id,
      });

      const contractUser = contract.user;
      const user = await userRepository.findOneBy({
        id: res.locals.user.id,
      });

      if (contractUser.id !== user.id) {
        res.status(403).send("You are not allowed to update this contract.");
        return;
      }

      if (!contract) {
        res.status(404).send("Contract not found.");
        return;
      }

      const updatedContract = contractRepository.merge(contract, contractData);
      await contractRepository.save(updatedContract);

      res.status(200).send(contract);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error deleting contract.");
    }
  }
  public async delete(req: Request, res: Response) {
    const validator = new Validator(req.body, {
      id: "numeric|required",
    });

    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }

    const contractRepository = getRepo(Contract);
    const userRepository = getRepo(User);

    try {
      const contract = await contractRepository.findOneBy({
        id: req.body.id,
      });

      const contractUser = contract.user;
      const user = await userRepository.findOneBy({
        id: res.locals.user.id,
      });

      if (contractUser.id !== user.id) {
        res.status(403).send("You are not allowed to delete this contract.");
        return;
      }

      if (!contract) {
        res.status(404).send("Contract not found.");
        return;
      }

      await contractRepository.remove(contract);

      res.status(200).send("Contract deleted.");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error deleting contract.");
    }
  }

  public async search(req: Request, res: Response) {
    const validator = new Validator(req.query, { q: "string" });
    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }

    const query = req.query.q;
    let where = [];

    if (query || query != "") {
      where = [
        { replacedName: Like(`%${query}%`) },
        { substituteName: Like(`%${query}%`) },
        { isPublic: true },
      ];
    }
    const contractRepository = getRepo(Contract);

    try {
      const contracts = await contractRepository.find({ where });

      res.status(200).send(contracts);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error searching for contracts.");
    }
  }
}

export const contractController = new ContractController();
