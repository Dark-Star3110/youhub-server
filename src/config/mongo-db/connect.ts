import mongoose from "mongoose";
import { __prop__ } from "../../constant";

const connectMongo = async () => {
  try {
    await mongoose.connect(
      __prop__ ? process.env.MONGO_PROP_URL : process.env.MONGO_DEV_URL
    );
    console.log(`connected to mongo db`.green);
  } catch (error) {
    console.log(`fail to connect mongo db`.red, error);
  }
};

export default connectMongo;
