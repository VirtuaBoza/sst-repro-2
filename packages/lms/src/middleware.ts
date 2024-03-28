import { LAST_SEEN } from "./lib/constants";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  lastSeenSchema,
  layoutPages,
  parseLastSeenCookieValue,
} from "./lib/utils";
import { z } from "zod";
import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await auth();

  // if user is signed in...
  if (session?.user?.id) {
    // ...and the current path is /sign-in...
    if (req.nextUrl.pathname === "/sign-in") {
      // ...redirect to the home page
      return NextResponse.redirect(new URL("/", req.url));
    } else {
      const pathParts = req.nextUrl.pathname.split("/").splice(1);
      const [libraryId, layout, page, ...rest] = pathParts;
      if (
        libraryId &&
        isLayout(layout) &&
        isLayoutPage(layout, page) &&
        !rest.length
      ) {
        const lastSeenCookieVal = parseLastSeenCookieValue(
          req.cookies.get(LAST_SEEN)?.value
        );

        const query = req.nextUrl.searchParams.has(LAST_SEEN)
          ? lastSeenCookieVal[libraryId]?.[layout]?.queries[page as never] ||
            "?"
          : req.nextUrl.search;

        res.cookies.set(
          LAST_SEEN,
          JSON.stringify({
            ...lastSeenCookieVal,
            [libraryId]: {
              ...lastSeenCookieVal[libraryId],
              [layout]: {
                page,
                queries: {
                  ...(lastSeenCookieVal[libraryId] as any)?.[layout]?.queries,
                  [page]: query,
                },
              },
            },
          } as z.infer<typeof lastSeenSchema>)
        );

        if (req.nextUrl.searchParams.has(LAST_SEEN)) {
          return NextResponse.redirect(new URL(query, req.url));
        }
      }

      return res;
    }
  }

  // if user is not signed in and the current path is not /sign-in redirect the user to /sign-in
  if (
    !session?.user?.id &&
    !(
      req.nextUrl.pathname.startsWith("/api") ||
      req.nextUrl.pathname === "/sign-in" ||
      /^\/organization\/\w+\/accept-invite\/\w+/i.test(req.nextUrl.pathname)
    )
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

function isLayout(
  layout: string | undefined
): layout is keyof typeof layoutPages {
  if (!layout) return false;
  return Object.keys(layoutPages).includes(layout);
}

function isLayoutPage<T extends keyof typeof layoutPages>(
  layout: T,
  page: string | undefined
): page is (typeof layoutPages)[T][number] {
  if (!page) return false;
  return layoutPages[layout].includes(page as never);
}
