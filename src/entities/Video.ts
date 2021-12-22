import {
  Field,
  ID,
  ObjectType
} from 'type-graphql';
import {
  BaseEntity, Column,
  CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn
} from "typeorm";
import { Catagory } from './Catagory';
import { Comment } from './Comment';
import { User } from './User';
import { VideoCatagory } from './VideoCatagory';
import { VoteVideo } from './VoteVideo';
import { WatchLater } from './WatchLater';

@ObjectType()
@Entity()
export class Video extends BaseEntity {
  // ! la not null
  // lay  tu google drive
  @Field(_type=>ID)
  @Column({
    primary: true
  })
  public id!: string;

  @Field()
  @Column()
  public title!: string;

  @Field()
  @Column()
  public description!: string;

  @Field()
  @Column({
    default: true
  })
  public commentable: boolean;

  @Field({nullable: true})
  @Column({nullable: true})
  public thumbnailUrl?: string;

  @Field()
  @Column()
  public size!: string;

  @Column()
  public userId!: string;
  
  @Field()
  @CreateDateColumn({
    type: "datetimeoffset",
  })
  public createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: "datetimeoffset",
  })
  public readonly updatedAt: Date;

  // begin user own relationship
  @Field(_type=>User)
  @ManyToOne(
    _type=>User, 
    user=>user.videos,
    {
      cascade: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'userId'})
  public readonly user: User
  // end user own relationship

  // begin user vote video relationship

  @OneToMany(
    _to => VoteVideo,
    voteVideo => voteVideo.video,
    {nullable: true}
  )
  public readonly voteVideosConnection: VoteVideo[]

  @Field(_type=>[User], {nullable: true})
  public usersLiked: User[]
  // end user vote video relationship

  @Field(_type=>Number, {nullable: true})
  public numUsersDisLiked: number

  // watch later
  @OneToMany(
    _type => WatchLater,
    wlt => wlt.video,
    {
      nullable: true
    }
  )
  public readonly usersWatchLaterConnection: WatchLater[]

  @Field(_type=>[User], {nullable: true})
  public usersWatchLater: User[]

  // video contain comments relationship
  @Field(_type=>[Comment], {nullable: true})
  @OneToMany(
    _type=>Comment,
    cmt => cmt.video
  )
  public comments: Comment[]

  // catagory relationship
  @OneToMany(
    _type=>VideoCatagory,
    videoCatagory => videoCatagory.video
  )
  public readonly catagoryConnection: VideoCatagory[]

  @Field(_type=>[Catagory], {nullable: true})
  public catagories: Catagory[]
}