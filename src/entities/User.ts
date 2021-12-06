import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { Role } from "../types/Role";
import bcrypt from "bcrypt";
@Entity()
export class User extends BaseEntity {
  // ! la not null
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column()
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName: string;

  @Column()
  image_url: string;

  @Column()
  dateOfBirth!: Date;

  @Column("nvarchar")
  role: Role;

  @CreateDateColumn({
    type: "datetime2",
  })
  createdAt: Date;

  @BeforeInsert()
  hashPassword() {
    const hash = bcrypt.hashSync(this.password, "matkhau");
    this.password = hash;
  }
  validatePassword(pass: string) {
    return bcrypt.compareSync(this.password, pass);
  }
}
