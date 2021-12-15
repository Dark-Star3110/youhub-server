import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { LikedVideo } from "./LikedVideo";
import { User } from "./User";
@Entity()
export class Video extends BaseEntity {
  // ! la not null
  @Column({
    primary: true,
  })
  id: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  userId!: string;

  @Column({ default: true })
  commentable!: boolean;

  @Column({ default: "" })
  thumbNailUrl: string;

  @Column()
  size!: number;

  @CreateDateColumn({
    type: "datetime2",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "datetime2",
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.videos)
  @JoinColumn({ name: "userId" })
  readonly user: User;

  @OneToMany(() => LikedVideo, (userLike) => userLike.video)
  usersLikedConection: LikedVideo[];
}
