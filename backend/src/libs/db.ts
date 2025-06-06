import { PrismaClient } from "@/generated/prisma/client";
import { defineExtension } from "@/generated/prisma/internal/prismaNamespace";
import { createSoftDeleteExtension } from "prisma-extension-soft-delete";

const db = new PrismaClient();

db.$extends(
  defineExtension({
    name: "bigint-transform-extension",
    result: {
      $allModels: {
        $allOperations: {
          compute({ result }) {
            const transformBigInt = (
              obj: Record<string, unknown> | null,
            ): Record<string, unknown> | null => {
              if (obj === null || typeof obj !== "object") return obj;

              Object.entries(obj).forEach(([key, value]: [string, unknown]) => {
                if (typeof value === "bigint") {
                  obj[key] = value.toString();
                } else if (typeof value === "object") {
                  transformBigInt(value as Record<string, unknown>);
                }
              });

              return obj;
            };

            return Array.isArray(result)
              ? (result as Array<Record<string, unknown>>).map(transformBigInt)
              : transformBigInt(result);
          },
        },
      },
    },
  }),
);

// TODO : REMOVE THIS WHEN NO ISSUE WITH BIGINT
// db.$use(async (params, next) => {
//   const result = await next(params);
//   if (!result) return result;

//   const transformBigInt = (
//     obj: Record<string, unknown> | null,
//   ): Record<string, unknown> | null => {
//     if (obj === null || typeof obj !== "object") return obj;

//     Object.entries(obj).forEach(([key, value]: [string, unknown]) => {
//       if (typeof value === "bigint") {
//         (obj as Record<string, unknown>)[key] = value.toString();
//       } else if (typeof value === "object") {
//         transformBigInt(value as Record<string, unknown>);
//       }
//     });

//     return obj;
//   };

//   return Array.isArray(result)
//     ? result.map(transformBigInt)
//     : transformBigInt(result);
// });

// USING SOFT DELETE
db.$extends(
  createSoftDeleteExtension({
    models: {
      Message: true,
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
