import { VideoCatagory } from './../entities/VideoCatagory';
import { PaginatedVideos } from './../types/graphql-response/PaginatedPosts';
import { getThumbnail } from './../utils/getThumbnailmg';
import { Arg, Ctx, FieldResolver, ID, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Action, Type } from '../types/Action';
import { deleteFile } from '../utils/deleteFile';
import { Catagory } from './../entities/Catagory';
import { Comment } from './../entities/Comment';
import { DisLikeVideo } from './../entities/DislikeVideo';
import { LikeVideo } from './../entities/LikeVideo';
import { User } from './../entities/User';
import { Video } from './../entities/Video';
import { WatchLater } from './../entities/WatchLater';
import { checkAuth } from './../middleware/checkAuth';
import { Context } from './../types/Context';
import { CreateVideoInput } from './../types/graphql-input/CreateVideoInput';
import { UpdateVideoInput } from './../types/graphql-input/UpdateVideoInput';
import { VideoMutationResponse } from './../types/graphql-response/VideoMutationResponse';
import { FindConditions, FindManyOptions, In, LessThan, Like } from 'typeorm';

@Resolver(_of => Video)
class VideoResolver {
  @Query(_return=>Video, {nullable: true})
  async video (
    @Arg('id', _type=>ID) id: string
  ) : Promise<Video | undefined> {
    try {
      return await Video.findOne(id)
    } catch (error) {
      console.log(error);
      return
    }
  }

  @Query(_return => PaginatedVideos, {nullable: true})
  async videos (
    @Arg('limit', _type=>Int) limit: number,
    @Arg('cursor', {nullable: true}) cursor?: string,
    @Arg('userId', {nullable: true}) userId?: string,
    @Arg('user', _type=>[String], {nullable: true}) user?: string[],
    @Arg('catagory', _type=>[String], {nullable: true}) catagory?: string[],
    @Arg('catagoryId', {nullable: true}) catagoryId?: string,
    @Arg('query', {nullable: true}) query?: string
  ): Promise<PaginatedVideos | undefined> {
    try {
      let totalCount: number = 0
      const realLimit = cursor ? Math.min(limit, 12) : Math.min(limit, 20)
      const where: FindConditions<Video> = {}
      const findOptions: FindManyOptions<Video> = {
        where,
        order: {
          createdAt: 'DESC'
        }
      }
      if (user) {
        const records = await User.find({where: {fullName: Like(
          user.reduce<string[]>((prev, curr) => [...prev, `%${curr}%`], [])
        )}})
        where.userId = In(records.reduce<string[]>((prev, curr) => [...prev, curr.id], []))
      }
      if (userId) {
        where.userId = userId
      }

      if (catagory) {
        const records = await Catagory.find({
          where: {name: Like(catagory.reduce<string[]>((prev, curr) => [...prev, `%${curr}%`], []))},
        })
        const catagoryIds = records.reduce<string[]>((prev, curr)=>[...prev,curr.id], [])
        const vcatagories = await VideoCatagory.find({where: {catagoryId: In(catagoryIds)}})
        where.id = In(vcatagories.reduce<string[]>((prev, curr)=>[...prev,curr.videoId], []))
      }

      if (catagoryId) {
        const records = await VideoCatagory.find({where: {catagoryId}})
        where.id = In(records.reduce<string[]>((prev, curr)=> [...prev,curr.videoId], []))
      }

      if (query) {
        where.title = Like(`%${query}%`)
      }
    
      totalCount = await Video.count(findOptions)
      if (totalCount === 0)
        return
      
      findOptions.take = realLimit

      let lastVideo: Video[] = []
      if (cursor) {
        where.createdAt = LessThan(cursor)
        lastVideo = await Video.find({
          order: {createdAt: 'ASC'}, 
          take: 1,
          ...findOptions
        })
      }

      const videos = await Video.find(findOptions)
      return {
        totalCount: totalCount,
        cursor: videos[videos.length-1].createdAt,
        hasMore: cursor
          ? videos[videos.length-1].createdAt.toString() !== lastVideo[0].createdAt.toString()
          : videos.length !== totalCount,
        paginatedVideos: videos
      }
    } catch (error) {
      console.log(error);
      return
    }
  }
  
  @Mutation(_return=>VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async createVideo (
    @Arg('createVideoInput') createVideoInput: CreateVideoInput,
    @Ctx() {req}: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = Video.create({
        ...createVideoInput,
        userId: req.user?.id,
      })
      await video.save()
      return {
        code: 200,
        success: true,
        message: 'create video successfully',
        video
      }
    } catch (error) {
      console.log(error);
      
      return {
        code: 500,
        success: false,
        message: 'server internal',
        errors: [{
          type: 'server',
          error
        }]
      }
    }
  }

  @Mutation(_return=>VideoMutationResponse)
  @UseMiddleware(checkAuth) 
  async updateVideo (
    @Arg('videoId', _type=>ID) videoId: string,
    @Arg('updateVideoInput') updateVideoInput: UpdateVideoInput,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId)
      if (!video || video.userId!==req.user?.id)
        return {
          code: 400,
          success: false,
          message: 'video not found'
        }
      if (video.userId!==req.user?.id)
        return {
          code: 401, 
          success: false,
          message: 'Unauthorized'
        }
      await Video.update({id: videoId}, {...updateVideoInput})
      return {
        code: 200,
        success: true,
        message: 'video update successfully',
        video
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'server internal',
        errors: [{
          type: 'server',
          error
        }]
      }
    }
  }

  @Mutation(_return=>VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async deleteVideo (
    @Arg('videoId', _type=>ID) videoId: string,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId)
      if (!video)
        return {
          code: 400,
          success: false,
          message: 'video not found'
        }
      if (video.userId!==req.user?.id || req.user.role!=='ADMIN') 
        return {
          code: 401,
          success: false,
          message: 'unauthorized'
        }
      const thumbnailFileId = video.thumbnailUrl?.indexOf('https://lh3.googleusercontent.com/') !== -1
      ? video.thumbnailUrl : null
      await video.remove()
      await deleteFile(videoId)
      if (thumbnailFileId)
        await deleteFile(thumbnailFileId)
      return {
        code: 200,
        success: true,
        message: 'delete successfully'
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'server internal',
        errors: [{
          type: 'server',
          error
        }]
      }
    }
  }

  @Mutation(_return=>VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async reactVideo (
    @Arg('videoId', _type=>ID) videoId: string,
    @Arg('type', _type=>Type) type: Type,
    @Arg('action', _type=>Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId)
      if (!video) {
        return {
          code: 400,
          success: false,
          message: 'Video not found'
        }
      }
      const userId = req.user?.id as string
      
      const record = type === Type.LIKE 
        ? await LikeVideo.findOne({where: {userId, videoId}})
        : await DisLikeVideo.findOne({where: {userId, videoId}})

      if (action === Action.ACTIVATE && record) 
        return {
          code: 400,
          success: false,
          message: `Video already ${type}d`
        }
      if (action === Action.DISACTIVATE && !record) 
        return {
          code: 400,
          success: false,
          message: `Video do not ${type}`
        }
      
      if (action === Action.ACTIVATE ) 
        type === Type.LIKE 
          ? await LikeVideo.create({userId, videoId}).save()
          : await DisLikeVideo.create({userId, videoId}).save()
      else (record as LikeVideo | DisLikeVideo).remove()
      return {
        code: 200,
        success: true,
        message: `${type===Type.LIKE?'':'Un'}${type} video successfully`
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'server error',
        errors: [{
          type: 'server',
          error
        }]
      }
    }
  }

  @Mutation(_return=>VideoMutationResponse)
  @UseMiddleware(checkAuth)
  async watchLater (
    @Arg('videoId', _type=>ID) videoId: string,
    @Arg('action', _type=>Action) action: Action,
    @Ctx() { req }: Context
  ): Promise<VideoMutationResponse> {
    try {
      const video = await Video.findOne(videoId)
      if (!video) {
        return {
          code: 400,
          success: false,
          message: 'Video not found'
        }
      }
      const userId = req.user?.id as string
      const record = await WatchLater.findOne({where: {userId, videoId}})

      if (action === Action.ACTIVATE && record) 
        return {
          code: 400,
          success: false,
          message: 'Video already exists in watch later'
        }
      if (action === Action.DISACTIVATE && !record) 
        return {
          code: 400,
          success: false,
          message: "Video don't exist in watch later"
        }
      action === Action.ACTIVATE
        ? await WatchLater.create({userId, videoId}).save()
        : await (record as WatchLater).remove()

      return {
        code: 200,
        success: true,
        message: `${action===Action.ACTIVATE?'add':'remove'} video from watch later`
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'server internal',
        errors: [{type: 'server', error}]
      }
    }
  }

  @FieldResolver(_return=>String, {nullable: true})
  async thumbnailUrl (
    @Root() parent: Video
  ): Promise<string | undefined> {
    if (!parent.thumbnailUrl) {
      try {
        const thumbnailUrl = await getThumbnail(parent.id) as string | undefined
        await Video.update({id: parent.id}, {thumbnailUrl})
        return thumbnailUrl
      } catch (error) {
        return
      }
    }
    return parent.thumbnailUrl.indexOf('https://lh3.googleusercontent.com/') !== -1
    ? parent.thumbnailUrl
    : `https://drive.google.com/uc?export=view&id=${parent.thumbnailUrl}`
  }

  @FieldResolver(_type=>User, {nullable: true})
  async user (
    @Root() parent: Video
  ): Promise<User | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['user']
    })
    return video?.user
  }

  @FieldResolver(_type=>[User], {nullable: true})
  async usersLiked (
    @Root() parent: Video
  ): Promise<User[] | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['usersLikedConnection', 'usersLikedConnection.user']
    })

    return video?.usersLikedConnection.reduce<User[]>(
      (prev, curr) => [
        ...prev,
        curr.user
      ],
      []
    )
  }

  @FieldResolver(_type=>Number, {nullable: true})
  async numUsersDisLiked (
    @Root() parent: Video
  ): Promise<Number | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['usersDisLikedConnection']
    })
    return video?.usersDisLikedConnection.length
  }

  @FieldResolver(_type=>[User], {nullable: true})
  async usersWatchLater (
    @Root() parent: Video
  ): Promise<User[] | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['usersWatchLaterConnection', 'usersWatchLaterConnection.user']
    })

    return video?.usersWatchLaterConnection.reduce<User[]>(
      (prev, curr) => [
        ...prev,
        curr.user
      ],
      []
    )
  }

  @FieldResolver(_type=>[Comment], {nullable: true})
  async comments (
    @Root() parent: Video
  ): Promise<Comment[] | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['comments']
    })
    return video?.comments
  }

  @FieldResolver(_type=>[Catagory], {nullable: true})
  async catagories (
    @Root() parent: Video
  ): Promise<Catagory[] | undefined> {
    const video = await Video.findOne({
      where: {
        id: parent.id
      },
      relations: ['catagoryConnection', 'catagoryConnection.catagory']
    })

    return video?.catagoryConnection.reduce<Catagory[]>(
      (prev, curr) => [
        ...prev,
        curr.catagory
      ],
      []
    )
  }
}

export { VideoResolver };