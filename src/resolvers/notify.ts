import { Context } from "./../types/Context";
import { Comment } from "./../entities/Comment";
import { User } from "./../entities/User";
import { Notification } from "./../models/notification";
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Video } from "../entities/Video";
import { PaginatedNotification } from "../types/graphql-response/PaginatedNotification";
import NotificationStore from "../models/notification";

@Resolver((_of) => Notification)
class NotifyResolver {
  @FieldResolver((_return) => String)
  async content(@Root() parent: any): Promise<string> {
    try {
      const doc = parent._doc;
      switch (doc.type) {
        case "UPLOAD": {
          const video = await Video.findOne(doc.videoId, {
            select: ["title"],
            relations: ["user"],
          });
          return `${video?.user.fullName} đã đăng một video: ${video?.title}`;
        }
        case "COMMENT": {
          const video = await Video.findOne(doc.videoId, {
            select: ["title"],
          });
          const user = await User.findOne(doc.from, {
            select: ["fullName"],
          });
          return `${user?.fullName} đã bình luận về video của bạn: ${video?.title}`;
        }
        case "RELY": {
          const comment = await Comment.findOne(doc.commentId, {
            select: ["content"],
          });
          const user = await User.findOne(doc.from, {
            select: ["fullName"],
          });
          return `${user?.fullName} đã trả lời một bình luận của bạn: ${comment?.content}`;
        }
        case "LIKECOMMENT": {
          const comment = await Comment.findOne(doc.commentId, {
            select: ["content"],
          });
          const user = await User.findOne(doc.from, {
            select: ["fullName"],
          });
          return `${user?.fullName} đã thích bình luận của bạn: ${comment?.content}`;
        }
        case "LIKEVIDEO": {
          const video = await Video.findOne(doc.videoId, {
            select: ["title"],
          });
          const user = await User.findOne(doc.from, {
            select: ["fullName"],
          });
          return `${user?.fullName} đã thích video của bạn: ${video?.title}`;
        }
        case "OTHER": {
          const user = await User.findOne(doc.from, {
            select: ["fullName"],
          });
          return `Chào ${user?.fullName}, ${doc.message}`;
        }
        default:
          return "";
      }
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  @FieldResolver((_return) => String, { nullable: true })
  async avatar_url(
    @Root() parent: any,
    @Ctx() { dataLoaders }: Context
  ): Promise<string | undefined> {
    return await dataLoaders.avatarUrlLoader.load(parent.from);
  }

  @FieldResolver((_return) => String, { nullable: true })
  async thumnail(
    @Root() parent: any,
    @Ctx() { dataLoaders }: Context
  ): Promise<string | undefined> {
    return parent._doc.videoId
      ? await dataLoaders.thumbnailLoader.load(parent._doc.videoId)
      : undefined;
  }

  @Query((_return) => Notification, { nullable: true })
  async notification(
    @Arg("id", (_type) => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Notification | null | undefined> {
    try {
      const noti = await NotificationStore.findById(id);

      if (!noti || noti.to !== req.userId) return;
      return noti;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query((_return) => PaginatedNotification, { nullable: true })
  async notifications(
    @Arg("limit", (_type) => Int) limit: number,
    @Ctx() { req }: Context,
    @Arg("cursor", (_type) => Int, { nullable: true }) cursor?: number
  ): Promise<PaginatedNotification | undefined> {
    try {
      const realLimit = Math.min(limit, 20);
      if (!req.userId) return;
      const totalCount = await NotificationStore.countDocuments({
        to: req.userId,
      });
      if (totalCount === 0) return;
      if (cursor) {
        const notis = await NotificationStore.find({
          to: req.userId,
        })
          .sort({ createdAt: -1 })
          .limit(realLimit)
          .skip(cursor);
        if (notis.length <= 0) return;
        return {
          totalCount,
          cursor: cursor + notis.length,
          hasMore: cursor + notis.length !== totalCount,
          paginatedNotification: notis,
        };
      } else {
        const notis = await NotificationStore.find({
          to: req.userId,
        })
          .sort({ createdAt: -1 })
          .limit(realLimit);
        return {
          totalCount,
          cursor: notis.length,
          hasMore: notis.length !== totalCount,
          paginatedNotification: notis,
        };
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @FieldResolver((_return) => String)
  createdAt(@Root() parent: any) {
    return parent._doc.createdAt.toString();
  }
}

export { NotifyResolver };
