import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { NODE_ENV } from "@/config";

export let sock: ReturnType<typeof makeWASocket>;
export let qrDinamic: string;

const { session } = { session: "session_auth_info" };
const store = {};

export const isConnected = () => {
  return sock?.user ? true : false;
};

// MENERIMA PESAN
const getMessage = key => {
  const { id } = key;
  if (store[id]) return store[id].message;
};

export const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session_auth_info");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    version,
    getMessage,
  });

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect, qr } = update;
    qrDinamic = qr;
    if (connection === "close") {
      const reason = new Boom(lastDisconnect.error).output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          `Bad Session File, Please Delete ${session} and Scan Again`,
        );
        sock.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Server connection lost, reconnecting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection replaced, another new session opened, please close the current session first",
        );
        sock.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device closed, delete ${session} and scan again.`);
        sock.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart required, restarting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection timed out, connecting...");
        connectToWhatsApp();
      } else {
        sock.end(
          new Error(
            `Unknown disconnection reason: ${reason}|${lastDisconnect?.error?.message}`,
          ),
        );
      }
    } else if (connection === "open") {
      console.log("open connection");
      return;
    }
  });

  //   sock.ev.on("messages.upsert", async ({ messages, type }) => {
  //     try {
  //       if (type === "notify") {
  //         if (!messages[0]?.key.fromMe) {
  //           const captureMessage = messages[0]?.message?.conversation;
  //           const numberWa = messages[0]?.key?.remoteJid;

  //           const compareMessage = captureMessage.toLocaleLowerCase();

  //           if (compareMessage === "ping") {
  //             await sock.sendMessage(
  //               numberWa,
  //               {
  //                 text: "Pong",
  //               },
  //               {
  //                 quoted: messages[0],
  //               },
  //             );
  //           }
  //         }
  //         if (NODE_ENV === "development") {
  //           console.log(messages[0]);
  //         }
  //       }
  //     } catch (error) {
  //       console.log("error ", error);
  //     }
  //   });

  sock.ev.on("creds.update", saveCreds);
};
