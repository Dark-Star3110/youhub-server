import { VoteType } from './../types/Action';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Comment } from './Comment';
import { User } from './User';

@Entity()
export class VoteComment extends BaseEntity { 
  @PrimaryColumn()
  public userId: string
  
  @PrimaryColumn()
  public commentId: string
  
  @Column({enum: [1, -1]})
  type: VoteType

  @ManyToOne(
    _to => User, 
    user => user.voteCommentConnection,
    {cascade: true}
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _to => Comment,
    cmt => cmt.voteCommentConnention,
    {cascade: true}
  )
  @JoinColumn({name: 'commentId'})
  public readonly comment: Comment
}