import mongoose from "mongoose";
import { getModelForClass, prop } from "@typegoose/typegoose";

class Notification {
  _id!: mongoose.Types.ObjectId;

  @prop()
  from: string;

  @prop({ required: true })
  to: string;
}

export default getModelForClass(Notification);
