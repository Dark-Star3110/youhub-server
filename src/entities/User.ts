import bcrypt from "bcrypt";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../types/Role";
import { Comment } from "./Comment";
import { Subscribe } from "./Subscribe";
import { Video } from "./Video";
import { VoteComment } from "./VoteComment";
import { VoteVideo } from "./VoteVideo";
import { WatchLater } from "./WatchLater";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  // ! la not null
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public username?: string;

  @Column({ nullable: true })
  public password?: string;

  @Field()
  @Column()
  public email!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public socialId?: string;

  @Field()
  @Column()
  public firstName!: string;

  @Field()
  @Column({ default: " " })
  public lastName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public fullName: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  channelDecscription: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public image_url?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public banner_id?: string;

  @Field({ nullable: true })
  @Column("datetime", { nullable: true })
  public dateOfBirth: Date;

  @Field()
  @Column({ enum: ["ADMIN", "USER", "GUEST"], default: "USER" })
  public role: Role;

  @Field()
  @CreateDateColumn({
    type: "datetime2",
  })
  public readonly createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "datetime2" })
  public readonly updatedAt: Date;

  //begin subscribe relationship
  @OneToMany((_to) => Subscribe, (sub) => sub.chanel)
  public readonly chanelsConnection: Subscribe[];

  @Field((_type) => [User], { nullable: true })
  public chanelsSubscribe: User[];

  @OneToMany((_to) => Subscribe, (sub) => sub.subscriber)
  public readonly subscribersConnection: Subscribe[];

  @Field((_type) => [User], { nullable: true })
  public subscribers: User[];
  // end subscribe relationship

  // begin own video relationship
  @OneToMany((_to) => Video, (video) => video.user, {
    nullable: true,
  })
  public videos: Video[];
  // end own video relationship

  // begin vote video relationship
  @OneToMany((_to) => VoteVideo, (voteVideo) => voteVideo.user, {
    nullable: true,
  })
  public readonly voteVideosConnection: VoteVideo[];

  // end vote video relationship

  // watch later video relationship
  @OneToMany((_to) => WatchLater, (wlt) => wlt.user, {
    nullable: true,
  })
  public readonly videosWatchLaterConnection: WatchLater[];

  // own comment relationship
  @OneToMany((_to) => Comment, (cmt) => cmt.user)
  public readonly comments: Comment[];

  // like comment relationship
  @OneToMany((_to) => VoteComment, (voteCmt) => voteCmt.user, {
    nullable: true,
  })
  public readonly voteCommentConnection: VoteComment[];

  @BeforeInsert()
  hashPassword() {
    if (this.password) {
      const hash = bcrypt.hashSync(this.password, 10);
      this.password = hash;
    }
    this.fullName = `${this.lastName} ${this.firstName}`;
  }

  validatePassword(pass: string) {
    if (this.password) return bcrypt.compareSync(pass, this.password);
    return false;
  }
}
