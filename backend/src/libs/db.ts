import { PrismaClient } from "@prisma/client";
import { createSoftDeleteExtension } from "prisma-extension-soft-delete";

const db = new PrismaClient();

// USING SOFT DELETE
db.$extends(
  createSoftDeleteExtension({
    models: {
      HistoryMessageWA: true,
    },
    defaultConfig: {
      field: "deleted_at",
      createValue: deleted => {
        if (deleted) return new Date();
        return null;
      },
    },
  }),
);

export { db };
