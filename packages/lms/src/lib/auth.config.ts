import { NextAuthConfig } from "next-auth";
import { Resource } from "sst";
import invariant from "tiny-invariant";

process.env.AUTH_SECRET = Resource.AuthSecret.value;

export const authConfig = {
  callbacks: {
    redirect({ baseUrl }) {
      return baseUrl;
    },
    session({ session, token }) {
      invariant(token.sub);
      session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
