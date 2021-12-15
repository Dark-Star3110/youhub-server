import { Comment } from './Comment';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { User } from './User';

@Entity()
export class DisLikeComment extends BaseEntity {

  @Column({
    primary: true
  })
  public userId: string

  @Column({
    primary: true
  })
  public commentId: string

  @CreateDateColumn({type: 'datetime2'})
  public readonly dislikedAt: Date

  @ManyToOne(
    _type => User,
    user => user.commentsDisLikedConnection,
    { 
      cascade: true
    }
  ) 
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _type => Comment,
    cmt => cmt.usersDisLikedConnection,
    {
      cascade: true
    }
  )
  public readonly comment: Comment
}