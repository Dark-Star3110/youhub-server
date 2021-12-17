import { DisLikeComment } from "./DislikeComment";
import { LikeComment } from "./LikeComment";
import { VideoCatagory } from "./VideoCatagory";
import { WatchLater } from "./WatchLater";
import { DisLikeVideo } from "./DislikeVideo";
import { Video } from "./Video";
import { User } from "./User";
import { Comment } from "./Comment";
import { Catagory } from "./Catagory";
import { Subscribe } from "./Subscribe";
import { LikeVideo } from "./LikeVideo";
import { EntitySchema } from "typeorm";

const entities: (string | Function | EntitySchema<any>)[] = [
  User,
  Video,
  Comment,
  Catagory,
  Subscribe,
  LikeVideo,
  DisLikeVideo,
  WatchLater,
  VideoCatagory,
  LikeComment,
  DisLikeComment,
];
export default entities;
