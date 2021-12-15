import jwt from 'jsonwebtoken'
import { Payload } from '../types/Payload'

export const getToken = (payload: Payload) => {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET as string,
    {
      expiresIn: eval(process.env.SESSION_EXPIRY as string)
    }
  )
}

export const getRefreshToken = (payload: Payload) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY as string)
    }
  )
}