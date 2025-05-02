import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  Browsers,
  ConnectionState,
  AuthenticationState,
  WAVersion,
  makeInMemoryStore,
  WAMessage,
  Contact,
  WACallEvent,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { logger } from "./logger";
import { usePrismaAuthState } from "./use-prisma-auth-state";
import EventEmitter from "events";
import fs from "fs";

import { NODE_ENV } from "@/config";
import { color, shouldIgnoreJid } from "./utils";
import { db } from "../db";
import { CommandHandler, MessageContext } from "./types";
import { UnionTypeWithString } from "@/utils/utils";

class WhatsappService extends EventEmitter {
  private socket: WASocket | null = null;
  private logger = logger;
  private commandHandlers: Map<string, CommandHandler>;
  private sessionName = "WHATSAPP";
  private storePath = `session/store/${this.sessionName}.json`;
  private model = db.session;
  private readonly MAX_RECONNECT_RETRIES = 2;
  private count = 0;

  public isStop = false;
  public isConnected = false;
  public version: WAVersion;
  public authState: {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  } = null;

  constructor(sessionName?: string) {
    super();
    // Create auth folder if it doesn't exist
    if (!fs.existsSync(`session/store`)) {
      fs.mkdirSync(`session/store`, { recursive: true });
      this.logger.info(`Created session folder: session/store`);
    }
    if (sessionName) this.sessionName = sessionName;
    this.storePath = `session/store/${this.sessionName}.json`;
    this.commandHandlers = new Map<string, CommandHandler>();
  }

  public async initialize(): Promise<void> {
    try {
      // Get auth state
      const { state, saveCreds } = await usePrismaAuthState();
      this.authState = { state, saveCreds };

      // Fetch latest Baileys version
      const { version } = await fetchLatestBaileysVersion();
      this.version = version;
      this.logger.info(`Using WhatsApp Web version: ${version.join(".")}`);

      // Create socket
      this.socket = makeWASocket({
        version,
        printQRInTerminal: false,
        syncFullHistory: false,
        logger: this.logger,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger),
        },
        browser:
          NODE_ENV === "development"
            ? Browsers.windows("Chrome")
            : Browsers.ubuntu("Chrome"),
        shouldIgnoreJid: shouldIgnoreJid,
        // getMessage: async key => {
        //   const data = await db.message.findFirst({
        //     where: { remoteJid: key.remoteJid!, id: key.id!, sessionId },
        //   });
        //   return (data?.message || undefined) as proto.IMessage | undefined;
        // },
      });

      const store = makeInMemoryStore({});
      store.readFromFile(this.storePath);

      setInterval(() => {
        store.writeToFile(this.storePath);
      }, 10_000);
      store.bind(this.socket.ev);

      // Setup event listeners
      this.setupConnectionListener(saveCreds);
      this.setupMessageListener();

      return Promise.resolve();
    } catch (error) {
      this.logger.error("Error initializing WhatsApp service:", error);
      return Promise.reject(error);
    }
  }

  private setupConnectionListener(saveCreds: () => Promise<void>): void {
    if (!this.socket) return;

    // Handle incoming calls
    this.socket.ev.on("call", async calls => {
      await this.handleRejectCall(calls);
    });

    // Handle credentials updates
    this.socket.ev.on("creds.update", saveCreds);

    // Handle connection status changes
    this.socket.ev.on("connection.update", async update => {
      await this.handleConnectionUpdate(update);
    });
  }

  private async handleRejectCall(calls: WACallEvent[]) {
    try {
      for (const call of calls) {
        if (call.status === "offer") {
          const callerId = call.from;

          // reject the call
          await this.socket.rejectCall(call.id, call.from);

          this.logger.warn(
            `Panggilan dari ${callerId} ditolak secara otomatis`,
          );

          // send message to caller
          await this.sendMessage(
            callerId,
            "Maaf, akun ini adalah bot dan tidak dapat menerima panggilan.",
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error saat menolak panggilan: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private async handleConnectionUpdate(
    update: Partial<ConnectionState>,
  ): Promise<void> {
    const { qr, isNewLogin, lastDisconnect, connection } = update;

    if (this.count >= this.MAX_RECONNECT_RETRIES) {
      await this.handleDeleteSession();
      this.emit("connection-status", {
        session_name: this.sessionName,
        result: "No Response, QR Scan Canceled",
      });
      this.logger.info(`Count : ${this.count}, QR Stopped!`);
      this.socket.ev.removeAllListeners("connection.update");
      this.isConnected = false;
      return;
    }

    // Handle QR code generation
    if (qr) {
      this.count++;
      this.emit("qr", qr);
      this.logger.info("QR Code generated, waiting for scan...", qr);
      this.logger.info("Total QR Code generated: " + this.count);
      return;
    }

    // Handle successful new login
    if (isNewLogin) {
      await this.handleNewLogin();
      return;
    }

    // Handle connection state changes
    if (connection === "close") {
      this.isConnected = false;
      await this.handleConnectionClose(lastDisconnect);
    } else if (connection === "open") {
      this.isConnected = true;
      await this.handleConnectionOpen();
    }
  }

  private async handleNewLogin(): Promise<void> {
    const phoneNumber = this.socket.authState.creds.me.id.split(":")[0];

    await this.model.create({
      data: { session_name: this.sessionName, session_number: phoneNumber },
    });

    this.logger.info(
      `Success Create new Session: ${this.sessionName}, ${phoneNumber}`,
    );
  }

  private async handleConnectionClose(lastDisconnect: {
    error: Error | undefined;
    date: Date;
  }): Promise<void> {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    switch (reason) {
      case DisconnectReason.badSession:
        await this.handleBadSession();
        break;

      case DisconnectReason.connectionClosed:
        await this.handleConnectionClosed();
        break;

      case DisconnectReason.connectionLost:
        this.handleConnectionLost();
        break;

      case DisconnectReason.connectionReplaced:
        await this.handleConnectionReplaced();
        break;

      case DisconnectReason.loggedOut:
        await this.handleLoggedOut();
        break;

      case DisconnectReason.restartRequired:
        this.handleRestartRequired();
        break;

      case DisconnectReason.timedOut:
        this.handleTimedOut();
        break;

      default:
        this.logger.error(
          `Unknown DisconnectReason: ${reason}|${JSON.stringify(
            lastDisconnect.error,
          )}`,
        );
        this.socket.end(
          new Error(
            `Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`,
          ),
        );
    }
  }

  private async handleBadSession(): Promise<void> {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `Bad Session File, Please Delete [Session: ${this.sessionName}] and Scan Again`,
        "#E6B0AA",
      ),
    );

    // await this.deleteSession(sessionName);
    await this.handleDeleteSession();
    this.socket.logout();

    this.emit("connection-status", {
      result: "Bad Session File, Please Create QR Again",
    });
  }

  private async handleConnectionClosed(): Promise<void> {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Connection closed, reconnecting....`,
        "#E6B0AA",
      ),
    );

    this.initialize();
  }

  private handleConnectionLost(): void {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Connection Lost from Server, reconnecting...`,
        "#E6B0AA",
      ),
    );

    this.initialize();
  }

  /**
   * Handles connection replaced disconnection reason
   */
  private async handleConnectionReplaced(): Promise<void> {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Connection Replaced, Another New Session Opened, Please Close Current Session First`,
        "#E6B0AA",
      ),
    );

    this.socket.logout();
    await this.handleDeleteSession();

    this.emit("connection-status", {
      result: `[Session: ${this.sessionName}] Connection Replaced, Another New Session Opened, Please Create QR Again`,
    });
  }

  /**
   * Handles restart required disconnection reason
   */
  private handleRestartRequired(): void {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Restart Required, Restarting...`,
        "#E6B0AA",
      ),
    );

    this.initialize();
  }

  /**
   * Handles logged out disconnection reason
   */
  private async handleLoggedOut(): Promise<void> {
    await this.handleDeleteSession();

    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `Device Logged Out, Please Delete [Session: ${this.sessionName}] and Scan Again.`,
        "#E6B0AA",
      ),
    );

    this.socket.logout();

    this.emit("connection-status", {
      result: `[Session: ${this.sessionName}] Device Logged Out, Please Create QR Again`,
    });

    // process.exit(1);
  }

  /**
   * Handles timed out disconnection reason
   */
  private handleTimedOut(): void {
    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Connection TimedOut, Reconnecting...`,
        "#E6B0AA",
      ),
    );

    this.initialize();
  }

  /**
   * Handles open connection state
   */
  private async handleConnectionOpen(): Promise<void> {
    await this.model.update({
      where: { session_name: this.sessionName },
      data: { status: "CONNECTED" },
    });

    this.emit("session-status", { status: "CONNECTED" });
    this.emit("ready");

    console.log(
      color("[SYS]", "#EB6112"),
      color(
        `[Session: ${this.sessionName}] Session is Now Connected`,
        "#82E0AA",
      ),
    );

    const findSession = await this.model.findUnique({
      where: { session_name: this.sessionName },
    });

    this.isStop = findSession?.is_stop || false;

    if (!findSession?.send_first_message) {
      await this.sendFirstMessage();
      await this.model.update({
        where: { session_name: this.sessionName },
        data: { send_first_message: true },
      });
    }
  }

  private async handleDeleteSession(): Promise<void> {
    try {
      await db.$queryRawUnsafe(`TRUNCATE TABLE whatsapp_auth_credentials;`);
      if (fs.existsSync(this.storePath)) fs.unlinkSync(this.storePath);
      const findSession = await this.model.findUnique({
        where: { session_name: this.sessionName },
      });
      if (findSession) {
        await this.model.delete({ where: { session_name: this.sessionName } });
      }

      this.emit("update-qr", { buffer: null, session_name: this.sessionName });
      this.isConnected = false;
    } catch (error) {
      this.emit("error", "Error deleting session: " + error.message);
      throw error;
    }
  }

  private setupMessageListener(): void {
    if (!this.socket) return;

    this.socket.ev.on("messages.upsert", async m => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (msg.message) {
            await this.handleIncomingMessage(msg);
          }
        }
      }
    });
  }

  /**
   * Sends initial message after session connection
   */
  private async sendFirstMessage(): Promise<void> {
    try {
      if (!this.socket) return;

      await this.sendMessage(
        this.socket.user.id,
        `Whatsapp BOT is Running\n🧩 enter ".ping" to test`,
      );
    } catch (error) {
      throw error;
    }
  }

  private async handleIncomingMessage(message: WAMessage): Promise<void> {
    if (!this.socket) return;

    try {
      const content = message.message || {};

      // Ekstrak the message text from the message object
      const messageText =
        content.conversation ||
        (content.extendedTextMessage && content.extendedTextMessage.text) ||
        (content.imageMessage && content.imageMessage.caption) ||
        (content.videoMessage && content.videoMessage.caption) ||
        "";

      // get metadata from the message
      const sender = message.key.remoteJid;
      const senderName = message.pushName || "User";

      logger.info(`Pesan dari ${senderName} (${sender}): ${messageText}`);

      // create context for the command handler
      const ctx: MessageContext = {
        socket: this.socket,
        message,
        sender,
        senderName,
      };

      this.emit("message", ctx);

      // Check if the message matches any registered command patterns
      for (const [pattern, command] of this.commandHandlers.entries()) {
        const regex = new RegExp(pattern);
        if (regex.test(messageText)) {
          logger.info(`Menjalankan handler untuk pola: ${pattern}`);
          await command.handler(ctx);
          break;
        }
      }
    } catch (error) {
      logger.error(`Error saat menangani pesan: ${error.message}`);
    }
  }

  /**
   * Register a command handler
   */
  public registerCommand(handler: CommandHandler): void {
    this.commandHandlers.set(handler.pattren, handler);
  }

  /**
   * Register multiple command handlers
   */
  public registerCommands(handlers: CommandHandler[]): void {
    handlers.forEach(handler => this.registerCommand(handler));
  }

  /**
   * Send a message to a WhatsApp user
   */
  public async sendMessage(to: string, text: string): Promise<WAMessage> {
    if (!this.socket || !this.isConnected) {
      this.logger.error("Cannot send message: WhatsApp not connected");
      throw new Error("WhatsApp not connected");
    }

    try {
      // Format number to WhatsApp format (add @s.whatsapp.net)
      const formattedNumber = this.formatPhoneNumber(to);

      const sent = await this.socket.sendMessage(formattedNumber, { text });
      this.logger.info(`Text message sent to ${formattedNumber}`);
      return sent;
    } catch (error) {
      this.logger.error(`Error sending text message to ${to}:`, error);
      throw error;
    }
  }

  public async sendImage(
    to: string,
    path: string,
    filename: string,
    caption: string,
    mimeType: string,
  ): Promise<WAMessage> {
    if (!this.socket || !this.isConnected) {
      this.logger.error("Cannot send image: WhatsApp not connected");
      throw new Error("WhatsApp not connected");
    }

    try {
      // Check if file exists
      if (!fs.existsSync(path)) {
        this.logger.error(`File not found: ${path}`);
        throw new Error(`File not found: ${path}`);
      }

      // Format number to WhatsApp format
      const formattedNumber = this.formatPhoneNumber(to);

      // Read image file
      const buffer = fs.readFileSync(path);

      // Send image message with optional caption
      const sent = await this.socket.sendMessage(formattedNumber, {
        caption: caption,
        image: buffer,
        mimetype: mimeType,
        fileName: filename,
      });

      this.logger.info(`Image message sent to ${formattedNumber}`);
      return sent;
    } catch (error) {
      this.logger.error(`Error sending image to ${to}:`, error);
      throw error;
    }
  }

  public async sendVideo(
    to: string,
    path: string,
    filename: string,
    caption: string,
    mimeType: string,
    gifPlayback: boolean,
  ): Promise<WAMessage> {
    if (!this.socket || !this.isConnected) {
      this.logger.error("Cannot send video: WhatsApp not connected");
      throw new Error("WhatsApp not connected");
    }

    try {
      // Check if file exists
      if (!fs.existsSync(path)) {
        this.logger.error(`File not found: ${path}`);
        throw new Error(`File not found: ${path}`);
      }

      // Format number to WhatsApp format
      const formattedNumber = this.formatPhoneNumber(to);

      // Read video file
      const buffer = fs.readFileSync(path);

      // Send video message with optional caption
      const sent = await this.socket.sendMessage(formattedNumber, {
        video: buffer,
        caption: caption,
        fileName: filename,
        mimetype: mimeType,
        gifPlayback: gifPlayback || false,
      });

      this.logger.info(`Video message sent to ${formattedNumber}`);
      return sent;
    } catch (error) {
      this.logger.error(`Error sending video to ${to}:`, error);
      throw error;
    }
  }

  public async sendDocument(
    to: string,
    path: string,
    fileName: string,
    mimeType: string,
    caption: string,
  ): Promise<WAMessage> {
    if (!this.socket || !this.isConnected) {
      this.logger.error("Cannot send document: WhatsApp not connected");
      throw new Error("WhatsApp not connected");
    }

    try {
      // Check if file exists
      if (!fs.existsSync(path)) {
        this.logger.error(`File not found: ${path}`);
        throw new Error(`File not found: ${path}`);
      }

      // Format number to WhatsApp format
      const formattedNumber = this.formatPhoneNumber(to);

      // Read document file
      const buffer = fs.readFileSync(path);

      // Send document message
      const sent = await this.socket.sendMessage(formattedNumber, {
        document: buffer,
        mimetype: mimeType,
        fileName: fileName,
        caption: caption,
      });

      this.logger.info(`Document message sent to ${formattedNumber}`);
      return sent;
    } catch (error) {
      this.logger.error(`Error sending document to ${to}:`, error);
      throw error;
    }
  }

  public async sendAudio(
    to: string,
    path: string,
    fileName: string,
    mimeType: string,
    caption: string,
  ): Promise<WAMessage> {
    if (!this.socket || !this.isConnected) {
      this.logger.error("Cannot send audio: WhatsApp not connected");
      throw new Error("WhatsApp not connected");
    }

    try {
      // Check if file exists
      if (!fs.existsSync(path)) {
        this.logger.error(`File not found: ${path}`);
        throw new Error(`File not found: ${path}`);
      }

      // Format number to WhatsApp format
      const formattedNumber = this.formatPhoneNumber(to);

      // Read audio file
      const buffer = fs.readFileSync(path);

      // Send audio message
      const sent = await this.socket.sendMessage(formattedNumber, {
        audio: buffer,
        mimetype: mimeType,
        fileName: fileName,
        caption: caption,
      });

      this.logger.info(`Audio message sent to ${formattedNumber}`);
      return sent;
    } catch (error) {
      this.logger.error(`Error sending audio to ${to}:`, error);
      throw error;
    }
  }

  public async sendMedia(
    to: string,
    path: string,
    fileName: string,
    mimeType: string,
    caption: string,
    category: UnionTypeWithString<"image" | "video" | "document">,
  ): Promise<WAMessage> {
    switch (category) {
      case "image":
        return this.sendImage(to, path, fileName, mimeType, caption);
      case "video":
        return this.sendVideo(to, path, fileName, caption, mimeType, false);
      default:
        return this.sendDocument(to, path, fileName, mimeType, caption);
    }
  }

  public async getConnectedStatus(): Promise<boolean> {
    return this.isConnected;
  }

  public async getBotInfo(): Promise<Contact> {
    if (!this.socket) throw new Error("Socket not initialized");

    return this.socket.user;
  }

  public formatPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.endsWith("@s.whatsapp.net")) return phoneNumber;
    const phone = phoneNumber.replace(/\D/g, "");
    if (phone.startsWith("08")) {
      const slice = phone.slice(1);
      return `62${slice}@s.whatsapp.net`;
    } else if (phone.startsWith("62")) {
      return phone + "@s.whatsapp.net";
    } else {
      return null;
    }
  }

  public getUser(): Contact {
    if (!this.socket) throw new Error("Socket not initialized");

    return this.socket.user;
  }

  public setIsStop(isStop: boolean): void {
    if (!this.socket) throw new Error("Socket not initialized");

    this.model.update({
      where: { session_name: this.sessionName },
      data: { is_stop: isStop },
    });

    this.emit("connection-status", {
      result: `[Session: ${this.sessionName}] isStop: ${isStop}`,
    });

    this.isStop = isStop;
  }

  public getIsStop(): boolean {
    if (!this.socket) throw new Error("Socket not initialized");

    return this.isStop;
  }

  public async disconnect(): Promise<void> {
    if (!this.socket) throw new Error("Socket not initialized");

    this.socket.end(new Error("User disconnected"));
    await this.handleDeleteSession();
    this.socket = null;
    this.isConnected = false;
    this.logger.info("WhatsApp disconnected");
  }
}

export default WhatsappService;
