import { Perm, roleCan } from "@/lib/permissions";
import { TRPCError, initTRPC } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@stacks-ils-ion/core/sql";
import { z } from "zod";
import superjson from "superjson";

export interface ContextUser {
  id: string;
  libraryRoles: Record<string, schema.OrgRole>;
}

export type TRPCContext = {
  user: ContextUser | null;
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use((opts) => {
  const { user } = opts.ctx;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return opts.next({ ctx: { user } });
});

export const libraryProtectedProcedure = protectedProcedure
  .input(
    z.object({
      libraryId: z.string(),
    })
  )
  .use(async (opts) => {
    const library = (
      await db
        .select({
          id: schema.libraries.id,
          name: schema.libraries.name,
          organization: {
            id: schema.organizations.id,
            name: schema.organizations.name,
          },
          organizationId: schema.libraries.organizationId,
        })
        .from(schema.libraries)
        .innerJoin(
          schema.organizations,
          eq(schema.libraries.organizationId, schema.organizations.id)
        )
        .innerJoin(
          schema.organizationUsers,
          eq(schema.organizations.id, schema.organizationUsers.organizationId)
        )
        .where(
          and(
            eq(schema.libraries.id, opts.input.libraryId),
            eq(schema.organizationUsers.userId, opts.ctx.user.id)
          )
        )
    )[0];

    if (!library) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Library not found",
      });
    }

    return opts.next({ ctx: { ...opts.ctx, library } });
  });

export function roleProtectedProcedure(perm: Perm) {
  return libraryProtectedProcedure.use(async ({ ctx, input, next }) => {
    if (!roleCan(ctx.user.libraryRoles[input.libraryId], perm)) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    return next();
  });
}
