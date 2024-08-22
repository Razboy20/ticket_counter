import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { redirect } from "@solidjs/router";
import { generateCodeVerifier, generateState, Google } from "arctic";
import type { drizzle } from "db0/integrations/drizzle/index";
import { Lucia } from "lucia";
import { getRequestEvent } from "solid-js/web";
import { setCookie, type HTTPEvent } from "vinxi/http";
import { sessionTable, userTable, type schema } from "~/db/schema";
import { env } from "~/util/cf";

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

export const createLuciaClient = (db: DrizzleDatabase) => {
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes(attributes) {
      return {
        name: attributes.name,
        role: attributes.role,
      };
    },
  });
};

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createLuciaClient>;
  }
}

export const google = () => {
  // todo: move into helper
  const urlInfo = new URL(getRequestEvent()!.request.url);
  const redirectUrl = `${urlInfo.origin}/login/google/callback`;

  return new Google(env().GOOGLE_CLIENT_ID, env().GOOGLE_CLIENT_SECRET, redirectUrl);
};

export function googleRedirectUrl(ev: HTTPEvent) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const scopes = ["profile", "email"];
  const url = google().createAuthorizationURL(state, codeVerifier, scopes);

  setCookie(ev, "google_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  setCookie(ev, "google_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  setCookie(ev, "redirect_to", ev.headers.get("referer") ?? "", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
  });

  return redirect(url.href);
}
