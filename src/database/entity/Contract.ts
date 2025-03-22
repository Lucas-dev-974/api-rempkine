import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { UserContract } from "./UserContract";
import { User } from "./User";

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorEmail: string;

  @Column()
  authorName: string;

  @Column({ type: "enum", enum: ["professional", "student"] })
  authorStatut: "professional" | "student";

  @Column()
  startDate: string;

  @Column()
  endDate: Date;

  @Column()
  percentReturnToSubstitute: number;

  @Column()
  percentReturnToSubstituteBeforeDate: Date;

  @Column()
  nonInstallationRadius: number;

  @Column()
  conciliationCDOMK: string;

  @Column()
  doneAtLocation: string;

  @Column()
  doneAtDate: Date;

  @OneToMany(() => UserContract, (userContract) => userContract.contract)
  contractUsers: UserContract[];

  @ManyToOne(() => User, (user) => user.userContracts, {
    onDelete: "CASCADE",
  })
  user: User;

  // ------------------- Replaced kinesitherapist -------------------
  @Column({ type: "enum", enum: ["male", "female"] })
  replacedGender: "male" | "female";

  @Column()
  replacedEmail: string;

  @Column()
  replacedName: string;

  @Column()
  replacedBirthday: Date;

  @Column()
  replacedBirthdayLocation: string;

  @Column()
  replacedOrderDepartement: string;

  @Column()
  replacedOrderDepartmentNumber: number;

  @Column()
  replacedProfessionnalAddress: string;

  // ------------------- Substitute kinesitherapist -------------------
  @Column({ type: "enum", enum: ["male", "female"] })
  substituteGender: "male" | "female";

  @Column()
  substituteEmail: string;

  @Column()
  substituteName: string;

  @Column()
  substituteBirthday: Date;

  @Column()
  substituteBirthdayLocation: string;

  @Column()
  substituteOrderDepartement: string;

  @Column()
  substituteOrderDepartmentNumber: number;
}
