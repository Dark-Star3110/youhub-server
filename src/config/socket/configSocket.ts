import { Server as ExpressServer } from "http";
import { Server } from "socket.io";
import NotificationStore from "../../models/notification";

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

    socket.on("comment", (payload, videoId) => {
      io.to(videoId).emit("message", payload);
    });

    socket.on("upload-video", (userId: string, videoId: string) => {
      console.log(videoId);
    });
  });
};
