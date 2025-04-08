import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeInMemoryStore,
  makeWASocket,
  proto,
  UserFacingSocketConfig,
  WAVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode";
import fs from "fs";

import { NODE_ENV, SESSION_PATH } from "@/config";
import { color, sleep } from "@/utils/utils";
import { socket } from "@libs/socket";
import SessionDB from "./session-db";
import { logDir, logger } from "./logger";
import { join } from "path";
import { usePrismaAuthState } from "./use-prisma-auth-state";
import { db } from "../db";

export type SessionType = {
  isStop: boolean;
} & ReturnType<typeof makeWASocket>;

let sessions: SessionType | null;

class ConnectionSession extends SessionDB {
  public readonly sessionPath: string;
  public readonly logPath: string;
  public count: number;

  constructor() {
    super();
    this.sessionPath = SESSION_PATH;
    this.logPath = logDir;
    this.count = 0;
  }

  public getClient() {
    return sessions ?? null;
  }

  public async deleteSession(session_name: string) {
    await db.$queryRawUnsafe(`TRUNCATE TABLE whatsapp_auth_credentials;`);
    if (fs.existsSync(`${this.sessionPath}/store/${session_name}.json`))
      fs.unlinkSync(`${this.sessionPath}/store/${session_name}.json`);
    if (fs.existsSync(`${this.logPath}/${session_name}.txt`))
      fs.unlinkSync(`${this.logPath}/${session_name}.txt`);
    await this.deleteSessionDB(session_name);
    socket.emit("update-qr", { buffer: null, session_name });
    sessions = null;
  }

  public async generateQr(input: string, session_name: string) {
    const rawData = await qrcode.toDataURL(input, { scale: 8 });
    const dataBase64 = rawData.replace(/^data:image\/png;base64,/, "");
    await sleep(3000);
    socket.emit(`update-qr`, { buffer: dataBase64, session_name });
    this.count++;
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${session_name}] Open the browser, a qr has appeared on the website, scan it now!`,
        "#E6B0AA",
      ),
    );
    console.log(this.count);
  }

  public async createSession(session_name: string) {
    const storePath = `${this.sessionPath}/store/${session_name}.json`;
    const { state, saveCreds } = await usePrismaAuthState();
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const options: UserFacingSocketConfig = {
      printQRInTerminal: false,
      auth: state,
      logger: logger,
      shouldIgnoreJid: jid => isJidBroadcast(jid),
      browser:
        NODE_ENV === "development"
          ? Browsers.windows("Chrome")
          : Browsers.ubuntu("Chrome"),
      version,
    };

    const store = makeInMemoryStore({});
    store.readFromFile(storePath);

    const client = makeWASocket(options);

    if (!fs.existsSync(`${this.sessionPath}/store`)) {
      fs.mkdirSync(`${this.sessionPath}/store`, { recursive: true });
      console.log("Folder berhasil dibuat!");
    }

    store.readFromFile(storePath);
    setInterval(() => {
      store.writeToFile(storePath);
    }, 10_000);
    store.bind(client.ev);
    sessions = { ...client, isStop: true };

    // When Succeefuly update creds
    client.ev.on("creds.update", saveCreds);

    // If Create Connection
    client.ev.on("connection.update", async update => {
      if (update.qr) this.generateQr(update.qr, session_name);

      if (update.isNewLogin) {
        await this.createSessionDB(
          session_name,
          client.authState.creds.me.id.split(":")[0],
        );

        const files = join(this.logPath, `${session_name}.txt`);
        if (!fs.existsSync(files)) {
          fs.writeFileSync(
            files,
            `Success Create new Session : ${session_name}, ${
              client.authState.creds.me.id.split(":")[0]
            }\n`,
          );
        }
        const readLog = fs.readFileSync(files, "utf8");
        return socket.emit("logger", {
          session_name,
          result: readLog,
          files,
          session_number: client.authState.creds.me.id.split(":")[0],
          status: "CONNECTED",
        });
      }

      const { lastDisconnect, connection } = update;
      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `Bad Session File, Please Delete [Session: ${session_name}] and Scan Again`,
              "#E6B0AA",
            ),
          );
          await this.deleteSession(session_name);
          client.logout();
          return socket.emit("connection-status", {
            session_name,
            result: "Bad Session File, Please Create QR Again",
          });
        } else if (reason === DisconnectReason.connectionClosed) {
          const checked = this.getClient();
          if (checked.isStop == false) {
            console.log(
              color("[SYS]", "#EB6112"),
              color(
                `[Session: ${session_name}] Connection closed, reconnecting....`,
                "#E6B0AA",
              ),
            );
            this.createSession(session_name);
          } else if (checked.isStop == true) {
            await this.updateStatusSessionDB(session_name, "STOPPED");
            console.log(
              color("[SYS]", "#EB6112"),
              color(
                `[Session: ${session_name}] Connection close Success`,
                "#E6B0AA",
              ),
            );
            socket.emit("session-status", {
              session_name,
              status: "STOPPED",
            });
          }
        } else if (reason === DisconnectReason.connectionLost) {
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `[Session: ${session_name}] Connection Lost from Server, reconnecting...`,
              "#E6B0AA",
            ),
          );
          this.createSession(session_name);
        } else if (reason === DisconnectReason.connectionReplaced) {
          await this.deleteSession(session_name);
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Close Current Session First`,
              "#E6B0AA",
            ),
          );
          client.logout();
          socket.emit("connection-status", {
            session_name,
            result: `[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Create QR Again`,
          });
        } else if (reason === DisconnectReason.loggedOut) {
          await this.deleteSession(session_name);
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `Device Logged Out, Please Delete [Session: ${session_name}] and Scan Again.`,
              "#E6B0AA",
            ),
          );
          client.logout();
          socket.emit("connection-status", {
            session_name,
            result: `[Session: ${session_name}] Device Logged Out, Please Create QR Again`,
          });
        } else if (reason === DisconnectReason.restartRequired) {
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `[Session: ${session_name}] Restart Required, Restarting...`,
              "#E6B0AA",
            ),
          );
          this.createSession(session_name);
        } else if (reason === DisconnectReason.timedOut) {
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `[Session: ${session_name}] Connection TimedOut, Reconnecting...`,
              "#E6B0AA",
            ),
          );
          this.createSession(session_name);
        } else {
          client.end(
            new Error(
              `Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`,
            ),
          );
        }
      } else if (connection == "open") {
        await this.updateStatusSessionDB(session_name, "CONNECTED");
        socket.emit("session-status", { session_name, status: "CONNECTED" });
        console.log(
          color("[SYS]", "#EB6112"),
          color(
            `[Session: ${session_name}] Session is Now Connected - Baileys Version ${version}, isLatest : ${isLatest}`,
            "#82E0AA",
          ),
        );

        sessions = { ...sessions, isStop: false };

        if (NODE_ENV === "development") {
          const foundSession = await this.findSessionDB(session_name);
          if (foundSession?.send_first_message) return;
          await this.sendFirstMessage(version, isLatest);
          await this.updateSessionDB(
            session_name,
            foundSession.session_number,
            true,
          );
        }
      }
    });

    client.ev.on("messages.upsert", async ({ messages, type }) => {
      try {
        messages.forEach(message => {
          if (!message.key.fromMe) return;

          this.replyMessage(message);
        });
      } catch (error) {
        logger.error(error, type);
      }
    });
  }
  public getMessageContent(message: proto.IWebMessageInfo) {
    try {
      return (
        message.message.conversation ||
        message.message.extendedTextMessage?.text
      );
    } catch (error) {
      return "";
    }
  }

  public async sendFirstMessage(version: WAVersion, isLatest: boolean) {
    try {
      await sessions.sendMessage(sessions.user.id, {
        text: `Whatsapp BOT is Running - Baileys Version ${version}, isLatest : ${isLatest}\n🧩 enter "PING" to test`,
      });
    } catch (error) {
      throw error;
    }
  }

  public async replyMessage(message: proto.IWebMessageInfo) {
    try {
      const msg = this.getMessageContent(message);

      if (!msg) return;

      const session = this.getClient();

      switch (msg.toLowerCase()) {
        case "ping":
          await sessions.sendMessage(session.user.id, {
            text: "From server: Pong",
          });
          break;
      }
    } catch (error) {
      throw error;
    }
  }
}

export default ConnectionSession;
