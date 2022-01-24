import { VideoCatagory } from "./../entities/VideoCatagory";
import { PaginatedVideos } from "./../types/graphql-response/PaginatedPosts";
import { Arg, ID, Int, Query, Resolver } from "type-graphql";
import { Video } from "../entities/Video";
import { FindManyOptions, In, LessThan } from "typeorm";

@Resolver()
export class CategoryResolver {
  @Query((_return) => PaginatedVideos, { nullable: true })
  async videoCategory(
    @Arg("categoryId", (_type) => ID!) categoryId: string,
    @Arg("limit", (_type) => Int!) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      let lastVideo: Video[] = [];
      const categories = await VideoCatagory.find({
        where: { categoryId },
        select: ["videoId"],
      });
      const videosId = categories.map((category) => category.videoId);
      if (videosId.length <= 0) {
        return;
      }
      const findOptions: FindManyOptions<Video> = {
        where: { id: In(videosId) },
        take: Math.min(limit, 20),
        order: {
          createdAt: "DESC",
        },
      };
      const totalCount = await Video.count({ where: { id: In(videosId) } });
      if (totalCount <= 0) return;
      if (cursor) {
        lastVideo = await Video.find({
          where: { id: In(videosId) },
          take: 1,
          order: { createdAt: "ASC" },
        });
        findOptions.where = {
          id: In(videosId),
          createdAt: LessThan(cursor),
        };
      }
      const videos = await Video.find(findOptions);
      if (videos.length <= 0) return;
      return {
        totalCount,
        cursor: videos[videos.length - 1].createdAt,
        hasMore: cursor
          ? videos[videos.length - 1].createdAt.getTime() !==
            lastVideo[0].createdAt.getTime()
          : videos.length !== totalCount,
        paginatedVideos: videos,
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
