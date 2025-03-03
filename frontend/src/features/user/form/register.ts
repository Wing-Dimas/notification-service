import { z } from "zod";

export const registerFormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
