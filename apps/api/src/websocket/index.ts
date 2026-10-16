import { authMacro } from "@/plugins/auth";
import Elysia, { t } from "elysia";

export const webSocketPlugin = () => new Elysia()
    .use(authMacro)
    .ws("/ws", {
        body: t.String(),
        response: t.String(),
        auth: true,
        message(ws, message) {
            if (String(message).toLowerCase() === 'ping') {
                ws.send('PONG')
            } else {
                ws.send(message);
            }
        },
    })