import { initBotId } from "botid/client/core";

// Vercel BotID: the browser passes an invisible check when it sends the early-access
// form, which the route then reads (src/lib/guard.ts). Skipped in development.
initBotId({ protect: [{ path: "/api/early-access", method: "POST" }] });
