import { z } from "zod";

export type User = {
  username: string;
  password: string;
};

export const UserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(10),
});
