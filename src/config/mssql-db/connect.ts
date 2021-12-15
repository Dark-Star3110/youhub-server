import { createConnection } from "typeorm";
import config from "./config";
export default async function connectMSSQL() {
  try {
    await createConnection(config);
    console.log("connect thanh cong");
  } catch (err) {
    console.log("connect that bai", err);
  }
}
