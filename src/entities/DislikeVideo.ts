import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { User } from './User';
import { Video } from './Video';

@Entity()
export class DisLikeVideo extends BaseEntity {

  @Column({
    primary: true
  })
  public userId: string

  @Column({
    primary: true
  })
  public videoId: string

  @CreateDateColumn({type: 'datetime2'})
  public readonly dislikedAt: Date

  @ManyToOne(
    _type => User,
    user => user.videosDisLikedConnection,
    { 
      cascade: true
    }
  ) 
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _type => Video,
    video => video.usersDisLikedConnection,
    {
      cascade: true
    }
  )
  public readonly video: Video
}