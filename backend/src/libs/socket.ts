import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const socket = io.on("connection", async socket => {
  console.log("socket connected");

  socket.on("disconnect", () => {
    console.log("Socket Disconnect");
  });

  return socket;
});

export { app, server, io, socket };
