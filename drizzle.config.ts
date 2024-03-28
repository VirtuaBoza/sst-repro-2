import type { Config } from "drizzle-kit";
import { Resource } from "sst";

export default {
  schema: "./packages/core/src/sql/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: Resource.NeonDatabaseUrl.value,
  },
} satisfies Config;
