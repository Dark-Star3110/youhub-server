import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Comment } from './Comment';
import { User } from "./User";

// for like video relationship
@Entity()
export class LikeComment extends BaseEntity {
  @Column({
    primary: true
  })
  public commentId: string

  @Column({
    primary: true
  })
  public userId: string

  @CreateDateColumn({type: 'datetime2'})
  public readonly likedAt: Date

  @ManyToOne(
    _type => User,
    user => user.commentsLikedConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _type => Comment,
    cmt => cmt.usersLikedConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'videoId'})
  public readonly comment: Comment
}