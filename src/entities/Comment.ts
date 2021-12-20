import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { 
  Field, 
  ID,
  ObjectType 
} from 'type-graphql';
import { LikeComment } from './LikeComment';
import { DisLikeComment } from './DislikeComment';
import { Video } from './Video';
import { User } from './User';

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(_type=>ID)
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public userId: string;

  @Column()
  public videoId: string;

  @Field()
  @Column()
  public content: string;

  @Column({nullable: true})
  public parentCommentId: string;

  @Field()
  @CreateDateColumn({
    type: "datetimeoffset",
  })
  public readonly createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: "datetimeoffset",
  })
  public readonly updatedAt: Date;

  @Field()
  @DeleteDateColumn({
    type: "datetime2",
  })
  public readonly deletedAt: Date;

  // child comment relationship
  @Field(_type=>[Comment], {nullable: true})
  @OneToMany(
    _type=>Comment,
    cmt => cmt.parentComment,
    {
      nullable: true
    }
  )
  public childComments: Comment[]

  @Field(_type=>Comment, {nullable: true})
  @ManyToOne(
    _type => Comment,
    cmt => cmt.childComments,
    {
      cascade: true,
      nullable: true
    }
  )
  @JoinColumn({name: 'parentCommentId'})
  public parentComment: Comment

  // uset own comments relationship
  @Field(_type=>User)
  @ManyToOne(
    _type=>User,
    user=>user.comments,
    {
      cascade: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'userId'})
  public user: User

  // comment video comments relationship
  @Field(_type=>Video)
  @ManyToOne(
    _type=>Video,
    video => video.comments,
    {
      cascade: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'videoId'})
  public video: Video

  // users like this comment relationship
  @OneToMany(
    _type=>LikeComment,
    likeComment => likeComment.comment
  )
  public readonly usersLikedConnection: LikeComment[]

  @Field(_type=>[User], {nullable: true})
  public usersLiked: User[]

  // users dislike this comment relationship
  @OneToMany(
    _type=>DisLikeComment,
    dislikeComment => dislikeComment.comment
  )
  public readonly usersDisLikedConnection: DisLikeComment[]

  @Field(_type=>Number, {nullable: true})
  public numUsersDisLiked: number
}
