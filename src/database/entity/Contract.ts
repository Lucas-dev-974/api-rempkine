import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
@Entity()

export class Contract {
  @PrimaryGeneratedColumn()
  id: number;


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
  doneAt: string;

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

  @Column({ nullable: true })
  substituteAdress: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  replacedSignatureDataUrl: string;

  @Column({ nullable: true })
  substituteSignatureDataUrl: string;

  @Column({ nullable: true })
  token: string;

  // ------------------- Relations -------------------
  @ManyToOne(() => User, (user) => user.contracts, { onDelete: "CASCADE", nullable: true })
  user: User | null;
}
