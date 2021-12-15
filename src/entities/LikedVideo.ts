import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Entity()
export class LikedVideo extends BaseEntity {
  @Column({
    primary: true,
  })
  userId: string;

  @Column({ primary: true })
  videoId: string;

  @ManyToOne((_type) => User, (user) => user.videosLikedConection, {
    cascade: true,
  })
  @JoinColumn({
    name: "userId",
  })
  user: User;

  @ManyToOne((_type) => Video, (video) => video.usersLikedConection, {
    cascade: true,
  })
  @JoinColumn({
    name: "videoId",
  })
  video: Video;
}
