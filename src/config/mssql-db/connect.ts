import { createConnection } from "typeorm";
import config from "./config";
export default async function connectMSSQL() {
  try {
    const connection = await createConnection(config);
    console.log("connect thanh cong");
    return connection;
  } catch (err) {
    console.log("connect that bai", err);
    return;
  }
}
