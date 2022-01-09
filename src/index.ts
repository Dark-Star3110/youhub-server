import "reflect-metadata";
import { configSocket } from "./config/socket/configSocket";
require("dotenv").config();
import "colors";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { test } from "./test/db";
import express from "express";
import fileUpload from "express-fileupload";
import connectMSSQL from "./config/mssql-db/connect";
import { createApolloServer } from "./config/graphql-server/index";
import routeConfig from "./routes";
import { PORT, __prop__ } from "./constant";
import connectMongo from "./config/mongo-db/connect";

(async () => {
  const app = express();

  const connection = await connectMSSQL();
  if (__prop__) {
    await connection?.runMigrations();
  }
  // await test();
  connectMongo();

  app.use(
    cors({
      origin: [
        process.env.CLIENT_DOMAINS as string,
        "https://studio.apollographql.com",
      ],
      credentials: true,
    })
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(fileUpload());

  routeConfig(app);

  app.get("/", (_req, res) => {
    res.send("<h1>Hello World!</h1>");
  });

  createApolloServer(app, connection)
    .then((path) => {
      const server = app.listen(PORT, () => {
        console.log(
          `🚀Listening on port http://localhost:${PORT}\n😊Ggraphql start at http://localhost:${PORT}${path}`
            .yellow
        );
      });
      configSocket(server);
    })
    .catch((err) => console.log(`have some error:\n${err}`.red));
})();
