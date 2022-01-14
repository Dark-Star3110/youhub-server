import { AuthenticationError } from "apollo-server-express";
import { JsonWebTokenError } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { User } from "./../entities/User";

export const checkAdmin: MiddlewareFn<Context> = async (
  { context: { req, redis } },
  next
) => {
  if (!req.userId) throw new AuthenticationError("Unauthorized");
  try {
    let user: User | undefined;
    const data = await redis.get(`user_${req.userId}`);
    if (data) {
      user = JSON.parse(data);
      if (!user) throw new AuthenticationError("Unauthorized");
    } else {
      user = await User.findOne({ id: req.userId });
      if (!user) throw new AuthenticationError("Unauthorized");
      redis.set(
        `user_${req.userId}`,
        JSON.stringify(user),
        "ex",
        24 * 60 * 1000
      );
    }
    if (user.role !== "ADMIN") throw new Error("ban dech co quyen");
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof JsonWebTokenError)
      throw new AuthenticationError("Unauthorized");
    else throw new Error("server error");
  }
};
