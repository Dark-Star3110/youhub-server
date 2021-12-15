import { Video } from './Video';
import { 
  BaseEntity, 
  Column, 
  CreateDateColumn, 
  Entity, 
  JoinColumn, 
  ManyToOne
} from "typeorm";
import { User } from "./User";

// for like video relationship
@Entity()
export class LikeVideo extends BaseEntity {
  @Column({
    primary: true
  })
  public userId: string

  @Column({
    primary: true
  })
  public videoId: string

  @CreateDateColumn({type: 'datetime2'})
  public readonly likedAt: Date

  @ManyToOne(
    _type => User,
    user => user.videosLikedConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _type => Video,
    video => video.usersLikedConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'videoId'})
  public readonly video: Video
}