import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@stacks-ils-ion/core/sql";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const library = (
    await db
      .select({
        id: schema.libraries.id,
      })
      .from(schema.libraries)
      .innerJoin(
        schema.organizations,
        eq(schema.libraries.organizationId, schema.organizations.id)
      )
      .innerJoin(
        schema.organizationUsers,
        eq(schema.organizationUsers.organizationId, schema.organizations.id)
      )
      .where(eq(schema.organizationUsers.userId, session.user.id))
  )[0];

  if (library) {
    return NextResponse.redirect(
      new URL(`/${library.id}/dashboard`, request.url)
    );
  }
  return NextResponse.redirect(new URL(`/onboard`, request.url));
}
