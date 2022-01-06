import { User } from "./../entities/User";

import { Request, Response } from "express";
import { Connection } from "typeorm";
import { buildDataLoaders } from "../utils/dataLoader";

export type Context = {
  req: Request & { user?: User };
  res: Response;
  token?: string;
  connection: Connection;
  dataLoaders: ReturnType<typeof buildDataLoaders>;
};
