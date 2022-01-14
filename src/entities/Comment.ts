import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Video } from "./Video";
import { VoteComment } from "./VoteComment";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public userId: string;

  @Column()
  public videoId: string;

  @Field()
  @Column()
  public content: string;

  @Column({ nullable: true })
  public parentCommentId: string;

  @Field((_type) => String)
  @CreateDateColumn({
    type: "datetimeoffset",
  })
  public createdAt: Date;

  @Field((_type) => String)
  @UpdateDateColumn({
    type: "datetimeoffset",
  })
  public readonly updatedAt: Date;

  @Field((_type) => String)
  @DeleteDateColumn({
    type: "datetime2",
  })
  public readonly deletedAt: Date;

  // child comment relationship
  @OneToMany((_type) => Comment, (cmt) => cmt.parentComment, {
    nullable: true,
  })
  public childComments: Comment[];

  @Field((_type) => Comment, { nullable: true })
  @ManyToOne((_type) => Comment, (cmt) => cmt.childComments, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: "parentCommentId" })
  public parentComment: Comment;

  // uset own comments relationship
  @Field((_type) => User)
  @ManyToOne((_type) => User, (user) => user.comments, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: "userId" })
  public user: User;

  // comment video comments relationship
  @ManyToOne((_type) => Video, (video) => video.comments, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: "videoId" })
  public video: Video;

  // users vote this comment relationship
  @OneToMany((_to) => VoteComment, (voteCmt) => voteCmt.comment)
  public readonly voteCommentConnention: VoteComment[];

  @Field((_type) => Number, { nullable: true })
  public numUsersLiked: number;

  @Field((_type) => Number, { nullable: true })
  public numUsersDisLiked: number;
}
