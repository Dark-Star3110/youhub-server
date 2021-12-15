import "reflect-metadata";
import express from "express";
import connect from "./config/db/connect";
import test from "./query/test";
const app = express();
const port = process.env.PORT || 3000;

(async () => {
  await connect();
  test();
})();

app.get("/", (_req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.listen(port, () => {
  console.log(`listening on port http://localhost:${port}`);
});
