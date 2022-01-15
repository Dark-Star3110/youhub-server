import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { sendMail } from "../config/google-api/mail";
import ForgotPasswordToken from "../models/forgotPasswordToken";
import StoreToken from "../models/storeToken";
import { UpdateUserInfoInput } from "../types/graphql-input/UpdateUserInfoInput";
import { getRefreshToken, getToken } from "../utils/generateToken";
import { COOKIE_NAME, COOKIE_OPTIONS, profileGenerateImg } from "./../constant";
import { Subscribe } from "./../entities/Subscribe";
import { User } from "./../entities/User";
import { Video } from "./../entities/Video";
import { checkAuth } from "./../middleware/checkAuth";
import { Action } from "./../types/Action";
import { Context } from "./../types/Context";
import { LoginInput, SocialLogin } from "./../types/graphql-input/LoginInput";
import { SignupInput } from "./../types/graphql-input/SignupInput";
import { SubscribeStatus } from "./../types/graphql-response/SubscribeStatus";
import { UserMutationResponse } from "./../types/graphql-response/UserMutationResponse";
import { Payload } from "./../types/Payload";
import { loginSocial } from "./../utils/loginSocial";

@Resolver((_of) => User)
class UserResolver {
  @Query((_return) => User, { nullable: true })
  @UseMiddleware(checkAuth)
  me(@Ctx() { req }: Context): User | undefined {
    return req.user;
  }

  @Query((_return) => User, { nullable: true })
  async user(
    @Arg("userId", (_type) => ID) userId: string,
    @Ctx() { redis }: Context
  ): Promise<User | undefined> {
    try {
      const data = await redis.get(`user_${userId}`);

      if (data) {
        return JSON.parse(data);
      } else {
        return User.findOne(userId);
      }
    } catch (error) {
      return;
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async signup(
    @Arg("signupInput") signupInput: SignupInput
  ): Promise<UserMutationResponse> {
    try {
      const { username, email } = signupInput;
      const exsistingUsers = await User.find({
        where: [{ username }, { email }],
      });

      if (exsistingUsers.length > 0)
        return {
          code: 400,
          success: false,
          message: "Duplicate username or email",
          errors: [
            {
              type: "Duplicate",
              error: "Username or email has already been exsisted",
            },
          ],
        };

      const image_url = profileGenerateImg[Math.floor(Math.random() * 10)];

      const newUser = User.create({ ...signupInput, image_url });
      await newUser.save();

      return {
        code: 200,
        success: true,
        message: "sign up successfully",
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "server error",
        errors: [
          {
            type: "Server",
            error: `${error}`,
          },
        ],
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Ctx() { res, redis }: Context,
    @Arg("socialLogin", { nullable: true }) socialLogin?: SocialLogin,
    @Arg("loginInput", { nullable: true }) loginInput?: LoginInput
  ): Promise<UserMutationResponse> {
    let user: User | null | undefined;
    if (socialLogin) {
      user = await loginSocial(socialLogin);
      if (!user)
        return {
          code: 401,
          success: false,
          message: `login with ${socialLogin.type} fail`,
        };
    } else if (loginInput) {
      try {
        const { username, password } = loginInput;
        user = await User.findOne({ username });

        if (!user || !user.validatePassword(password))
          return {
            code: 401,
            success: false,
            message: "Login failed",
            errors: [
              {
                type: "InvalidUser",
                error: "username or password incorrect",
              },
            ],
          };
      } catch (error) {
        console.log(error);
        return {
          code: 500,
          success: false,
          message: "server error",
          errors: [
            {
              type: "Server",
              error: `${error}`,
            },
          ],
        };
      }
    }
    if (!user)
      return {
        code: 400,
        success: false,
        message: "invalid require",
      };
    else {
      const token = getToken({
        userId: user.id,
      });
      const refreshToken = getRefreshToken({
        userId: user.id,
      });

      try {
        if ((await redis.exists(`user_${user.id}`)) === 0) {
          await redis.set(
            `user_${user.id}`,
            JSON.stringify(user),
            "ex",
            24 * 60 * 1000
          );
        }
        res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        await new StoreToken({ userId: user.id, refreshToken }).save();

        return {
          code: 200,
          success: true,
          message: "login successfully",
          token,
        };
      } catch (error) {
        console.log(error);
        return {
          code: 500,
          success: false,
          message: "server error",
          errors: [
            {
              type: "Server",
              error: `${error}`,
            },
          ],
        };
      }
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async refreshToken(
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
    const { signedCookies = {} } = req;
    const refreshToken = <string>signedCookies.refreshToken || undefined;

    if (refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as Payload;
        const users = await StoreToken.find({ userId: payload.userId });
        const index = users.findIndex((user) => user.validToken(refreshToken));
        if (users.length <= 0 && index === -1) {
          return {
            code: 401,
            success: false,
            message: "unauthorized",
          };
        }

        await users[index].remove();
        const token = getToken({
          userId: payload.userId,
        });
        const newRefreshToken = getRefreshToken({
          userId: payload.userId,
        });
        await new StoreToken({
          userId: payload.userId,
          refreshToken: newRefreshToken,
        }).save();

        res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
        return {
          code: 200,
          success: true,
          message: "refreshToken successfully",
          token,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: "server internal",
          errors: [
            {
              type: "Server",
              error: `${error}`,
            },
          ],
        };
      }
    } else {
      return {
        code: 401,
        success: false,
        message: "unauthorized",
      };
    }
  }

  @Mutation((_return) => Boolean)
  @UseMiddleware(checkAuth)
  async logout(@Ctx() { req, res }: Context): Promise<Boolean> {
    const { signedCookies = {} } = req;
    const refreshToken = <string>signedCookies.refreshToken || "";

    try {
      const users = await StoreToken.find({ userId: req.user?.id });
      const index = users.findIndex((user) => user.validToken(refreshToken));

      if (index !== -1) await users[index].remove();
      res.clearCookie(COOKIE_NAME);

      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation((_return) => UserMutationResponse)
  @UseMiddleware(checkAuth)
  async updateInfo(
    @Arg("updateInput") updateInput: UpdateUserInfoInput,
    @Ctx() { req, redis }: Context
  ): Promise<UserMutationResponse> {
    try {
      const user = await User.findOne(req.user?.id);
      if (!user) {
        return {
          code: 400,
          success: false,
          message: "User not found",
        };
      }
      await User.update(
        {
          id: req.user?.id,
        },
        {
          ...updateInput,
        }
      );
      if ((await redis.exists(`user_${user.id}`)) === 0) {
        await redis.del(`user_${user.id}`);
      }
      return {
        code: 200,
        success: false,
        message: "Update user information successfully",
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "Server Error",
        errors: [
          {
            type: "server",
            error,
          },
        ],
      };
    }
  }

  @Mutation((_return) => Boolean)
  async forgotPassword(@Arg("email") email: string) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user || user.socialId) return false;

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "5min",
        }
      );

      await new ForgotPasswordToken({ token, userId: user.id }).save();
      const html = `
Hello ${user.username}
<a href="${process.env.CLIENT_DOMAINS}/change-password?token=${token}">Click here to change your password</a>
      `;
      await sendMail(email, "Change Password", html);
      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  @Mutation((_return) => Boolean)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      const userId = payload.id;
      const record = await ForgotPasswordToken.findOne({ userId });
      if (!record || !record.validToken(token)) return false;
      const newHashPassword = bcrypt.hashSync(newPassword, 10);
      await User.update({ id: userId }, { password: newHashPassword });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation((_return) => UserMutationResponse)
  @UseMiddleware(checkAuth)
  async subscribe(
    @Arg("chanelId", (_type) => ID) chanelId: string,
    @Arg("action", (_type) => Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const relation = await Subscribe.findOne({
        chanelId,
        subscriberId: req.user?.id,
      });
      if (action === Action.ACTIVATE && relation)
        return {
          code: 400,
          success: false,
          message: "you have followed this chanel",
        };
      if (action === Action.DISACTIVATE && !relation)
        return {
          code: 400,
          success: false,
          message: "you never followed this chanel",
        };
      action === Action.ACTIVATE
        ? await Subscribe.create({
            chanelId,
            subscriberId: req.user?.id,
          }).save()
        : await relation?.remove();
      return {
        code: 200,
        success: true,
        message: `${action === Action.ACTIVATE ? "" : "un"}follow successfully`,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: "Server error",
        errors: [{ type: "server", error }],
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  @UseMiddleware(checkAuth)
  async onNotification(
    @Arg("chanelId", (_type) => ID) chanelId: string,
    @Arg("action", (_type) => Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const subscribe = await Subscribe.findOne({
        chanelId,
        subscriberId: req.user?.id,
      });
      if (!subscribe)
        return {
          code: 400,
          success: false,
          message: "You never follow this chanel",
        };
      const newAction = action === Action.ACTIVATE ? true : false;
      if (newAction === subscribe.isNotification) {
        return {
          code: 400,
          success: false,
          message: "You have yet done it",
        };
      }
      subscribe.isNotification = newAction;
      await subscribe.save();
      return {
        code: 200,
        success: true,
        message: "successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: "Server error",
        errors: [{ type: "server", error }],
      };
    }
  }

  @FieldResolver((_return) => SubscribeStatus)
  async subscribeStatus(
    @Ctx() { req, dataLoaders }: Context,
    @Root() parent: User
  ) {
    return await dataLoaders.subscribeStatusLoader.load({
      chanelId: parent.id,
      subscriberId: req.userId,
    });
  }

  @FieldResolver((_return) => String)
  createdAt(@Root() parent: User): string {
    return parent.createdAt.toString();
  }

  @FieldResolver((_return) => String)
  updatedAt(@Root() parent: User): string {
    return parent.updatedAt.toString();
  }

  @FieldResolver((_return) => String)
  role(@Root() parent: User, @Ctx() { req }: Context): string {
    return parent.id === req.userId ? parent.role : "";
  }

  @FieldResolver((_return) => String)
  email(@Root() parent: User, @Ctx() { req }: Context): string {
    return parent.id === req.userId || parent.role === "ADMIN"
      ? parent.email
      : "";
  }

  @FieldResolver((_return) => String, { nullable: true })
  socialId(@Root() parent: User, @Ctx() { req }: Context): String | undefined {
    return parent.id === req.userId || parent.role === "ADMIN"
      ? parent.socialId
      : "";
  }

  @FieldResolver((_return) => String)
  image_url(@Root() parent: User) {
    if (parent.image_url?.indexOf("http") !== -1) return parent.image_url;
    else
      return `https://drive.google.com/uc?export=view&id=${parent.image_url}`;
  }

  @FieldResolver((_return) => String)
  banner_url(@Root() parent: User) {
    return parent.banner_id
      ? `https://drive.google.com/uc?export=view&id=${parent.banner_id}`
      : "";
  }

  @FieldResolver((_return) => String, { nullable: true })
  dateOfBirth(@Root() parent: User, @Ctx() { req }: Context) {
    if (parent.id !== req.userId) return;
    return parent.dateOfBirth;
  }

  @FieldResolver((_return) => [User], { nullable: true })
  async chanelsSubscribe(
    @Root() parent: User,
    @Ctx() { dataLoaders, req }: Context
  ): Promise<User[] | undefined> {
    if (req.userId !== parent.id) return;
    return await dataLoaders.channelLoader.load(parent.id);
  }

  @FieldResolver((_return) => [User], { nullable: true })
  async subscribers(
    @Root() parent: User,
    @Ctx() { dataLoaders, req }: Context
  ): Promise<User[] | undefined> {
    if (req.userId !== parent.id) return;
    return await dataLoaders.subscriberLoader.load(parent.id);
  }

  @FieldResolver((_return) => Int)
  async numSubscribers(@Root() parent: User): Promise<number> {
    return await Subscribe.count({ where: { chanelId: parent.id } });
  }

  @FieldResolver((_return) => Int)
  async numVideo(@Root() parent: User): Promise<number> {
    return await Video.count({ where: { userId: parent.id } });
  }
}

export { UserResolver };
