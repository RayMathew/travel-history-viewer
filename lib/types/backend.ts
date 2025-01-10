import { z } from "zod";
import { OutdoorActivityType } from "./shared";

// Note: NDA - Notion Data Assumption. I'm going to write NDA in all the places where I assume I haven't made a mistake while creating Notion data.

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

export type OutdoorActivityTag = {
  name: OutdoorActivityType;
};

export type CoordinatesRaw = {
  rich_text: [
    {
      plain_text: string;
    }
  ];
};

export type Places = {
  plain_text: string;
};

export type People = {
  name: string;
};
