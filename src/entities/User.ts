import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Role } from "../types/Role";
import bcrypt from "bcrypt";
import { Video } from "./Video";
import { LikedVideo } from "./LikedVideo";
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

  @Column({ default: "" })
  lastName: string;

  @Column({ default: "" })
  image_url: string;

  @Column({ nullable: true })
  dateOfBirth!: Date;

  @Column("nvarchar")
  role: Role;

  @CreateDateColumn({
    type: "datetime2",
  })
  createdAt: Date;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => LikedVideo, (videoLike) => videoLike.user)
  videosLikedConection: LikedVideo[];

  @BeforeInsert()
  hashPassword() {
    const hash = bcrypt.hashSync(this.password, 10);
    this.password = hash;
  }
  validatePassword(pass: string) {
    return bcrypt.compareSync(this.password, pass);
  }
}
