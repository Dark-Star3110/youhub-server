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

export const FOLDER_VIDEO_ID = '1Pwyz9kilqTILuKlIQ6qWHR7UbpC2IhrB'
export const FOLDER_THUMBNAIL_IMAGE = '1qY7Fcbn4QhM0nEkPpPu_C2kkwiM4NRwC'
export const FOLDER_PROFILE_IMAGE = '1x42t2CwV0x9N1dz_KPXEdykrz4wXltzr'