import { db, pool } from "@stacks-ils-ion/core/sql";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

await pool.end();

console.log("Migrations complete!");
