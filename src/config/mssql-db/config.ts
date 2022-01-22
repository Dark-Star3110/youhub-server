import { ConnectionOptions } from "typeorm";
import entities from "../../entities";
import { __prop__ } from "../../constant";
import path from "path";

const config: ConnectionOptions = {
  type: "mssql",
  ...(__prop__
    ? {
        host: process.env.AZURE_SERVER_NAME,
        port: 1433,
        username: process.env.AZURE_UID,
        password: process.env.AZURE_PASSWORD,
        database: process.env.AZURE_DB_NAME,
      }
    : {
        host: process.env.MSSQL_SERVERNAME,
        username: process.env.MSSQL_USERNAME,
        password: process.env.MSSQL_PASSWORD,
        database: process.env.MSSQL_DBNAME,
      }),
  synchronize: !__prop__,
  logging: true,
  entities,
  migrations: [path.join(__dirname, "../../migrations/*")],
  options: {
    encrypt: __prop__,
  },
  cache: {
    type: "ioredis",
    options: {
      port: __prop__ ? 6380 : 6379,
      host: __prop__
        ? process.env.REDIS_SERVER_NAME_PROP
        : process.env.REDIS_SERVER_NAME_DEV,
      password: __prop__
        ? process.env.REDIS_PASSWORD_PROP
        : process.env.REDIS_PASSWORD_DEV,
      tls: __prop__
        ? {
            servername: process.env.REDIS_SERVER_NAME_PROP,
          }
        : undefined,
    },
    duration: 30 * 1000,
  },
};

export default config;
