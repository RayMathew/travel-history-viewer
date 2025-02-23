"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(_: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      redirectTo: "/",
      username: formData.get("username"),
      password: formData.get("password"),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Liar. Stop pretending to be my wife.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({
    redirectTo: "/login",
  });
}
