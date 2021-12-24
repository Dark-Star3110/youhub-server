import { ConnectionOptions } from "typeorm";
import entities from "../../entities";

const config: ConnectionOptions = {
  type: "mssql",
  host: process.env.MSSQL_SERVERNAME,
  username: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DBNAME,
  synchronize: true,
  logging: true,
  entities,
  options: {
    encrypt: false,
  },
};

export default config;
