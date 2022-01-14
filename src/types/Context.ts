import { User } from "./../entities/User";

import { Request, Response } from "express";
import { Connection } from "typeorm";
import { buildDataLoaders } from "../utils/dataLoader";
import { Redis } from "ioredis";

export type Context = {
  req: Request & { user?: User; userId?: string };
  res: Response;
  connection: Connection;
  redis: Redis;
  dataLoaders: ReturnType<typeof buildDataLoaders>;
};
