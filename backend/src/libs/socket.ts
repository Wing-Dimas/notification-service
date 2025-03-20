import { Server } from "socket.io";
import http from "http";
import https from "https";
import express from "express";
import fs from "fs";
import { NODE_ENV } from "@/config";

const app = express();

const server = (() => {
  if (NODE_ENV === "production") {
    return https.createServer(
      {
        key: fs.readFileSync("localhost.key"),
        cert: fs.readFileSync("localhost.crt"),
      },
      app,
    );
  } else {
    return http.createServer(app);
  }
})();

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
