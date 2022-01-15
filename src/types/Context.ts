import { Request, Response } from "express";
import { Connection } from "typeorm";
import { buildDataLoaders } from "../utils/dataLoader";
import { Redis } from "ioredis";

export type Context = {
  req: Request;
  res: Response;
  connection: Connection;
  redis: Redis;
  dataLoaders: ReturnType<typeof buildDataLoaders>;
};
