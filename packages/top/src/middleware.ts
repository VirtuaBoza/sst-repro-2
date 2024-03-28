import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your Middleware
export default authMiddleware({
  afterAuth: async (auth, req: NextRequest) => {
    const { sessionClaims, userId } = auth;

    // For user visiting /onboarding, don't redirect
    if (userId && req.nextUrl.pathname === "/onboarding") {
      return NextResponse.next();
    }

    // User isn't signed in and the route is private -- redirect to sign-in
    if (!userId && !auth.isPublicRoute) {
      console.log("we got here");
      // return redirectToSignIn({ returnBackUrl: req.url });
      return NextResponse.redirect(
        new URL("/sign-in?redirect_url=" + req.url, req.url)
      );
    }

    // Catch users who doesn't have `onboardingComplete: true` in PublicMetata
    // Redirect them to the /onboarding out to complete onboarding
    // if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    //   const onboardingUrl = new URL('/onboarding', req.url)
    //   return NextResponse.redirect(onboardingUrl)
    // }

    // User is logged in and the route is protected - let them view.
    if (userId && !auth.isPublicRoute) return NextResponse.next();

    // If the route is public, anyone can view it.
    if (auth.isPublicRoute) return NextResponse.next();
  },
  // Allow signed out users to access the specified routes:
  publicRoutes: ["/", "/sign-in", "/sign-up", /^\/docs(\/.*)?/],
  signInUrl: "/sign-in",
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Re-include any files in the api or trpc folders that might have an extension
    "/(api|trpc)(.*)",
  ],
};
