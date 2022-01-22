import { Comment } from "./../../entities/Comment";
import { NotiType } from "./../../models/notification";
import { Subscribe } from "./../../entities/Subscribe";
import { Server as ExpressServer } from "http";
import { Server } from "socket.io";
import NotificationStore from "../../models/notification";
import { Video } from "../../entities/Video";

export const configSocket = async (app: ExpressServer) => {
  const io = new Server(app, {
    cors: {
      origin: process.env.CLIENT_DOMAINS,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("online", (userId) => {
      if (userId) socket.join(userId);
    });

    socket.on("offline", (userId) => {
      if (!userId) return;
      try {
        socket.leave(userId);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("join-room", (videoId) => {
      if (!videoId) return;
      socket.join(videoId);
    });

    socket.on("leave-room", (videoId) => {
      if (!videoId) return;
      try {
        socket.leave(videoId);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("read-all-notify", async (userId) => {
      if (!userId) return;
      try {
        await NotificationStore.updateMany({ to: userId }, { readed: true });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("read-notify", async (userId, notiId) => {
      if (!userId) return;
      try {
        await NotificationStore.updateOne(
          { _id: notiId, to: userId },
          { readed: true }
        );
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("get-num-noti", async (userId) => {
      try {
        const num = await NotificationStore.countDocuments({
          to: userId,
          readed: false,
        });
        io.to(userId).emit("return-num-noti", num);
      } catch (error) {
        console.log(error);
        io.to(userId).emit("return-num-noti", 0);
      }
    });

    socket.on("comment", async (payload, videoId) => {
      try {
        const comment = await Comment.findOne({
          where: { id: payload.id },
          relations: ["user"],
        });
        const video = await Video.findOne({
          where: { id: videoId },
          relations: ["user"],
        });
        if (!comment || !video) return;
        io.to(videoId).emit("message", payload);
        if (comment.user.id === video.user.id) return;
        const noti = await NotificationStore.create({
          from: comment.user.id,
          to: video.user.id,
          commentId: comment.id,
          videoId,
          type: NotiType.COMMENT,
        });

        io.to(video.user.id).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("upload-video", async (userId: string, videoId: string) => {
      try {
        const subscribers = await Subscribe.find({
          where: { chanelId: userId, isNotification: true },
          select: ["subscriberId"],
        });
        if (subscribers.length <= 0) return;
        subscribers.map(async (subscriber) => {
          const noti = new NotificationStore({
            from: userId,
            to: subscriber.subscriberId,
            type: NotiType.UPLOAD,
            videoId,
          });
          await noti.save();
          io.to(subscriber.subscriberId).emit("notify", noti._id);
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("subscribe", async (chanelId: string, subscriberId: string) => {
      try {
        const exsistingNoti = await NotificationStore.findOne({
          from: subscriberId,
          to: chanelId,
          type: NotiType.SUBSCRIBE,
        });
        if (exsistingNoti) return;
        const noti = await NotificationStore.create({
          from: subscriberId,
          to: chanelId,
          type: NotiType.SUBSCRIBE,
        });
        io.to(chanelId).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("reply-comment", async (replyId, ownId, commentId) => {
      try {
        const noti = await NotificationStore.create({
          from: replyId,
          to: ownId,
          commentId,
        });
        io.to(ownId).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("like-video", async (userId, videoId) => {
      try {
        const video = await Video.findOne(videoId, { relations: ["user"] });
        if (!userId || !video || video.user.id === userId) {
          return;
        }
        const exsistingNoti = await NotificationStore.findOne({
          from: userId,
          to: video.user.id,
          type: NotiType.LIKEVIDEO,
          videoId,
        });
        if (exsistingNoti) return;
        const noti = await NotificationStore.create({
          from: userId,
          to: video.user.id,
          type: NotiType.LIKEVIDEO,
          videoId,
        });
        io.to(video.user.id).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("like-comment", async (userId, commentId, videoId) => {
      try {
        const comment = await Comment.findOne(commentId, {
          relations: ["user"],
        });
        if (!userId || !comment || comment.user.id === userId) {
          return;
        }
        const exsistingNoti = await NotificationStore.findOne({
          from: userId,
          to: comment.user.id,
          type: NotiType.LIKECOMMENT,
          commentId,
        });
        if (exsistingNoti) return;
        const noti = await NotificationStore.create({
          from: userId,
          to: comment.user.id,
          type: NotiType.LIKECOMMENT,
          commentId,
          videoId,
        });
        io.to(comment.user.id).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("other-notify", async (toId, message, fromId) => {
      try {
        const noti = await NotificationStore.create({
          to: toId,
          message,
          ...(fromId ? { from: fromId } : {}),
        });
        io.to(toId).emit("notify", noti._id);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
