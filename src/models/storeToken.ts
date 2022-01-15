import mongoose from "mongoose";
import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

@pre<StoreToken>("save", function (next) {
  this.refreshToken = bcrypt.hashSync(this.refreshToken, 10);
  next();
})
class StoreToken {
  _id!: mongoose.Types.ObjectId;

  @prop({ require: true })
  userId!: string;

  @prop({ require: true })
  refreshToken!: string;

  @prop({ default: Date.now, expires: eval(process.env.REFRESH_TOKEN_EXPIRY) })
  createdAt: Date;

  validToken(token: string): boolean {
    return bcrypt.compareSync(token, this.refreshToken) ? true : false;
  }
}

export default getModelForClass(StoreToken);
