import { VoteComment } from "./../entities/VoteComment";
import { PaginatedComments } from "./../types/graphql-response/PaginatedComment";
import { UpdateCommentInput } from "./../types/graphql-input/UpdateCommentInput";
import { CreateCommentInput } from "./../types/graphql-input/CreateCommentInput";
import { Video } from "./../entities/Video";
import { Context } from "./../types/Context";
import { CommentMutationResponse } from "./../types/graphql-response/CommentMutationResponse";
import { Comment } from "./../entities/Comment";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { checkAuth } from "../middleware/checkAuth";
import { User } from "../entities/User";
import { GetCommentInput } from "../types/graphql-input/GetCommentInput";
import { FindCondition, FindManyOptions, IsNull, LessThan } from "typeorm";

@Resolver((_of) => Comment)
export class CommentResolver {
  @Query((_return) => Comment, { nullable: true })
  @UseMiddleware(checkAuth)
  async comment(@Arg("id") id: string): Promise<Comment | undefined> {
    return await Comment.findOne(id);
  }

  @Query((_retutn) => PaginatedComments, { nullable: true })
  @UseMiddleware(checkAuth)
  async comments(
    @Arg("getCmtInput") getCmtInput: GetCommentInput
  ): Promise<PaginatedComments | undefined> {
    try {
      const video = await Video.findOne(getCmtInput.videoId);
      if (!video || !video.commentable) return;
      let totalCount = 0;
      let lastComment: Comment[] = [];
      const realLimit = Math.min(getCmtInput.limit, 12);
      const where: FindCondition<Comment> = {
        videoId: getCmtInput.videoId,
      };
      const findOptions: FindManyOptions<Comment> = {
        where,
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };
      if (getCmtInput.parentCmtId) {
        where.parentCommentId = getCmtInput.parentCmtId;
      } else {
        where.parentCommentId = IsNull();
      }

      const realTotal = await Comment.count({
        videoId: getCmtInput.videoId,
        parentCommentId: IsNull(),
      });

      totalCount = getCmtInput.parentCmtId
        ? await Comment.count(findOptions)
        : await Comment.count({ videoId: getCmtInput.videoId });
      if (getCmtInput.cursor) {
        where.createdAt = LessThan(getCmtInput.cursor);
        lastComment = await Comment.find({
          order: { createdAt: "ASC" },
          where: getCmtInput.parentCmtId
            ? { parentCommentId: getCmtInput.parentCmtId }
            : {},
          take: 1,
        });
      }
      const comments = await Comment.find(findOptions);
      if (comments.length <= 0) return;
      console.log(lastComment);

      return {
        totalCount,
        cursor: comments[comments.length - 1].createdAt,
        hasMore: getCmtInput.cursor
          ? comments[comments.length - 1].createdAt.toString() !==
            lastComment[0].createdAt.toString()
          : comments.length !== realTotal,
        paginatedComments: comments,
      };
    } catch (error) {
      console.log(error);

      return;
    }
  }

  @Mutation((_return) => CommentMutationResponse)
  @UseMiddleware(checkAuth)
  async createComment(
    @Arg("videoId") videoId: string,
    @Arg("createCommentInput") createCommentInput: CreateCommentInput,
    @Ctx() { req }: Context,
    @Arg("parentCommentId", { nullable: true }) parentCommentId?: string
  ): Promise<CommentMutationResponse> {
    try {
      const video = await Video.findOne(videoId);
      if (!video) {
        return {
          code: 400,
          success: false,
          message: "Video not found",
          errors: [
            {
              type: "video",
              error: "Video is not found, please try again",
            },
          ],
        };
      }
      if (parentCommentId) {
        const parentComment = await Comment.findOne({
          where: { id: parentCommentId, videoId },
        });
        if (!parentComment)
          return {
            code: 400,
            success: false,
            message: "parent comment not found or not in this video",
          };
      }

      if (!video.commentable) {
        return {
          code: 400,
          success: false,
          message: "Video comment not allowed",
          errors: [
            {
              type: "disabled",
              error: "This video not allowed comment",
            },
          ],
        };
      }

      const newComment = await Comment.create({
        videoId,
        userId: req.user?.id,
        parentCommentId,
        ...createCommentInput,
      }).save();
      return {
        code: 200,
        success: true,
        message: "create successfully",
        comment: newComment,
      };
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

  @Mutation((_return) => CommentMutationResponse)
  @UseMiddleware(checkAuth)
  async updateComment(
    @Arg("commentId") commentId: string,
    @Arg("updateCommentInput") updateCommentInput: UpdateCommentInput,
    @Ctx() { req }: Context
  ): Promise<CommentMutationResponse> {
    try {
      const comment = await Comment.findOne(commentId);
      if (!comment) {
        return {
          code: 400,
          success: false,
          message: "comment not found",
          errors: [
            {
              type: "comment",
              error: "comment is not found, please try again",
            },
          ],
        };
      }
      if (comment.userId !== req.user?.id) {
        return {
          code: 401,
          success: false,
          message: "unauthorized",
        };
      }

      comment.content = updateCommentInput.content;
      await comment.save();
      return {
        code: 200,
        success: true,
        message: "update successfully",
        comment,
      };
    } catch (error) {
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

  @FieldResolver((_type) => Comment, { nullable: true })
  async parentComment(@Root() parent: Comment): Promise<Comment | undefined> {
    const comment = await Comment.findOne(parent.id, {
      relations: ["parentComment"],
    });
    return comment?.parentComment;
  }

  @FieldResolver((_type) => User, { nullable: true })
  async user(@Root() parent: Comment): Promise<User | undefined> {
    const comment = await Comment.findOne(parent.id, { relations: ["user"] });
    return comment?.user;
  }

  @FieldResolver((_type) => Number, { nullable: true })
  async numUsersLiked(@Root() parent: Comment): Promise<number | undefined> {
    return await VoteComment.count({
      where: { commentId: parent.id, type: 1 },
    });
  }

  @FieldResolver((_type) => Number, { nullable: true })
  async numUsersDisLiked(@Root() parent: Comment): Promise<number | undefined> {
    return await VoteComment.count({
      where: { commentId: parent.id, type: -1 },
    });
  }
}
