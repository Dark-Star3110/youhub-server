import { ConnectionOptions } from "typeorm";
import entities from "../../entities";

const config: ConnectionOptions = {
  type: "mssql",
  host: "localhost",
  username: "sa",
  password: "0coMatkhau",
  database: "youHubDB",
  synchronize: true,
  logging: false,
  entities,
  options: {
    encrypt: false,
  },
};

export default config;
