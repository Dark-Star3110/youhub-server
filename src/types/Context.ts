import { User } from './../entities/User';


import { Request, Response } from 'express'
 
export type Context = {
  req: Request & {user?: User}
  res: Response
  token?: string
}