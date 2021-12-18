import { Comment } from './../entities/Comment';
import jwt from 'jsonwebtoken';
import { Video } from '../entities/Video';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import StoreToken from '../models/storeToken';
import { getRefreshToken, getToken } from '../utils/generateToken';
import { COOKIE_NAME, COOKIE_OPTIONS } from './../constant';
import { User } from './../entities/User';
import { checkAuth } from './../middleware/checkAuth';
import { Context } from './../types/Context';
import { LoginInput, SocialLogin } from './../types/graphql-input/LoginInput';
import { SignupInput } from './../types/graphql-input/SignupInput';
import { UserMutationResponse } from './../types/graphql-response/UserMutationResponse';
import { Payload } from './../types/Payload';
import { loginSocial } from './../utils/loginSocial';
import { UpdateUserInfoInput } from '../types/graphql-input/UpdateUserInfoInput';

@Resolver(_of => User)
class UserResolver {
  @Query(_return => User, {nullable: true})
  @UseMiddleware(checkAuth)
  me(
    @Ctx() {req}: Context
  ): User | undefined {
    return req.user
  }

  @Mutation(_return=>UserMutationResponse)
  async signup (
    @Arg('signupInput') signupInput: SignupInput
  ): Promise<UserMutationResponse> {

    try {
      const { username, email } = signupInput
      const exsistingUsers = await User.find({
        where: [{username}, {email}]
      })

      if (exsistingUsers.length > 0) 
        return {
          code: 400,
          success: false,
          message: 'Duplicate username or email',
          errors: [{
            type: 'Duplicate',
            error: 'Username or email has already been exsisted'
          }]
        }

      const newUser = User.create({...signupInput})
      await newUser.save()
  
      return {
        code: 200,
        success: true,
        message: 'sign up successfully, redirect to login page'
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'server error',
        errors: [{
          type: 'Server',
          error: `${error}`
        }]
      }
    }
  }

  @Mutation(_return=>UserMutationResponse)
  async login (
    @Ctx() {res}: Context,
    @Arg('socialLogin', {nullable: true}) socialLogin?: SocialLogin,
    @Arg('loginInput', {nullable: true}) loginInput?: LoginInput
  ): Promise<UserMutationResponse> {
    let user: User | null | undefined
    if (socialLogin) {
      user = await loginSocial(socialLogin)
      if (!user) 
        return {
          code: 401,
          success: false,
          message: `login with ${socialLogin.type} fail`
        }
      
    } else if (loginInput) {
      try {
        const { username, password } = loginInput
        user = await User.findOne({username})
  
        if (!user || !user.validatePassword(password))  
          return {
            code: 401,
            success: false,
            message: 'Login failed',
            errors: [{
              type: 'InvalidUser',
              error: 'username or password incorrect'
            }]
          }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: 'server error',
          errors: [{
            type: 'Server',
            error: `${error}`
          }]
        }
      }
    } 
    if (!user) return {
        code: 400, 
        success: false,
        message: 'invalid require'
      }
    else {
      
      const token = getToken({
        userId: user.id
      })
      const refreshToken = getRefreshToken({
        userId: user.id
      })
      
      res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS)
      await (new StoreToken({userId: user.id, refreshToken})).save()
      
      return {
        code: 200, 
        success: true,
        message: 'login successfully',
        token
      }
    }  
  }

  @Mutation(_return=>UserMutationResponse)
  async refreshToken (
    @Ctx() {req, res}: Context
  ): Promise<UserMutationResponse> {
    const { signedCookies = {} } = req
    const refreshToken = <string>signedCookies.refreshToken || undefined

    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as Payload
        const users = await StoreToken.find({userId: payload.userId})
        const index = users.findIndex(user => user.validToken(refreshToken))
        if (users.length <= 0 && index === -1) {
          return {
            code: 401,
            success: false,
            message: 'unauthorized'
          }
        }

        await users[index].remove()
        const token = getToken({ 
          userId: payload.userId
        })
        const newRefreshToken = getRefreshToken({
          userId: payload.userId
        })
        await (new StoreToken({userId: payload.userId, refreshToken: newRefreshToken})).save()
        
        res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS)
        return {
          code: 200,
          success: true,
          message: 'refreshToken successfully',
          token
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: 'server internal',
          errors: [{
            type: 'Server',
            error: `${error}`
          }]
        }
      }
    } else {
      return {
        code: 401,
        success: false,
        message: 'unauthorized'
      }
    }
  }

  @Mutation(_return=>Boolean) 
  @UseMiddleware(checkAuth)
  async logout (
    @Ctx() { req, res }: Context
  ): Promise<Boolean> {
    const { signedCookies = {} } = req
    const refreshToken = <string>signedCookies.refreshToken || ''
    
    try {
      const users = await StoreToken.find({userId: req.user?.id})
      const index = users.findIndex(user => user.validToken(refreshToken))

      if (index !== -1)
        await users[index].remove()
      res.clearCookie(COOKIE_NAME)

      return true
    } catch (error) {
      return false
    }
  }

  @Mutation(_return=>UserMutationResponse)
  @UseMiddleware(checkAuth)
  async updateInfo (
    @Arg('updateInput') updateInput: UpdateUserInfoInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const user = await User.findOne(req.user?.id)
      if (!user) {
        return {
          code: 400,
          success: false,
          message: 'User not found'
        }
      }
      await User.update({
        id: req.user?.id,
      }, {
        ...updateInput
      })
      return {
        code: 200,
        success: false,
        message: 'Update user information successfully'
      }
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'Server Error',
        errors: [{
          type: 'server',
          error
        }]
      }
    }
  }

  @FieldResolver(_return=>String)
  @UseMiddleware(checkAuth)
  email (
    @Root() parent: User,
    @Ctx() { req }: Context
  ): string {
    return parent.id === req.user?.id || parent.role==='ADMIN' ? parent.email : ""
  }

  @FieldResolver(_return=>String, {nullable: true})
  @UseMiddleware(checkAuth)
  socialId (
    @Root() parent: User,
    @Ctx() { req }: Context
  ): String | undefined{
    return parent.id === req.user?.id || parent.role==='ADMIN' ? parent.socialId : ""
  }

  @FieldResolver(_return=>String)
  image_url (
    @Root() parent: User,
  ) {
    if (parent.image_url?.indexOf('http')!==-1)
      return parent.image_url 
    else return `https://drive.google.com/uc?export=view&id=${parent.image_url}`
  }

  @FieldResolver(_return=>[User], {nullable: true})
  async chanelsSubscribe (
    @Root() parent: User
  ): Promise<User[] | undefined> {
    const user = await User.findOne({
      where: {
        id: parent.id
      },
      relations: ['chanelsConnection', 'chanelsConnection.chanel']
    })
    return user?.chanelsConnection.reduce<User[]>(
      (prev, curr) => [
      ...prev,
      curr.chanel
      ],
      []
    )
  }

  @FieldResolver(_return=>[User], {nullable: true})
  async subscribers (
    @Root() parent: User
  ): Promise<User[] | undefined> {
    const user = await User.findOne({
      where: {
        id: parent.id
      },
      relations: ['subscribersConnection', 'subscribersConnection.subscriber']
    })
    return user?.subscribersConnection.reduce<User[]>(
      (pre, curr) => [
        ...pre,
        curr.subscriber
      ],
      []
    )
  }

  @FieldResolver(_return => [Video], {nullable: true})
  async videos (
    @Root() parent: User
  ): Promise<Video[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['videos']
    })
    return user?.videos
  }

  @FieldResolver(_return => [Video], {nullable: true})
  async videosLiked (
    @Root() parent: User
  ): Promise<Video[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['videosLikedConnection', 'videosLikedConnection.video']
    })
    return user?.videosLikedConnection.reduce<Video[]>(
      (prev, curr) => [
        ...prev,
        curr.video
      ],
      []
    )
  }

  @FieldResolver(_return => [Video], {nullable: true})
  async videosDisLiked (
    @Root() parent: User
  ): Promise<Video[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['videosDisLikedConnection', 'videosDisLikedConnection.video']
    })
    return user?.videosDisLikedConnection.reduce<Video[]>(
      (prev, curr) => [
        ...prev,
        curr.video
      ],
      []
    )
  }

  @FieldResolver(_return => [Video], {nullable: true})
  async watchLaterVideos (
    @Root() parent: User
  ): Promise<Video[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['videosWatchLaterConnection', 'videosWatchLaterConnection.video']
    })
    return user?.videosWatchLaterConnection.reduce<Video[]>(
      (prev, curr) => [
        ...prev,
        curr.video
      ],
      []
    )
  }
  
  @FieldResolver(_return => [Comment], {nullable: true})
  async comments (
    @Root() parent: User
  ): Promise<Comment[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['comments']
    })
    return user?.comments
  }

  @FieldResolver(_return => [Comment], {nullable: true})
  async commentsLiked (
    @Root() parent: User
  ): Promise<Comment[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['commentsLikedConnection', 'commentsLikedConnection.comment']
    })
    return user?.commentsLikedConnection.reduce<Comment[]>(
      (prev, curr) => [
        ...prev,
        curr.comment
      ],
      []
    )
  }

  @FieldResolver(_return => [Comment], {nullable: true})
  async commentsDisLiked (
    @Root() parent: User
  ): Promise<Comment[] | undefined> {
    const user = await User.findOne({
      where: {id: parent.id},
      relations: ['commentsDisLikedConnection', 'commentsDisLikedConnection.comment']
    })
    return user?.commentsDisLikedConnection.reduce<Comment[]>(
      (prev, curr) => [
        ...prev,
        curr.comment
      ],
      []
    )
  }
}

export { UserResolver };