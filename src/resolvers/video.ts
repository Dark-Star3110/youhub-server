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
import {
  FindConditions,
  FindManyOptions,
  In,
  LessThan,
  Like,
  Not,
} from "typeorm";
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
    @Arg("id", (_type) => ID) id: string,
    @Ctx() { redis }: Context
  ): Promise<Video | undefined> {
    try {
      const data = await redis.get(`video_${id}`);
      if (data) {
        return JSON.parse(data);
      } else {
        const video = await Video.findOne(id);
        if (video)
          await redis.set(
            `video_${id}`,
            JSON.stringify(video),
            "ex",
            24 * 60 * 1000
          );
        return video;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query((_return) => PaginatedVideos, { nullable: true })
  async videos(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      let totalCount: number = 0;
      const realLimit = cursor ? Math.min(limit, 12) : Math.min(limit, 20);
      const findOptions: FindManyOptions<Video> = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };

      totalCount = await Video.count(findOptions);
      if (totalCount === 0) return;

      let lastVideo: Video[] = [];
      if (cursor) {
        lastVideo = await Video.find({
          order: { createdAt: "ASC" },
          take: 1,
        });
        findOptions.where = {
          createdAt: LessThan(cursor),
        };
      }

      findOptions.cache = {
        id: `video_${cursor}`,
        milliseconds: 60000,
      };

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

  @Query((_return) => PaginatedVideos, { nullable: true })
  async find(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("query") query: string,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    const realLimit = Math.min(limit, 20);
    let lastVideo: Video[] = [];
    const where: FindConditions<Video>[] = [{ title: Like(`%${query}%`) }];
    const findOptions: FindManyOptions<Video> = {
      where,
      order: { createdAt: "DESC" },
    };
    const users = await User.find({
      select: ["id"],
      where: { fullName: Like(`%${query}%`) },
    });
    if (users.length > 0)
      where.push({ userId: In(users.map((user) => user.id)) });
    const catagories = await Catagory.find({
      select: ["id"],
      where: { name: Like(`%${query}%`) },
    });
    const videosCata = await VideoCatagory.find({
      select: ["videoId"],
      where: { catagoryId: In(catagories.map((cata) => cata.id)) },
    });
    if (videosCata.length > 0)
      where.push({ id: In(videosCata.map((v) => v.videoId)) });

    const totalCount = await Video.count(findOptions);
    if (totalCount === 0) return;
    findOptions.take = realLimit;
    if (cursor) {
      lastVideo = await Video.find({
        ...findOptions,
        order: { createdAt: "ASC" },
        take: 1,
      });
      findOptions.where = where.map((condition) => ({
        ...condition,
        createdAt: LessThan(cursor),
      }));
    }
    const videos = await Video.find(findOptions);
    if (videos.length <= 0) return;

    return {
      totalCount,
      cursor: videos[videos.length - 1].createdAt,
      hasMore: cursor
        ? videos[videos.length - 1].createdAt.toString() !==
          lastVideo[0].createdAt.toString()
        : totalCount !== videos.length,
      paginatedVideos: videos,
    };
  }

  @Query((_return) => PaginatedVideos, { nullable: true })
  async videoConcern(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("videoId", (_type) => ID) videoId: string,
    @Ctx() { redis }: Context,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      console.log(videoId);
      const realLimit = Math.min(limit, 20);
      let videosId: string[] = [];
      let video: Video | undefined;
      let lastVideo: Video[] = [];
      const findOptions: FindManyOptions<Video> = {
        order: {
          createdAt: "DESC",
        },
      };
      const data = await redis.get(`video_${videoId}`);
      if (data) video = JSON.parse(data);
      else video = await Video.findOne(videoId, { select: ["userId"] });
      const videoCategory = await VideoCatagory.find({
        where: { videoId },
        select: ["catagoryId"],
      });
      if (videoCategory.length > 0) {
        const categoriesId = videoCategory.map((vc) => vc.catagoryId);
        const videoCategories = await VideoCatagory.find({
          where: { catagoryId: In(categoriesId), videoId: Not(videoId) },
          select: ["videoId"],
        });
        videosId = videoCategories.map((vc) => vc.videoId);
      }
      console.log(videosId);
      findOptions.where = [
        { userId: video?.userId, id: Not(videoId) },
        { id: In(videosId) },
      ];
      const totalCount = await Video.count(findOptions);
      if (totalCount <= 0) return;

      findOptions.take = realLimit;
      if (cursor) {
        findOptions.where = findOptions.where.map(
          (option: FindConditions<Video>) => ({
            ...option,
            createdAt: LessThan(cursor),
          })
        );
        lastVideo = await Video.find({
          ...findOptions,
          order: { createdAt: "ASC" },
        });
      }
      const videos = await Video.find(findOptions);
      return {
        totalCount,
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

  @Query((_return) => PaginatedVideos, { nullable: true })
  async videoUser(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("userId", (_type) => ID) userId: string,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      const realLimit = Math.min(limit, 20);
      let lastVideo: Video[] = [];
      const totalCount = await Video.count({
        where: { userId },
      });
      if (totalCount === 0) return;
      const findOptions: FindManyOptions<Video> = {
        order: {
          createdAt: "DESC",
        },
        where: { userId },
        take: realLimit,
      };
      if (cursor) {
        lastVideo = await Video.find({
          where: { userId },
          order: { createdAt: "ASC" },
          take: 1,
        });
        findOptions.where = {
          userId,
          createdAt: LessThan(cursor),
        };
      }
      const videos = await Video.find(findOptions);
      if (videos.length <= 0) return;
      return {
        totalCount,
        cursor: videos[videos.length - 1].createdAt,
        hasMore: cursor
          ? videos[videos.length - 1].createdAt.toString() !==
            lastVideo[0].createdAt.toString()
          : totalCount !== videos.length,
        paginatedVideos: videos,
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query((_return) => PaginatedVideos, { nullable: true })
  @UseMiddleware(checkAuth)
  async videosWatchLater(
    @Arg("limit", (_type) => Int) limit: number,
    @Ctx() { req }: Context,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      const userId = req.user?.id as string;
      const realLimit = Math.min(limit, 12);
      const totalCount = await WatchLater.count({
        where: { userId },
      });

      let lastWatchVideo: WatchLater[] = [];
      const findOptions: FindManyOptions<WatchLater> = {
        order: {
          createdAt: "DESC",
        },
        where: { userId },
        take: realLimit,
      };
      if (cursor) {
        lastWatchVideo = await VoteVideo.find({
          where: { userId },
          order: { createdAt: "ASC" },
          take: 1,
        });
        findOptions.where = {
          userId,
          cursor: LessThan(cursor),
        };
      }
      findOptions.relations = ["video"];
      const watchVideos = await WatchLater.find(findOptions);
      if (watchVideos.length <= 0) return;

      return {
        totalCount,
        cursor: watchVideos[watchVideos.length - 1].createdAt,
        hasMore: cursor
          ? watchVideos[watchVideos.length - 1].createdAt.toString() !==
            lastWatchVideo[0].createdAt.toString()
          : totalCount !== watchVideos.length,
        paginatedVideos: watchVideos.map((wv) => wv.video),
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query((_return) => PaginatedVideos, { nullable: true })
  @UseMiddleware(checkAuth)
  async videosVoted(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("type") type: VoteType,
    @Ctx() { req }: Context,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      const userId = req.user?.id as string;
      const realLimit = Math.min(limit, 12);
      const totalCount = await VoteVideo.count({
        where: { userId, type },
      });

      let lastVideoVoted: VoteVideo[] = [];
      const findOptions: FindManyOptions<VoteVideo> = {
        order: {
          updatedAt: "DESC",
        },
        where: { userId, type },
        take: realLimit,
      };
      if (cursor) {
        lastVideoVoted = await VoteVideo.find({
          where: { userId, type },
          order: { updatedAt: "ASC" },
          take: 1,
        });
        findOptions.where = {
          userId,
          cursor: LessThan(cursor),
        };
      }
      findOptions.relations = ["video"];
      const videosVoted = await VoteVideo.find(findOptions);
      if (videosVoted.length <= 0) return;

      return {
        totalCount,
        cursor: videosVoted[videosVoted.length - 1].updatedAt,
        hasMore: cursor
          ? videosVoted[videosVoted.length - 1].updatedAt.toString() !==
            lastVideoVoted[0].updatedAt.toString()
          : totalCount !== videosVoted.length,
        paginatedVideos: videosVoted.map((videoVoted) => videoVoted.video),
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Mutation((_return) => VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async createVideo(
    @Arg("createVideoInput")
    { categoriesId, ...restCreateVideoInput }: CreateVideoInput,
    @Ctx() { req, connection }: Context
  ): Promise<VideoMutationResponse> {
    try {
      let video: Video | undefined;
      await connection.transaction(async (transactionEntityManager) => {
        video = await transactionEntityManager
          .create(Video, {
            ...restCreateVideoInput,
            userId: req.userId,
          })
          .save();
        categoriesId?.map(async (categoryId) => {
          await transactionEntityManager
            .create(VideoCatagory, {
              catagoryId: categoryId,
              videoId: restCreateVideoInput.id,
            })
            .save();
        });
      });
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
    @Ctx() { req, redis }: Context
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
      await redis.del(`video_${videoId}`);
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
    @Ctx() { req, redis }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video)
        return {
          code: 400,
          success: false,
          message: "video not found",
        };

      if (req.user?.role !== "ADMIN" && video.userId !== req.user?.id) {
        return {
          code: 401,
          success: false,
          message: "unauthorized",
        };
      }
      const thumbnailFileId =
        video.thumbnailUrl?.indexOf("https://lh3.googleusercontent.com/") !== -1
          ? video.thumbnailUrl
          : null;
      await video.remove();
      await deleteFile(videoId);
      if (thumbnailFileId) await deleteFile(thumbnailFileId);

      await redis.del(`video_${videoId}`);
      return {
        code: 200,
        success: true,
        message: "delete successfully",
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
  async voteVideo(
    @Arg("videoId", (_type) => ID) videoId: string,
    @Arg("type", (_type) => VoteType) type: VoteType,
    @Arg("action", (_type) => Action) action: Action,
    @Ctx() { req, redis }: Context
  ): Promise<VideoMutationResponse> {
    try {
      let video: Video | undefined;
      const data = await redis.get(`video_${videoId}`);
      if (data) {
        video = JSON.parse(data);
      } else {
        video = await Video.findOne(videoId);
        if (video)
          await redis.set(
            `video_${video.id}`,
            JSON.stringify(video),
            "ex",
            24 * 60 * 1000
          );
      }
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
      let video = await Video.findOne(videoId);
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

  @FieldResolver((_return) => String)
  createdAt(@Root() parent: Video): string {
    return parent.createdAt.toString();
  }

  @FieldResolver((_return) => String)
  updatedAt(@Root() parent: Video): string {
    return parent.updatedAt.toString();
  }

  @FieldResolver((_return) => String, { nullable: true })
  async thumbnailUrl(@Root() parent: Video): Promise<string | undefined> {
    if (!parent.thumbnailUrl) {
      const check = await checkThumbnailImg(parent.id);
      if (!check) {
        return;
      } else {
        await Video.update(
          { id: parent.id },
          {
            thumbnailUrl: `https://drive.google.com/thumbnail?authuser=0&sz=h200&id=${parent.id}`,
          }
        );
        return `https://drive.google.com/thumbnail?authuser=0&sz=h200&id=${parent.id}`;
      }
    } else {
      if (parent.thumbnailUrl.includes("thumbnail")) return parent.thumbnailUrl;
      else
        return `https://drive.google.com/uc?export=view&id=${parent.thumbnailUrl}`;
    }
  }

  @FieldResolver((_return) => User, { nullable: true })
  async user(
    @Root() parent: Video,
    @Ctx() { dataLoaders }: Context
  ): Promise<User | undefined> {
    return await dataLoaders.userLoader.load(parent.userId);
  }

  @FieldResolver((_return) => Number, { nullable: true })
  async numUsersLiked(@Root() parent: Video): Promise<number | undefined> {
    return await VoteVideo.count({
      where: { videoId: parent.id, type: 1 },
    });
  }

  @FieldResolver((_return) => Number, { nullable: true })
  async numUsersDisLiked(@Root() parent: Video): Promise<Number | undefined> {
    return await VoteVideo.count({
      where: { videoId: parent.id, type: -1 },
    });
  }

  @FieldResolver((_return) => [Catagory], { nullable: true })
  async catagories(
    @Root() parent: Video,
    @Ctx() { dataLoaders }: Context
  ): Promise<Catagory[] | undefined> {
    return await dataLoaders.catagoryLoader.load(parent.id);
  }

  @FieldResolver((_return) => Int)
  async voteStatus(
    @Root() parent: Video,
    @Ctx() { dataLoaders, req }: Context
  ) {
    const status = await dataLoaders.voteVideoStatusLoader.load({
      userId: req.userId,
      videoId: parent.id,
    });
    return status ? status : 0;
  }

  @FieldResolver((_return) => Boolean)
  async watchLaterStatus(
    @Root() parent: Video,
    @Ctx() { req, dataLoaders }: Context
  ) {
    return await dataLoaders.watchLaterStatusLoader.load({
      videoId: parent.id,
      userId: req.userId,
    });
  }
}

export { VideoResolver };
