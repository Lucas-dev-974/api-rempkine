import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from "typeorm";
import { Contract } from "./Contract";
import { User } from "./User";

@Entity("contrat_utilisateur")
@Unique(["contract", "role"]) // Empêche d'avoir plusieurs fois le même rôle par contrat
export class UserContract {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contract, (contract) => contract.contractUsers, {
    onDelete: "CASCADE",
  })
  contract: Contract;

  @ManyToOne(() => User, (user) => user.userContracts, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ type: "enum", enum: ["remplacé", "remplaçant"] })
  role: "remplacé" | "remplaçant";
}
