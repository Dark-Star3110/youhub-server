import { Video } from "./Video";
import { User } from "./User";
import { VoteType } from "./../types/Action";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class VoteVideo extends BaseEntity {
  @PrimaryColumn()
  public videoId: string;

  @PrimaryColumn()
  public userId: string;

  @Column({ enum: [1, -1] })
  public type: VoteType;

  @ManyToOne((_to) => User, (user) => user.voteVideosConnection, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  public readonly user: User;

  @ManyToOne((_to) => Video, (video) => video.voteVideosConnection, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "videoId" })
  public readonly video: Video;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
