import NextAuthConfig from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && isOnLoginPage) {
        // Redirect logged-in user to home page
        return Response.redirect(new URL("/", nextUrl));
      }

      return isLoggedIn || isOnLoginPage;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.userid = token.userid;
      }

      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user && trigger == "signIn") {
        token.name = user.username;
        token.userid = user.userid;
      }
      return token;
    },
  },
  providers: [],
} satisfies typeof NextAuthConfig;
