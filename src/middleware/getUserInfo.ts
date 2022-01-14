import { MiddlewareFn } from "type-graphql";
import { User } from "../entities/User";
import { Context } from "../types/Context";

export const getUserInfo: MiddlewareFn<Context> = async (
  { context: { req } },
  next
) => {
  try {
    const user = await User.findOne({ id: req.userId });
    req.user = user;
    return next();
  } catch (error) {
    return next();
  }
};
