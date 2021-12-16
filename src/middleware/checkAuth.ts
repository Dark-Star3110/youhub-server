import { User } from './../entities/User';
import { Payload } from './../types/Payload';
import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { NextFunction, Response, Request } from 'express';

export const checkAuth: MiddlewareFn<Context> = async ({context: {req, token}}, next) => {
  try {
    if (!token) {
      throw new AuthenticationError('Unauthorized')
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as Payload
    const user = await User.findOne({id: payload.userId})
    if (!user) throw new AuthenticationError('Unauthorized')
    req.user = user
    return next()
  } catch (error) {
    if (error instanceof JsonWebTokenError)
      throw new AuthenticationError('Unauthorized')
    else 
      throw new Error('server error')
  }
}

export const checkAuth2 = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers['authorization']
  if (!authorizationHeader) return res.status(401).json({
    success: false,
    msg: 'Unauthorization'
  })

  try {
    const token = authorizationHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as Payload
    const user = await User.findOne({id: payload.userId})
    if (!user)
      return res.status(401).json({
        success: false,
        msg: 'Unauthorization'
      })
    else {
      return next()
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'server internal',
      error
    })
  }
}