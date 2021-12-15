import mongoose from 'mongoose'

const connectMongo = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
    )
    console.log(`connected to mongo db`.green)
  } catch (error) {
    console.log(`fail to connect mongo db`.red);
  }
}

export default connectMongo