import { z } from "zod";

export const createApiKeyFormSchema = z.object({
  name: z.string().min(1, { message: "Nama harus minimal 1 karakter" }),
});

export type CreateApiKeyFormSchema = z.infer<typeof createApiKeyFormSchema>;
