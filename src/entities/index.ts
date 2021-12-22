import { EntitySchema } from 'typeorm';
import { Catagory } from "./Catagory";
import { Comment } from "./Comment";
import { Subscribe } from "./Subscribe";
import { User } from "./User";
import { Video } from "./Video";
import { VideoCatagory } from './VideoCatagory';
import { VoteComment } from './VoteComment';
import { VoteVideo } from './VoteVideo';
import { WatchLater } from './WatchLater';

const entities : (string | Function | EntitySchema<any>)[]= [
  User,
  Video, 
  Comment, 
  Catagory, 
  Subscribe,
  VoteVideo,
  WatchLater,
  VideoCatagory,
  VoteComment
];
export default entities;
