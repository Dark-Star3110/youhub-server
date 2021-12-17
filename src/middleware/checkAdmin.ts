import { User } from './../entities/User';
import { Payload } from './../types/Payload';
import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";
import jwt, { JsonWebTokenError } from "jsonwebtoken"

export const checkAdmin: MiddlewareFn<Context> = async ({context: {req, token}}, next) => {
  try {
    
    if (!token) {
      throw new AuthenticationError('Unauthorized')
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as Payload
    const user = await User.findOne({id: payload.userId})
    if (!user) throw new AuthenticationError('Unauthorized')
    if (user.role!== 'ADMIN') 
      throw new Error('ban dech co quyen')
    req.user = user
    return next()
  } catch (error) {
    if (error instanceof JsonWebTokenError)
      throw new AuthenticationError('Unauthorized')
    else 
      throw new Error('server error')
  }
}