import { Video } from "./Video";
import { User } from "./User";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";

@Entity()
export class WatchLater extends BaseEntity {
  @Column({
    primary: true,
  })
  public userId: string;

  @Column({
    primary: true,
  })
  public videoId: string;

  @ManyToOne((_type) => User, (user) => user.videosWatchLaterConnection, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  public readonly user: User;

  @ManyToOne((_type) => Video, (video) => video.usersWatchLaterConnection, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "videoId" })
  public readonly video: Video;

  @CreateDateColumn()
  public createdAt: Date;
}
