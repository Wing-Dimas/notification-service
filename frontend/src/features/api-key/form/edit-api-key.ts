import { z } from "zod";

export const editApiKeyFormSchema = z.object({
  name: z.string().min(1, { message: "Nama harus minimal 1 karakter" }),
  is_active: z
    .boolean()
    .refine(value => typeof value === "boolean", { message: "Invalid value" }),
});

export type EditApiKeyFormSchema = z.infer<typeof editApiKeyFormSchema>;
