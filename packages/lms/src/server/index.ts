import { ContextUser, createCallerFactory } from "./trpc";
import { db, schema } from "@stacks-ils-ion/core/sql";
import { eq } from "drizzle-orm";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { rootRouter } from "./routers/_root";
import { userOrRedirect } from "@/lib/auth";

export function getContextUser(userId: string) {
  return db
    .select({
      libraryId: schema.libraries.id,
      role: schema.organizationUsers.role,
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
    .where(eq(schema.organizationUsers.userId, userId))
    .then((results) => {
      return {
        id: userId,
        libraryRoles: Object.fromEntries(
          results.map((res) => [res.libraryId, res.role])
        ),
      } satisfies ContextUser;
    });
}

const createCaller = createCallerFactory(rootRouter);
export const createRSCCaller = async () => {
  const user = await userOrRedirect();
  const contextUser = await getContextUser(user.id);

  return createCaller({
    user: contextUser,
  });
};
export type TRPCRouter = typeof rootRouter;
export type RouterOutput = inferRouterOutputs<TRPCRouter>;
export type RouterInput = inferRouterInputs<TRPCRouter>;
