import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type UserRole = "customer" | "admin";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: "varchar", default: "customer" })
  role!: UserRole;
}
