import * as schema from "./schema";
import { AnyColumn, SQLWrapper, sql } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { Resource } from "sst";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
export * from "./mapping";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: Resource.NeonDatabaseUrl.value,
});

export const db = drizzle(pool, {
  schema,
});

export { schema };

export function cosineDistance(
  column: SQLWrapper | AnyColumn,
  value: number[]
) {
  return sql`${column} <=> ${toSql(value)}`;
}

function toSql(value: number[]): string {
  return JSON.stringify(value);
}
