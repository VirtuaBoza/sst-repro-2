import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log(req.headers.get("host"));
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Re-include any files in the api or trpc folders that might have an extension
    "/(api|trpc)(.*)",
  ],
};
