import { Video } from './Video';
import { User } from './User';
import { VoteType } from './../types/Action';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class VoteVideo extends BaseEntity {
  @PrimaryColumn()
  public videoId: string

  @PrimaryColumn()
  public userId: string

  @Column({enum: [1, -1]})
  public type: VoteType

  @ManyToOne(
    _to=> User,
    user => user.voteVideosConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User

  @ManyToOne(
    _to => Video,
    video => video.voteVideosConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'videoId'})
  public readonly video: Video
}