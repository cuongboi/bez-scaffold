import { Elysia, t } from "elysia";
import { authMacro } from "../plugins/auth";

type OperationFn = (args: Record<string, unknown>) => Promise<unknown>;

/**
 * Generic Prisma-style query endpoint. Safe only because of the three layers, in order:
 *   1. `auth: true`   → authenticated, non-banned user
 *   2. guardExecute() → model/operator/field allowlist + query cost bounds
 *   3. userDb         → ZenStack policies scoped to that user via `$setAuth`
 */
export const executeRoute = new Elysia({ name: "routes.execute" }).use(authMacro).post(
  "/api/execute",
  async ({ body, userDb }) => {
    const { model, operator, args } = body;
    // Indexing is safe: `model` and `operator` passed the explicit allowlists above.
    const delegate = (userDb as unknown as Record<string, Record<string, OperationFn>>)[model]!;
    const data = await delegate[operator]!(args);
    return { data: data ?? null };
  },
  {
    auth: true,
    body: t.Object({
      model: t.String({ minLength: 1, maxLength: 64 }),
      operator: t.String({ minLength: 1, maxLength: 32 }),
      args: t.Record(t.String(), t.Any(), { default: {} }),
    }),
    detail: {
      tags: ["Data"],
      summary: "Run an allowlisted ORM operation under the caller's access policies",
    },
  },
);
