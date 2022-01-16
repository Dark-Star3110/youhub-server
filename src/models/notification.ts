import mongoose from "mongoose";
import { getModelForClass, prop } from "@typegoose/typegoose";

export type Noti = "UPLOAD" | "COMMENT" | "RELY" | "OTHER" | "SUBSCRIBE";

class Notification {
  _id!: mongoose.Types.ObjectId;

  @prop()
  from: string;

  @prop({ required: true })
  to: string;

  @prop({
    enum: ["UPLOAD", "COMMENT", "RELY", "OTHER", "SUBSCRIBE"],
    required: true,
  })
  type: Noti;

  @prop()
  message?: string;

  @prop()
  videoId?: string;

  @prop()
  avatar_url?: string;

  @prop()
  img_url?: string;

  @prop({ default: Date.now, expires: 14 * 24 * 60 * 1000 })
  createdAt: Date;
}

export default getModelForClass(Notification);
