import { Comment } from "./../../entities/Comment";
import { Server as ExpressServer } from "http";
import { Server } from "socket.io";

export const configSocket = async (app: ExpressServer) => {
  const io = new Server(app);

  io.on("connection", (socket) => {
    socket.on("join-room", (videoId) => {
      console.log("join");
      if (!videoId) return;
      socket.join(videoId);
    });

    socket.on("comment", (payload) => {
      console.log("comment");
      if (!(payload instanceof Comment)) return;
      io.to(payload.videoId).emit("message", payload);
    });

    socket.on("leave-room", (videoId) => {
      console.log("leave-room");
      if (!videoId) return;
      try {
        socket.leave(videoId);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
