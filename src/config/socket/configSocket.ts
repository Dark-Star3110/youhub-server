import { Server as ExpressServer } from "http";
import { Server } from "socket.io";

export const configSocket = async (app: ExpressServer) => {
  const io = new Server(app, {
    cors: {
      origin: process.env.CLIENT_DOMAINS as string,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (videoId) => {
      if (!videoId) return;
      socket.join(videoId);
    });

    socket.on("comment", (payload, videoId) => {
      // if (!(payload instanceof Comment)) return;
      io.to(videoId).emit("message", payload);
    });

    socket.on("leave-room", (videoId) => {
      if (!videoId) return;
      try {
        socket.leave(videoId);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
