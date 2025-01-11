import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcrypt";
import { User, UserSchema } from "./lib/types/backend";
import { isOfTypeWithErrors, ValidationError } from "./lib/validationProcessor";

const getUser = (username: string): User | undefined => {
  const user1 = {
    username: process.env.USERNAME1 ?? "",
    password: process.env.PASSWORD1 ?? "",
    userid: process.env.USERID1 ? parseInt(process.env.USERID1) : 0,
  };
  const user2 = {
    username: process.env.USERNAME2 ?? "",
    password: process.env.PASSWORD2 ?? "",
    userid: process.env.USERID2 ? parseInt(process.env.USERID2) : 0,
  };
  const guestUser = {
    username: "Guest",
    password: "",
    userid: 3,
  };

  const [validUser1, errors1] = isOfTypeWithErrors(user1, UserSchema);
  const [validUser2, errors2] = isOfTypeWithErrors(user2, UserSchema);

  if (!validUser1) {
    console.error("Validation failed:", errors1);
    throw new ValidationError(errors1);
  }
  if (!validUser2) {
    console.error("Validation failed:", errors2);
    throw new ValidationError(errors1);
  }

  const allowedUsers = [user1, user2, guestUser];

  const user = allowedUsers.filter((user) => user.username === username);
  return user[0];
};

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string(),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = getUser(username);
          if (!user) return null;
          if (user.username === "Guest") return user;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        } else {
          console.table(parsedCredentials.error.issues);
        }
        console.log("Invalid credentials");

        return null;
      },
    }),
  ],
});
