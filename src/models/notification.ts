import mongoose from "mongoose";
import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

export enum NotiType {
  UPLOAD = "UPLOAD",
  COMMENT = "COMMENT",
  RELY = "RELY",
  SUBSCRIBE = "SUBSCRIBE",
  LIKECOMMENT = "LIKECOMMENT",
  LIKEVIDEO = "LIKEVIDEO",
  OTHER = "OTHER",
}

registerEnumType(NotiType, {
  name: "Notify",
});

@pre<Notification>("save", function (next) {
  this.from = this.from.toUpperCase();
  this.to = this.to.toUpperCase();
  this.videoId = this.videoId?.toUpperCase();
  this.commentId = this.commentId?.toUpperCase();
  next();
})
@ObjectType()
export class Notification {
  @Field((_type) => ID)
  _id!: mongoose.Types.ObjectId;

  @prop()
  from: string;

  @prop({ required: true })
  to: string;

  @Field()
  @prop({
    enum: NotiType,
    required: true,
  })
  type: NotiType;

  @Field()
  @prop({ default: false })
  readed: boolean;

  @prop()
  message?: string;

  @Field({ nullable: true })
  @prop()
  videoId?: string;

  @Field({ nullable: true })
  commentId?: string;

  @prop({ default: Date.now, expires: 14 * 24 * 60 * 1000 })
  createdAt: Date;
}

export default getModelForClass(Notification);
