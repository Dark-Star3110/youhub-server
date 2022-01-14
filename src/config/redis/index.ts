import Redis from "ioredis";

export const redisConfig = () => {
  try {
    const redis = new Redis(6379, process.env.REDIS_SERVER_NAME, {
      password: process.env.REDIS_PASSWORD,
    });
    console.log("connected to redis server");
    return redis;
  } catch (error) {
    console.log(`connect fail to redis server`.red, error);
    return;
  }
};
