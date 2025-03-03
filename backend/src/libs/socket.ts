import { Server } from "socket.io";
import http from "http";
import express from "express";
// import { isConnected, qrDinamic, sock } from "./whatsapp";
// import QRCode from "qrcode";
import { NODE_ENV } from "@/config";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const socket = io.on("connection", async socket => {
  if (NODE_ENV === "development") {
    console.log("socket connected");
  }
  //   if (isConnected()) {
  //     updateQR("connected");
  //   } else if (qrDinamic) {
  //     updateQR("qr");
  //   }

  //   socket?.on("update_qr", () => {
  //     updateQR("qr");
  //   });

  socket.on("disconnect", () => {
    console.log("Socket Disconnect");
  });

  return socket;
});

// const updateQR = (event: "connected" | "qr" | "loading") => {
//   switch (event) {
//     case "qr":
//       QRCode.toDataURL(qrDinamic, (err, url) => {
//         socket?.emit("qr", url);
//         socket?.emit("log", "QR recieved , scan");
//       });
//       break;
//     case "connected":
//       console.log(sock?.user);
//       //   socket?.emit("qrstatus", "check");
//       socket?.emit("qrstatus", "connected");
//       socket?.emit("log", "connected user");
//       const { id } = sock?.user;
//       socket?.emit("user", id);

//       break;
//     case "loading":
//       socket?.emit("qrstatus", "loading");
//       socket?.emit("log", "Charging ....");

//       break;
//     default:
//       break;
//   }
// };

export { app, server, io, socket };
