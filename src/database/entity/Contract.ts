import { Entity, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { UserContract } from "./UserContract";
import { User } from "./User";
import { Signature } from "./Signature";

@Entity()
export class Contract {
  @Column({ primary: true, generated: false })
  id: number;

  @Column({ nullable: true })
  authorEmail: string;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true })
  percentReturnToSubstitute: number;

  @Column({ nullable: true })
  percentReturnToSubstituteBeforeDate: string;

  @Column({ nullable: true })
  nonInstallationRadius: number;

  @Column({ nullable: true })
  conciliationCDOMK: string;

  @Column({ nullable: true })
  doneAtLocation: string;

  @Column({ nullable: true })
  doneAtDate: string;

  @OneToMany(() => UserContract, (userContract) => userContract.contract)
  contractUsers: UserContract[];

  @ManyToOne(() => User, (user) => user.userContracts, {
    onDelete: "CASCADE",
    nullable: true,
  })
  user: User | null;

  // ------------------- Replaced kinesitherapist -------------------
  @Column({ type: "enum", enum: ["male", "female"], nullable: true })
  replacedGender: "male" | "female";

  @Column({ nullable: true })
  replacedEmail: string;

  @Column({ nullable: true })
  replacedName: string;

  @Column({ nullable: true })
  replacedBirthday: Date;

  @Column({ nullable: true })
  replacedBirthdayLocation: string;

  @Column({ nullable: true })
  replacedOrderDepartement: string;

  @Column({ nullable: true })
  replacedOrderDepartmentNumber: number;

  @Column({ nullable: true })
  replacedProfessionnalAddress: string;

  // ------------------- Substitute kinesitherapist -------------------
  @Column({ type: "enum", enum: ["male", "female"], nullable: true })
  substituteGender: "male" | "female";

  @Column({ nullable: true })
  substituteEmail: string;

  @Column({ nullable: true })
  substituteName: string;

  @Column({ nullable: true })
  substituteBirthday: Date;

  @Column({ nullable: true })
  substituteBirthdayLocation: string;

  @Column({ nullable: true })
  substituteOrderDepartement: string;

  @Column({ nullable: true })
  substituteOrderDepartmentNumber: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  replacedSignatureDataUrl: string;

  @Column({ nullable: true })
  substituteSignatureDataUrl: string;
}
