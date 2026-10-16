/** Validated process environment. Fails fast at boot instead of at first use. */

export const read = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable ${key} (see .env.example)`);
};

export const oneOf = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const value = read(key, fallback);
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`${key} must be one of ${allowed.join(", ")} (got "${value}")`);
  }
  return value as T;
};

export const nonNegativeInt = (key: string, fallback: number): number => {
  const value = Number(read(key, String(fallback)));
  if (!Number.isInteger(value) || value < 0)
    throw new Error(`${key} must be a non-negative integer`);
  return value;
};

export const env = {
  DATABASE_URL: read("DATABASE_URL"),
  BETTER_AUTH_SECRET: read("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: read("BETTER_AUTH_URL", "http://localhost:3000"),
  WEB_ORIGIN: read("WEB_ORIGIN", "http://localhost:5173"),
  BETTER_AUTH_BASE_PATH: read("BETTER_AUTH_BASE_PATH", "/api/auth"),
} as const;

export type Env = typeof env;
