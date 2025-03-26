import {
  AuthenticationCreds,
  AuthenticationState,
  Curve,
  generateRegistrationId,
  proto,
  SignalDataTypeMap,
  signedKeyPair,
} from "@whiskeysockets/baileys";
import { randomBytes } from "crypto";
import { db } from "../db";
import { logger } from "./logger";

interface PrismaAuthState {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}

const initAuthCreds = (): AuthenticationCreds => {
  const identityKey = Curve.generateKeyPair();
  return {
    noiseKey: Curve.generateKeyPair(),
    pairingEphemeralKeyPair: Curve.generateKeyPair(),
    signedIdentityKey: identityKey,
    signedPreKey: signedKeyPair(identityKey, 1),
    registrationId: generateRegistrationId(),
    advSecretKey: randomBytes(32).toString("base64"),
    processedHistoryMessages: [],
    nextPreKeyId: 1,
    firstUnuploadedPreKeyId: 1,
    accountSyncCounter: 0,
    accountSettings: {
      unarchiveChats: false,
    },
    registered: false,
    pairingCode: undefined,
    lastPropHash: undefined,
    routingInfo: undefined,
  };
};

const BufferJSON = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer: (k, value: any) => {
    if (
      Buffer.isBuffer(value) ||
      value instanceof Uint8Array ||
      value?.type === "Buffer"
    ) {
      return {
        type: "Buffer",
        data: Buffer.from(value?.data || value).toString("base64"),
      };
    }

    return value;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviver: (_, value: any) => {
    if (
      typeof value === "object" &&
      !!value &&
      (value.buffer === true || value.type === "Buffer")
    ) {
      const val = value.data || value.value;
      return typeof val === "string"
        ? Buffer.from(val, "base64")
        : Buffer.from(val || []);
    }

    return value;
  },
};

export const usePrismaAuthState = async (): Promise<PrismaAuthState> => {
  // Fungsi untuk menulis data ke database
  const writeData = async (id: string, data: any): Promise<void> => {
    try {
      await db.whatsaapAuthCredentials.upsert({
        where: { id: id },
        update: { value: JSON.stringify(data, BufferJSON.replacer) },
        create: {
          id: id,
          value: JSON.stringify(data, BufferJSON.replacer),
        },
      });
    } catch (error) {
      logger.error(`Error writing data:`, error);
    }
  };

  // Fungsi untuk membaca data dari database
  const readData = async (id: string): Promise<any> => {
    try {
      const data = await db.whatsaapAuthCredentials.findUnique({
        where: { id },
      });
      if (!data) return null;
      const value = data.value;
      return JSON.parse(value, BufferJSON.reviver);
    } catch (error) {
      logger.error(`Error reading data:`, error);
      return null;
    }
  };

  // Fungsi untuk menghapus data dari database
  const removeData = async (id: string): Promise<void> => {
    try {
      await db.whatsaapAuthCredentials.delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error removing data:`, error);
    }
  };

  // Membaca credentials yang sudah tersimpan (jika ada)
  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};

          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);

              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }),
          );

          return data;
        },
        set: async (data: {
          [T in keyof SignalDataTypeMap]?: {
            [id: string]: SignalDataTypeMap[T];
          };
        }): Promise<void> => {
          const tasks: Promise<void>[] = [];
          for (const type in data) {
            for (const id in data[type as keyof SignalDataTypeMap]) {
              const value = data[type]?.[id];
              const newId = `${type}-${id}`;
              tasks.push(value ? writeData(newId, value) : removeData(newId));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async (): Promise<void> => {
      if (creds) {
        await writeData("creds", creds);
      }
    },
  };
};
