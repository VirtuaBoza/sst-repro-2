import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resource } from "sst";
import { authConfig } from "./auth.config";
import { db } from "@stacks-ils-ion/core/sql";
import { redirect } from "next/navigation";
import Google from "@auth/core/providers/google";
import NextAuth from "next-auth";
import invariant from "tiny-invariant";

export const {
  auth,
  handlers: { GET, POST },
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: Resource.GoogleClientId.value,
      clientSecret: Resource.GoogleClientSecret.value,
    }),
  ],
});

export async function userOrRedirect() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  invariant(session.user.email, "No email in session.");

  return {
    email: session.user.email,
    id: session.user.id,
    image: session.user.image,
  };
}
