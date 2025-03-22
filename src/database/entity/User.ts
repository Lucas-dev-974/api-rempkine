import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserContract } from "./UserContract";
import { Contract } from "./Contract";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  fullname: string;

  @Column({ nullable: true, unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  bornLocation: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  personalAdress: string;

  @Column({ type: "enum", enum: ["student", "professionnal"], nullable: true })
  status: "student" | "professionnal";

  @OneToMany(() => UserContract, (userContracts) => userContracts.user)
  userContracts: UserContract[];

  @OneToMany(() => Contract, (contract) => contract.user)
  contracts: Contract[];
}
