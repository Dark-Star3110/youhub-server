require('dotenv').config()
import "reflect-metadata";
import 'colors'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// import { test } from './test/db';
import express from "express";
import fileUpload from "express-fileupload";
import { graphqlUploadExpress } from 'graphql-upload'
import connectMSSQL from "./config/mssql-db/connect";
import { createApolloServer } from './config/graphql-server/index';
import routeConfig from './routes';
import { PORT } from './constant';
import connectMongo from "./config/mongo-db/connect";


const app = express();
// test
connectMSSQL()
connectMongo()

app.use(cors({
  origin: [process.env.CLIENT_DOMAINS as string, 'https://studio.apollographql.com'],
  credentials: true
}))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(fileUpload())
app.use(graphqlUploadExpress({maxFiles: 1}))

routeConfig(app)


app.get("/", (_req, res) => {
  res.send("<h1>Hello World!</h1>");
});

createApolloServer(app)
  .then(path => {
    app.listen(PORT, () => {
      console.log(`listening on port http://localhost:${PORT}\nGgraphql start at http://localhost:${PORT}${path}`.yellow);
    });
  })
  .catch(err => console.log(`have some error:\n${err}`.red))
