import { z } from "zod";

export type User = {
  username: string;
  password: string;
  userid: number;
};

export const UserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(10),
  userid: z.number().int(),
});
