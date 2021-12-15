import { CookieOptions } from "express"

export const __prop__ = process.env.NODE_ENV === 'production'
export const PORT = process.env.PORT || 8000

export const COOKIE_NAME = 'refreshToken'
export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true, 
  secure: __prop__,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY as string) * 1000,
  sameSite: 'lax'
}

export const FOLDER_VIDEO_ID = '10YvEEWnUmQYib7F2XoWf0lj0i0gyoG__'
export const FOLDER_THUMBNAIL_IMAGE = '1XIoZdnySItH2z7H3IjwmgHpEECMGFl69'