import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      This will the the main landing page. It will need to be sexy and have a
      call to action, etc.
      <UserButton afterSignOutUrl="/" />
      <SignedOut>
        <Link href="/sign-up">Sign Up</Link>
        <Link href="/sign-in">Sign In</Link>
      </SignedOut>
      <SignedIn>
        <Link href="/profile">Profile</Link>
      </SignedIn>
    </main>
  );
}
