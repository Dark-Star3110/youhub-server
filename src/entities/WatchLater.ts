import { Video } from './Video';
import { User } from './User';
import { 
  BaseEntity, 
  Column, 
  Entity, 
  JoinColumn, 
  ManyToOne 
} from "typeorm";

@Entity()
export class WatchLater extends BaseEntity {
  @Column({
    primary: true
  })
  public userId: string

  @Column({
    primary: true
  })
  public videoId: string

  @ManyToOne(
    _type=>User,
    user => user.videosWatchLaterConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _type => Video,
    video => video.usersWatchLaterConnection, 
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'videoId'})
  public readonly video: Video
}