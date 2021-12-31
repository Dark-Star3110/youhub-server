import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";
import jwt from "jsonwebtoken";
import { Payload } from "../types/Payload";
import { User } from "../entities/User";

export const getUserInfo: MiddlewareFn<Context> = async (
  { context: { req, token } },
  next
) => {
  try {
    if (!token) return next();
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as Payload;
    const user = await User.findOne({ id: payload.userId });
    req.user = user;
    return next();
  } catch (error) {
    return next();
  }
};
