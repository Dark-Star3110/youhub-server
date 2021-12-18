import { WatchLater } from './WatchLater';
import { Comment } from './Comment';
import { LikeVideo } from './LikeVideo';
import { Video } from './Video';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../types/Role";
import bcrypt from "bcrypt";
import { Subscribe } from "./Subscribe";
import { DisLikeVideo } from './DislikeVideo';
import { LikeComment } from './LikeComment';
import { DisLikeComment } from './DislikeComment';
import { 
  Field, 
  ID, 
  ObjectType 
} from 'type-graphql';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  // ! la not null
  @Field(_type=>ID)
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Field({nullable: true})
  @Column({nullable: true})
  public username?: string;

  @Column({nullable: true})
  public password?: string;

  @Field()
  @Column({unique: true})
  public email!: string;

  @Field({nullable: true})
  @Column({nullable: true})
  public socialId?: string

  @Field()
  @Column()
  public firstName!: string;

  @Field()
  @Column({default: ' '})
  public lastName: string;

  @Column({nullable: true})
  @Field({nullable: true})
  public fullName: string

  @Field({nullable: true})
  @Column('text', {nullable: true})
  channelDecscription: string

  @Field({nullable: true})
  @Column({nullable: true})
  public image_url?: string;

  @Field({nullable: true})
  @Column('datetime',{nullable: true})
  public dateOfBirth: Date;

  @Field()
  @Column( {enum: ['ADMIN', 'USER', 'GUEST'], default: 'USER'})
  public role: Role;

  @Field()
  @CreateDateColumn({
    type: "datetime2"
  })
  public readonly createdAt: Date;

  @Field()
  @UpdateDateColumn({type: "datetime2"})
  public readonly updatedAt: Date;

  //begin subscribe relationship
  @OneToMany(_type=>Subscribe, sub=>sub.chanel)
  public readonly chanelsConnection: Subscribe[]

  @Field(_type=>[User], {nullable: true})
  public chanelsSubscribe: User[]

  @OneToMany(_type=>Subscribe, sub=>sub.subscriber)
  public readonly subscribersConnection: Subscribe[]

  @Field(_type=>[User], {nullable: true})
  public subscribers: User[]
  // end subscribe relationship

  // begin own video relationship
  @Field(_type=>[Video], {nullable: true})
  @OneToMany(
    _type=>Video, 
    video=>video.user,
    {
      nullable: true
    }
  )
  public videos: Video[]
  // end own video relationship

  // begin like video relationship
  @OneToMany(
    _type=>LikeVideo, 
    likeVideo => likeVideo.user,
    {
      nullable: true
    }
  )
  public readonly videosLikedConnection: LikeVideo[]

  @Field(_type=>[Video], {nullable: true})
  public videosLiked: Video[]
  // end like video relationship

  // begin not interested video relationship
  @OneToMany(
    _type => DisLikeVideo,
    dlVideo => dlVideo.user,
    {
      nullable: true
    }
  )
  public readonly videosDisLikedConnection: DisLikeVideo[]

  @Field(_type=>[Video], {nullable: true})
  public videosDisLiked: Video[]
  // end not interested video relationship

  // watch later video relationship
  @OneToMany(
    _type => WatchLater,
    wlt => wlt.user, {
      nullable: true
    }
  )
  public readonly videosWatchLaterConnection: WatchLater[]

  @Field(_type=>[Video], {nullable: true})
  public watchLaterVideos: Video[]

  // own comment relationship
  @Field(_type=>[Comment], {nullable: true})
  @OneToMany(
    _type=>Comment,
    cmt => cmt.user
  )
  public readonly comments: Comment[]

  // like comment relationship
  @OneToMany(
    _type=>LikeComment, 
    likeCmt => likeCmt.user,
    {
      nullable: true
    }
  )
  public readonly commentsLikedConnection: LikeComment[]

  @Field(_type=>[Comment], {nullable: true})
  public commentsLiked: Comment[]

  //dislike comment relationship
  @OneToMany(
    _type=>DisLikeComment, 
    dislikeCmt => dislikeCmt.user,
    {
      nullable: true
    }
  )
  public readonly commentsDisLikedConnection: LikeComment[]

  @Field(_type=>[Comment], {nullable: true})
  public commentsDisLiked: Comment[] 

  @BeforeInsert()
  hashPassword() {
    if (this.password) {
      const hash = bcrypt.hashSync(this.password, 10);
      this.password = hash;
    }
    this.fullName = `${this.lastName} ${this.firstName}`
  }

  validatePassword(pass: string) {
    if (this.password)
      return bcrypt.compareSync(pass, this.password);
    return false
  }
}
