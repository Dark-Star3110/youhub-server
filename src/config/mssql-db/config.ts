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
  logging: false,
  entities,
  migrations: [path.join(__dirname, "../../migrations/*")],
  options: {
    encrypt: __prop__,
  },
};

export default config;
