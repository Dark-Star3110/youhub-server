import mongoose from "mongoose";
import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

@pre<ForgotPasswordToken>("save", function (next) {
  this.token = bcrypt.hashSync(this.token, 10);
  next();
})
class ForgotPasswordToken {
  _id!: mongoose.Types.ObjectId;

  @prop({ require: true })
  userId!: string;

  @prop({ require: true })
  token!: string;

  @prop({ default: Date.now, expires: 5 * 60 })
  createdAt: Date;

  validToken(token: string): boolean {
    return bcrypt.compareSync(token, this.token) ? true : false;
  }
}

export default getModelForClass(ForgotPasswordToken);
