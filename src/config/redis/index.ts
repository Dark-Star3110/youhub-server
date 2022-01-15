import { __prop__ } from "./../../constant";
import Redis from "ioredis";

export const redisConfig = () => {
  try {
    const redis = new Redis({
      port: 6380,
      host: __prop__
        ? process.env.REDIS_SERVER_NAME_PROP
        : process.env.REDIS_SERVER_NAME_DEV,
      password: __prop__
        ? process.env.REDIS_PASSWORD_PROP
        : process.env.REDIS_PASSWORD_DEV,
      enableTLSForSentinelMode: true,
      keyPrefix: "",
      db: 0,
      tls: __prop__
        ? {
            servername: process.env.REDIS_SERVER_NAME_PROP,
          }
        : undefined,
    });
    console.log("connected to redis server");
    return redis;
  } catch (error) {
    console.log(`connect fail to redis server`.red, error);
    return;
  }
};
