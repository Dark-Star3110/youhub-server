import { LikedVideo } from "../entities/LikedVideo";
import { User } from "../entities/User";
import { Video } from "../entities/Video";

export default async function test() {
  // const user1 = User.create({
  //   username: "user1",
  //   password: "password",
  //   email: "user@gmail.com",
  //   firstName: "abc",
  //   role: "ADMIN",
  // });
  // await user1.save();
  // const user2 = User.create({
  //   username: "user1",
  //   password: "password",
  //   email: "user@gmail.com",
  //   firstName: "abc",
  //   role: "ADMIN",
  // });
  // await user2.save();

  // const video1 = await Video.create({
  //   id: "ascjasdncdv",
  //   title: "day la title",
  //   description: "day la mo ta",
  //   size: 1000,
  //   userId: user1.id,
  // }).save();
  // const video2 = await Video.create({
  //   id: "ascjadcjaca",
  //   title: "day la title",
  //   description: "day la mo ta",
  //   size: 1000,
  //   userId: user1.id,
  // }).save();

  // await LikedVideo.create({
  //   userId: user2.id,
  //   videoId: video1.id,
  // }).save();

  // await LikedVideo.create({
  //   userId: user2.id,
  //   videoId: video2.id,
  // }).save();

  User.find({
    relations: ["videosLikedConection", "videosLikedConection.video"],
  }).then((users) => {
    users.forEach((user) => console.log(user));
  });
}
