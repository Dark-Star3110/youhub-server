import { Express } from "express";
import videoRouter from "./video";
import userRouter from "./user";

export default function routeConfig(app: Express) {
  app.use("/video", videoRouter);
  app.use("/user", userRouter);
}
