import { Request, Response } from "express-serve-static-core";
import { getRepo } from "../data-source";
import Validator from "validatorjs";
import { Contract } from "../database/entity/Contract";
import { User } from "../database/entity/User";

class ContractController {
  public async list(req: Request, res: Response) {
    const contractRepository = getRepo(Contract);
    const userRepo = getRepo(User);

    try {
      const user = await userRepo.findOne({
        where: { id: res.locals.user.id },
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

  public async create(req: Request, res: Response) {
    const validator = new Validator(req.body, {
      authorEmail: "required|email",
      authorName: "required|string",
      authorStatut: "required|string",
      startDate: "required|date",
      endDate: "required|date",
      percentReturnToSubstitute: "required|numeric",
      percentReturnToSubstituteBeforeDate: "required|date",
      nonInstallationRadius: "required|numeric",
      conciliationCDOMK: "required|string",
      doneAtLocation: "required|string",
      doneAtDate: "required|date",

      // ------------------- Replaced kinesitherapist -------------------
      replacedGender: "required|string",
      replacedEmail: "required|email",
      replacedName: "required|string",
      replacedBirthday: "required|date",
      replacedBirthdayLocation: "required|string",
      replacedOrderDepartement: "required|string",
      replacedOrderDepartmentNumber: "required|numeric",
      replacedProfessionnalAddress: "required|string",

      // ------------------- Substitute kinesitherapist -------------------
      substituteGender: "required|string",
      substituteEmail: "required|email",
      substituteName: "required|string",
      substituteBirthday: "required|date",
      substituteBirthdayLocation: "required|string",
      substituteOrderDepartement: "required|string",
      substituteOrderDepartmentNumber: "required|numeric",
    });

    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }

    const {
      authorEmail,
      authorName,
      authorStatut,
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
    } = req.body;

    const contractRepository = getRepo(Contract);

    try {
      const contract = contractRepository.create({
        authorEmail,
        authorName,
        authorStatut,
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

        user: res.locals.user,
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
}

export const contractController = new ContractController();
