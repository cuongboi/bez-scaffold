import { Elysia, t, file } from "elysia";
import { cors } from "@elysia/cors";
import { env } from "@/env";
import { openapi } from "@elysia/openapi";
import { executeRoute } from "./routes/execute";
import * as pkg from "../package.json";
import { betterAuthPlugin, BetterAuthOpenApi } from "./plugins/auth";
import { toErrorResponse } from "./lib/errors";
import { staticPlugin } from "@elysia/static";
import path from "node:path";
import { webSocketPlugin } from "./websocket";
import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({ description: 'Process some integers.' })
parser.add_argument('-p', '--port', { help: 'Port to listen on', default: 3000 })
parser.add_argument('-H', '--host', { help: 'Host to listen on', default: 'localhost' })
const args = parser.parse_args()

const app = new Elysia()
  .use(
    cors({
      origin: env.WEB_ORIGIN.split(","),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["set-auth-jwt", "set-auth-token"],
    }),
  )
  .onError(({ code, error, set }) => {
    // Elysia validation errors keep their own 422 body; everything else gets the envelope.
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: { message: error.message, code: "INVALID_INPUT" } };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: { message: "Not found", code: "NOT_FOUND" } };
    }

    const { status, body } = toErrorResponse(error);
    set.status = status;
    return body;
  })
  .use(
    openapi({
      documentation: {
        info: { title: pkg.name, description: pkg.description, version: pkg.version },
        paths: (await BetterAuthOpenApi.paths()) as never,
        components: (await BetterAuthOpenApi.components()) as never,
      },
      scalar: { hideModels: true },
    }),
  )
  .get("/health", () => ({ ok: true }))
  .use(betterAuthPlugin)
  .use(executeRoute)
  .use(
    staticPlugin({
      assets: path.join(import.meta.dir, "public"),
      prefix: "/*",
      indexHTML: true,
    }),
  )
  .use(webSocketPlugin())
  .listen({
    port: args.port,
    hostname: args.host,
  });

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
