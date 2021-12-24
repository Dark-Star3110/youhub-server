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
import { FindConditions, FindManyOptions, In, LessThan, Like } from "typeorm";
import { Action, VoteType } from "../types/Action";
import { checkThumbnailImg } from "../utils/checkThumbnailImg";
import { deleteFile } from "../utils/deleteFile";
import { Catagory } from "./../entities/Catagory";
import { User } from "./../entities/User";
import { Video } from "./../entities/Video";
import { VideoCatagory } from "./../entities/VideoCatagory";
import { VoteVideo } from "./../entities/VoteVideo";
import { WatchLater } from "./../entities/WatchLater";
import { checkAuth } from "./../middleware/checkAuth";
import { Context } from "./../types/Context";
import { CreateVideoInput } from "./../types/graphql-input/CreateVideoInput";
import { UpdateVideoInput } from "./../types/graphql-input/UpdateVideoInput";
import { PaginatedVideos } from "./../types/graphql-response/PaginatedPosts";
import { VideoMutationResponse } from "./../types/graphql-response/VideoMutationResponse";

@Resolver((_of) => Video)
class VideoResolver {
  @Query((_return) => Video, { nullable: true })
  async video(
    @Arg("id", (_type) => ID) id: string
  ): Promise<Video | undefined> {
    try {
      return await Video.findOne(id);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query((_return) => PaginatedVideos, { nullable: true })
  async videos(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string,
    @Arg("userId", { nullable: true }) userId?: string,
    @Arg("user", (_type) => [String!], { nullable: true }) user?: string[],
    @Arg("catagory", (_type) => [String!], { nullable: true })
    catagory?: string[],
    @Arg("catagoryId", { nullable: true }) catagoryId?: string,
    @Arg("query", { nullable: true }) query?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      let totalCount: number = 0;
      const realLimit = cursor ? Math.min(limit, 12) : Math.min(limit, 20);
      const where: FindConditions<Video> = {};
      const findOptions: FindManyOptions<Video> = {
        where,
        order: {
          createdAt: "DESC",
        },
      };
      if (user) {
        const records = await User.find({
          where: {
            fullName: Like(
              user.reduce<string[]>((prev, curr) => [...prev, `%${curr}%`], [])
            ),
          },
        });
        where.userId = In(
          records.reduce<string[]>((prev, curr) => [...prev, curr.id], [])
        );
      }
      if (userId) {
        where.userId = userId;
      }

      if (catagory) {
        const records = await Catagory.find({
          where: {
            name: Like(
              catagory.reduce<string[]>(
                (prev, curr) => [...prev, `%${curr}%`],
                []
              )
            ),
          },
        });
        const catagoryIds = records.reduce<string[]>(
          (prev, curr) => [...prev, curr.id],
          []
        );
        const vcatagories = await VideoCatagory.find({
          where: { catagoryId: In(catagoryIds) },
        });
        where.id = In(
          vcatagories.reduce<string[]>(
            (prev, curr) => [...prev, curr.videoId],
            []
          )
        );
      }

      if (catagoryId) {
        const records = await VideoCatagory.find({ where: { catagoryId } });
        where.id = In(
          records.reduce<string[]>((prev, curr) => [...prev, curr.videoId], [])
        );
      }

      if (query) {
        where.title = Like(`%${query}%`);
      }

      totalCount = await Video.count(findOptions);
      if (totalCount === 0) return;

      let lastVideo: Video[] = [];
      if (cursor) {
        where.createdAt = LessThan(cursor);
        lastVideo = await Video.find({
          ...findOptions,
          order: { createdAt: "ASC" },
          take: 1,
        });
      }
      findOptions.take = realLimit;

      const videos = await Video.find(findOptions);
      if (videos.length <= 0) return;
      return {
        totalCount: totalCount,
        cursor: videos[videos.length - 1].createdAt,
        hasMore: cursor
          ? videos[videos.length - 1].createdAt.toString() !==
            lastVideo[0].createdAt.toString()
          : videos.length !== totalCount,
        paginatedVideos: videos,
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async createVideo(
    @Arg("createVideoInput") createVideoInput: CreateVideoInput,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = Video.create({
        ...createVideoInput,
        userId: req.user?.id,
      });
      await video.save();
      return {
        code: 200,
        success: true,
        message: "create video successfully",
        video,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
        message: "server internal",
        errors: [
          {
            type: "server",
            error,
          },
        ],
      };
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async updateVideo(
    @Arg("videoId", (_type) => ID) videoId: string,
    @Arg("updateVideoInput") updateVideoInput: UpdateVideoInput,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video || video.userId !== req.user?.id)
        return {
          code: 400,
          success: false,
          message: "video not found",
        };
      if (video.userId !== req.user?.id)
        return {
          code: 401,
          success: false,
          message: "Unauthorized",
        };
      await Video.update({ id: videoId }, { ...updateVideoInput });
      return {
        code: 200,
        success: true,
        message: "video update successfully",
        video,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "server internal",
        errors: [
          {
            type: "server",
            error,
          },
        ],
      };
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async deleteVideo(
    @Arg("videoId", (_type) => ID) videoId: string,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video)
        return {
          code: 400,
          success: false,
          message: "video not found",
        };
      if (video.userId !== req.user?.id || req.user.role !== "ADMIN")
        return {
          code: 401,
          success: false,
          message: "unauthorized",
        };
      const thumbnailFileId =
        video.thumbnailUrl?.indexOf("https://lh3.googleusercontent.com/") !== -1
          ? video.thumbnailUrl
          : null;
      await video.remove();
      await deleteFile(videoId);
      if (thumbnailFileId) await deleteFile(thumbnailFileId);
      return {
        code: 200,
        success: true,
        message: "delete successfully",
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "server internal",
        errors: [
          {
            type: "server",
            error,
          },
        ],
      };
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async voteVideo(
    @Arg("videoId", (_type) => ID) videoId: string,
    @Arg("type", (_type) => VoteType) type: VoteType,
    @Arg("action", (_type) => Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video) {
        return {
          code: 400,
          success: false,
          message: "Video not found",
        };
      }
      const userId = req.user?.id as string;
      const prevAction = await VoteVideo.findOne({ userId, videoId });
      if (prevAction) {
        if (prevAction.type === type) {
          if (action === Action.ACTIVATE) {
            return {
              code: 400,
              success: false,
              message: `you already ${
                type === 1 ? "like" : "dislike"
              } this video`,
            };
          } else {
            await prevAction.remove();
            return {
              code: 200,
              success: true,
              message: `remove ${type === 1 ? "like" : "dislike"} successfully`,
            };
          }
        } else {
          if (action === Action.ACTIVATE) {
            prevAction.type = type;
            await prevAction.save();
            return {
              code: 200,
              success: true,
              message: `${type === 1 ? "like" : "dislike"} successfully`,
            };
          } else {
            return {
              code: 400,
              success: false,
              message: `dissmision action`,
            };
          }
        }
      } else {
        if (action === Action.DISACTIVATE)
          return {
            code: 400,
            success: false,
            message: `you nerver ${type === 1 ? "like" : "dislike"} this video`,
          };
        else {
          await VoteVideo.create({ userId, videoId, type }).save();
          return {
            code: 200,
            success: true,
            message: `${type === 1 ? "like" : "dislike"} video successfully`,
          };
        }
      }
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
        message: "server error",
        errors: [
          {
            type: "server",
            error,
          },
        ],
      };
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async watchLater(
    @Arg("videoId", (_type) => ID) videoId: string,
    @Arg("action", (_type) => Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video) {
        return {
          code: 400,
          success: false,
          message: "Video not found",
        };
      }
      const userId = req.user?.id as string;
      const record = await WatchLater.findOne({ where: { userId, videoId } });

      if (action === Action.ACTIVATE && record)
        return {
          code: 400,
          success: false,
          message: "Video already exists in watch later",
        };
      if (action === Action.DISACTIVATE && !record)
        return {
          code: 400,
          success: false,
          message: "Video don't exist in watch later",
        };
      action === Action.ACTIVATE
        ? await WatchLater.create({ userId, videoId }).save()
        : await (record as WatchLater).remove();

      return {
        code: 200,
        success: true,
        message: `${
          action === Action.ACTIVATE ? "add" : "remove"
        } video from watch later`,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "server internal",
        errors: [{ type: "server", error }],
      };
    }
  }

  @FieldResolver((_return) => String, { nullable: true })
  async thumbnailUrl(@Root() parent: Video): Promise<string | undefined> {
    if (!parent.thumbnailUrl) {
      const check = checkThumbnailImg(parent.id);
      if (!check) {
        return;
      } else {
        return `https://drive.google.com/thumbnail?authuser=0&sz=h200&id=${parent.id}`;
      }
    } else
      return `https://drive.google.com/uc?export=view&id=${parent.thumbnailUrl}`;
  }

  @FieldResolver((_type) => User, { nullable: true })
  async user(@Root() parent: Video): Promise<User | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id,
      },
      relations: ["user"],
    });
    return video?.user;
  }

  @FieldResolver((_type) => Number, { nullable: true })
  async numUsersLiked(@Root() parent: Video): Promise<number | undefined> {
    return await VoteVideo.count({
      where: { videoId: parent.id, type: 1 },
    });
  }

  @FieldResolver((_type) => Number, { nullable: true })
  async numUsersDisLiked(@Root() parent: Video): Promise<Number | undefined> {
    return await VoteVideo.count({
      where: { videoId: parent.id, type: -1 },
    });
  }

  @FieldResolver((_type) => [Catagory], { nullable: true })
  async catagories(@Root() parent: Video): Promise<Catagory[] | undefined> {
    const videoCatagories = await VideoCatagory.find({
      where: { videoId: parent.id },
      relations: ["catagory"],
    });
    return videoCatagories.map((vc) => vc.catagory);
  }
}

export { VideoResolver };
