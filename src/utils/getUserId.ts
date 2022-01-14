import { Payload } from "./../types/Payload";
import { getHeadersToken } from "./getHeadersToken";
import { Request } from "express";
import jwt from "jsonwebtoken";

export const getUserIdToRequest = (req: Request & { userId?: string }) => {
  try {
    const token = getHeadersToken(req);
    if (token) {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as Payload;
      req.userId = payload.userId;
    }
    return req;
  } catch (error) {
    return req;
  }
};
