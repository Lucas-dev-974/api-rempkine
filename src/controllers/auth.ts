import { UtilsAuthentication } from "../utils/auth.util";
import { User } from "../database/entity/User";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { getRepo } from "../data-source";
import Validator from "validatorjs";

class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    const validator = new Validator(req.body, {
      email: "required|email",
      password: "string|required",
    });

    if (validator.fails()) {
      res.status(400).send(validator.errors.all());
      return;
    }

    const { email, password } = req.body;
    const userRepository = getRepo(User);

    try {
      // Check if user exists
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        res.status(400).send("Invalid credentials.");
        return;
      }

      // Check if password is correct
      const isPasswordValid = await UtilsAuthentication.check(
        password,
        user.password
      );

      if (!isPasswordValid) {
        res.status(400).send("Vos identifiants sont incorrects.");
        return;
      }

      // Generate JWT
      const token = UtilsAuthentication.generateToken({ email, id: user.id });

      res.status(200).send({
        user,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error logging in.");
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    const validator = new Validator(req.body, {
      email: "required|email",
      fullname: "string|required",
      password: "string|required",
    });

    if (validator.fails()) res.status(400).send(validator.errors.all());

    const { fullname, email, password } = req.body;
    const userRepository = getRepo(User);

    try {
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).send("User already exists.");
        return;
      }

      // Create a new user
      const user = new User();
      user.email = email;
      user.password = await UtilsAuthentication.hash(password);
      user.fullname = fullname;

      // Save the user to the database
      await userRepository.save(user);

      res.status(201).send({
        user,
        token: UtilsAuthentication.generateToken({ email, id: user.id }),
      });
    } catch (error) {
      console.log(error);

      res.status(500).send("Error registering user.");
    }
  }

  public async me(req: Request, res: Response): Promise<void> {
    const bearer = UtilsAuthentication.getBearerToken(req);
    if (!bearer) {
      res.status(400).send("token invalide, veuillez vous reconnecté.");
      return;
    }

    const tokenData = UtilsAuthentication.checkToken(bearer) as JwtPayload;

    const userRepository = getRepo(User);
    const user = await userRepository.findOne({
      where: { email: tokenData.email },
    });

    res.status(200).send(user);
  }
}

export const authController = new AuthController();
