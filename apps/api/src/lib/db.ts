import { ZenStackClient, type TransactionClientContract } from "@zenstackhq/orm";
import { PostgresDialect } from "@zenstackhq/orm/dialects/postgres";
import { PolicyPlugin } from "@zenstackhq/plugin-policy";
import { Pool } from "pg";
import { schema, type SchemaType } from "../../zenstack/schema";
import { zenstackAdapter } from "@zenstackhq/better-auth";

/**
 * Unscoped client: bypasses access policies. Use only for trusted server code
 * (better-auth adapter, workflow routes, sync jobs, seed). Never hand it to `/execute`.
 */
export const db = new ZenStackClient(schema, {
  log: process.env.DB_LOG_QUERIES === "true" ? ["query", "error"] : ["error"],
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

/** Policy-enforcing client. Always narrow it with `.$setAuth(ctx)` per request. */
export const authDb = db.$use(new PolicyPlugin());

export const dbAdapter = zenstackAdapter(db, {
  provider: "postgresql",
});

export type Database = typeof db;
/** Client handed to `$transaction` callbacks. */
export type DatabaseTransaction = TransactionClientContract<
  SchemaType,
  Database["$options"],
  {},
  {}
>;
/** Either the root client or a transaction client — for helpers usable in both. */
export type DbExecutor = Database | DatabaseTransaction;
export type AuthDatabase = typeof authDb;

/** Shape bound to `auth()` in schema.zmodel policies. */
export type AuthContext = {
  id: string;
  role: string | null;
  /** 無効 (better-auth ban) or ロック中 — such users are refused by the API. */
  banned: boolean;
  locked: boolean;
  /** 初期パスワード未変更 — nothing but the password change is allowed (§4.6). */
  mustChangePassword: boolean;
};
