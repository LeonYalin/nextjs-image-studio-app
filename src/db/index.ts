import { createClient, Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "file:local.db";

declare global {
  // eslint-disable-next-line no-var
  var __libsql_client: Client | undefined;
}

// In development, HMR re-evaluates this module on every file change but
// globalThis persists for the lifetime of the Node process. Reusing the
// same client prevents thousands of dangling connections from accumulating.
const client =
  process.env.NODE_ENV === "development"
    ? (globalThis.__libsql_client ??= createClient({ url }))
    : createClient({ url });

export const db = drizzle(client, { schema });
