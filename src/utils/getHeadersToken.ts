import { Request } from "express";


export const getHeadersToken = (req: Request): string | undefined => {
  const authString = req.headers.authorization
  if (authString) {
    try {
      const token = authString.split(' ')[1]  
      return token 
    }
    catch {
      return undefined
    }
  } else return undefined
}