import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getEnv } from "./env";

export function getDb() {
  const { DATABASE_URL } = getEnv();
  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof getDb>;
