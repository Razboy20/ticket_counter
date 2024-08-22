import { createMiddleware } from "@solidjs/start/middleware";
import Database from "better-sqlite3";
import { verifyRequestOrigin } from "lucia";
import { appendHeader, getCookie, getHeader } from "vinxi/http";
import { schema } from "./db/schema";
import { createLuciaClient, type DrizzleDatabase } from "./lib/auth";
import { env } from "./util/cf";

export default createMiddleware({
  onRequest: async (event) => {
    const ev = event.nativeEvent;

    // add Drizzle client to locals
    // const database = useDatabase();
    // console.log(schema);
    // const client = drizzle(database, schema);
    // const drizzle = (
    //   (await import(`drizzle-orm/${process.env.NODE_ENV != "production" ? "better-sqlite3" : "d1"}`)) as
    //   | typeof import("drizzle-orm/better-sqlite3")
    //   | typeof import("drizzle-orm/d1")
    // ).drizzle;

    let client;

    if (process.env.NODE_ENV === "production") {
      const drizzle = (await import("drizzle-orm/d1")).drizzle;
      client = drizzle(env(event).DB, { schema });
    } else {
      const drizzle = (await import("drizzle-orm/better-sqlite3")).drizzle;
      client = drizzle(new Database("sqlite.db"), { schema });
    }

    // eslint-disable-next-line
    // @ts-ignore
    event.locals.db = client;

    // Lucia auth
    if (ev.node.req.method !== "GET") {
      const originHeader = getHeader(ev, "Origin") ?? null;
      const hostHeader = getHeader(ev, "Host") ?? null;
      if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
        ev.node.res.writeHead(403).end();
        return;
      }
    }

    const lucia = (event.locals.lucia = createLuciaClient(event.locals.db));

    const sessionId = getCookie(ev, lucia.sessionCookieName) ?? null;
    if (!sessionId) {
      ev.context.session = null;
      ev.context.user = null;
      return;
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      appendHeader(ev, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
    }
    if (!session) {
      appendHeader(ev, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
    }
    ev.context.session = session;
    ev.context.user = user;
  },
});

// Extend locals type
declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    db: DrizzleDatabase;
    lucia: ReturnType<typeof createLuciaClient>;
  }
}
