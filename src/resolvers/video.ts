import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Video } from './../entities/Video';
import { checkAuth } from './../middleware/checkAuth';
import { Context } from './../types/Context';
import { CreateVideoInput } from './../types/graphql-input/CreateVideoInput';
import { VideoMutationResponse } from './../types/graphql-response/VideoMutationResponse';

@Resolver()
class VideoResolver {

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
      video.save()
      return {
        code: 200,
        success: true,
        message: 'create video successfully',
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
}

export { VideoResolver };
