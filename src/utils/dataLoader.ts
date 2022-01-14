import { SubscribeStatus } from "./../types/graphql-response/SubscribeStatus";
import { VoteVideo } from "./../entities/VoteVideo";
import DataLoader from "dataloader";
import { User } from "../entities/User";
import { Catagory } from "./../entities/Catagory";
import { Comment } from "./../entities/Comment";
import { Subscribe } from "./../entities/Subscribe";
import { VideoCatagory } from "./../entities/VideoCatagory";
import { VoteType } from "../types/Action";

interface VoteVideoCondition {
  userId?: string;
  videoId: string;
}

interface SubscribeCondition {
  chanelId: string;
  subscriberId?: string;
}

const batchGetUsers = async (userIds: string[]) => {
  const users = await User.findByIds(userIds);
  return userIds.map((userId) => users.find((user) => user.id === userId));
};

const batchGetChanels = async (subscriberIds: string[]) => {
  const subscribe = await Subscribe.find<Subscribe>({
    where: subscriberIds.map((id) => ({ subscriberId: id })),
    relations: ["chanel"],
  });
  return subscriberIds.map((sbId) =>
    subscribe.reduce<User[]>(
      (prev, curr) =>
        curr.subscriberId === sbId ? [...prev, curr.chanel] : [...prev],
      []
    )
  );
};

const batchGetSubscribers = async (chanelIds: string[]) => {
  const subscribe = await Subscribe.find<Subscribe>({
    where: chanelIds.map((id) => ({ chanelId: id })),
    relations: ["subscriber"],
  });
  return chanelIds.map((cnId) =>
    subscribe.reduce<User[]>(
      (prev, curr) =>
        curr.chanelId === cnId ? [...prev, curr.chanel] : [...prev],
      []
    )
  );
};

const batchGetCatagory = async (videoIds: string[]) => {
  const cata = await VideoCatagory.find<VideoCatagory>({
    where: videoIds.map((id) => ({ videoId: id })),
    relations: ["catagory"],
  });
  return videoIds.map((videoId) =>
    cata.reduce<Catagory[]>(
      (prev, curr) =>
        curr.videoId === videoId ? [...prev, curr.catagory] : [...prev],
      []
    )
  );
};

const batchGetParentComment = async (cmtIds: string[]) => {
  const comments = await Comment.findByIds(cmtIds, {
    relations: ["parentComment"],
  });
  return cmtIds.map(
    (cmtId) => comments.find((cmt) => cmt.id === cmtId)?.parentComment
  );
};

const batchGetVoteVideoStatus = async (conditions: VoteVideoCondition[]) => {
  const voteVideos = await VoteVideo.findByIds(conditions);
  return conditions.map(
    (condition) =>
      voteVideos.find(
        (vv) =>
          vv.videoId === condition.videoId && vv.userId === condition.userId
      )?.type
  );
};

const batchGetSubscribeStatus = async (
  subscribeConditions: SubscribeCondition[]
): Promise<SubscribeStatus[]> => {
  const subscribes = await Subscribe.findByIds(subscribeConditions);
  return subscribeConditions.map((sc) => {
    const subscribe = subscribes.find(
      (subscribe) =>
        subscribe.chanelId === sc.chanelId &&
        subscribe.subscriberId === sc.subscriberId
    );
    return {
      status: !!subscribe,
      notification: subscribe ? subscribe.isNotification : false,
    };
  });
};

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<string, User | undefined>((userIds) =>
    batchGetUsers(userIds as string[])
  ),
  channelLoader: new DataLoader<string, User[] | undefined>((subscriberIds) =>
    batchGetChanels(subscriberIds as string[])
  ),
  subscriberLoader: new DataLoader<string, User[] | undefined>((chanelIds) =>
    batchGetSubscribers(chanelIds as string[])
  ),
  catagoryLoader: new DataLoader<string, Catagory[] | undefined>((videoIds) =>
    batchGetCatagory(videoIds as string[])
  ),
  parentCmtLoader: new DataLoader<string, Comment | undefined>((cmtIds) =>
    batchGetParentComment(cmtIds as string[])
  ),
  voteVideoStatusLoader: new DataLoader<
    VoteVideoCondition,
    VoteType | undefined
  >((conditions) =>
    batchGetVoteVideoStatus(conditions as VoteVideoCondition[])
  ),
  subscribeStatusLoader: new DataLoader<SubscribeCondition, SubscribeStatus>(
    (subscribeConditions) =>
      batchGetSubscribeStatus(subscribeConditions as SubscribeCondition[])
  ),
});
