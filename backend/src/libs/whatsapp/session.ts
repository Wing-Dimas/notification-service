import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState,
  UserFacingSocketConfig,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode";
import fs from "fs";
// import { modules } from "../../lib/index.js";
// import { socket, moment } from "../config/index.js";
// import Message from "./Client/handler/Message.js";
import { SESSION_PATH } from "@/config/index.js";
import { color, sleep } from "@/utils/utils";
import { socket } from "@libs/socket";

type SessionType = {
  isStop: boolean;
} & ReturnType<typeof makeWASocket>;

let sessions: SessionType | null = null;

class ConnectionSession {
  private readonly sessionPath: string;
  private readonly logPath: string;
  private count: number;
  constructor() {
    this.sessionPath = SESSION_PATH;
    // this.logPath = LOG_PATH;
    this.count = 0;
  }

  public getClient() {
    return sessions ?? null;
  }

  async deleteSession(session_name: string) {
    if (fs.existsSync(`${this.sessionPath}/${session_name}`))
      fs.rmSync(`${this.sessionPath}/${session_name}`, {
        force: true,
        recursive: true,
      });
    if (fs.existsSync(`${this.sessionPath}/store/${session_name}.json`))
      fs.unlinkSync(`${this.sessionPath}/store/${session_name}.json`);
    if (fs.existsSync(`${this.logPath}/${session_name}.txt`))
      fs.unlinkSync(`${this.logPath}/${session_name}.txt`);
    // await this.deleteSessionDB(session_name);
    sessions = null;
  }

  async generateQr(input, session_name) {
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

  async createSession(session_name: string) {
    const sessionDir = `${this.sessionPath}/${session_name}`;
    const storePath = `${this.sessionPath}/store/${session_name}.json`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const options: UserFacingSocketConfig = {
      printQRInTerminal: false,
      auth: state,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Safari"),
      version,
    };

    const store = makeInMemoryStore({});
    store.readFromFile(storePath);

    const client = makeWASocket(options);

    store.readFromFile(storePath);
    setInterval(() => {
      store.writeToFile(storePath);
    }, 10_000);
    store.bind(client.ev);
    sessions = { ...client, isStop: false };

    client.ev.on("creds.update", saveCreds);
    client.ev.on("connection.update", async update => {
      if (this.count >= 3) {
        this.deleteSession(session_name);
        socket.emit("connection-status", {
          session_name,
          result: "No Response, QR Scan Canceled",
        });
        console.log(`Count : ${this.count}, QR Stopped!`);
        client.ev.removeAllListeners("connection.update");
        return;
      }

      if (update.qr) this.generateQr(update.qr, session_name);

      if (update.isNewLogin) {
        // await this.createSessionDB(
        //   session_name,
        //   client.authState.creds.me.id.split(":")[0],
        // );

        client.authState.creds.me.id.split(":")[0];
        const files = `${this.logPath}/${session_name}.txt`;
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
          this.deleteSession(session_name);
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
            // await this.updateStatusSessionDB(session_name, "STOPPED");
            console.log(
              color("[SYS]", "#EB6112"),
              color(
                `[Session: ${session_name}] Connection close Success`,
                "#E6B0AA",
              ),
            );
            socket.emit("session-status", { session_name, status: "STOPPED" });
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
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Close Current Session First`,
              "#E6B0AA",
            ),
          );
          client.logout();
          return socket.emit("connection-status", {
            session_name,
            result: `[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Create QR Again`,
          });
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(
            color("[SYS]", "#EB6112"),
            color(
              `Device Logged Out, Please Delete [Session: ${session_name}] and Scan Again.`,
              "#E6B0AA",
            ),
          );
          client.logout();
          return socket.emit("connection-status", {
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
        // await this.updateStatusSessionDB(session_name, "CONNECTED");
        socket.emit("session-status", { session_name, status: "CONNECTED" });
        console.log(
          color("[SYS]", "#EB6112"),
          //   color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"),
          color(
            `[Session: ${session_name}] Session is Now Connected - Baileys Version ${version}, isLatest : ${isLatest}`,
            "#82E0AA",
          ),
        );
      }
    });

    client.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      const message = new Message(client, { messages, type }, session_name);
      message.mainHandler();
    });
  }
}

export default ConnectionSession;
