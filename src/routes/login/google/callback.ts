import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { appendHeader, createError, deleteCookie, getCookie, getQuery, sendRedirect } from "vinxi/server";

import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { userTable } from "~/db/schema";
import { google } from "~/lib/auth";

export async function GET(event: APIEvent) {
  const ev = event.nativeEvent;
  const lucia = event.locals.lucia;
  const db = event.locals.db;

  const query = getQuery(ev);
  const code = query.code?.toString();
  const state = query.state?.toString();

  async function completeRedirect(userId: string) {
    const session = await lucia.createSession(userId, {});
    appendHeader(ev, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
    deleteCookie(ev, "google_oauth_state");
    deleteCookie(ev, "google_oauth_code_verifier");
    deleteCookie(ev, "redirect_to");
    return sendRedirect(ev, getCookie(ev, "redirect_to") ?? "/");
  }

  const storedState = getCookie(ev, "google_oauth_state");
  const storedCodeVerifier = getCookie(ev, "google_oauth_code_verifier");
  if (!code || !storedState || !storedCodeVerifier || state !== storedState) {
    throw createError({
      status: 400,
    });
  }

  const googleAuth = google();

  try {
    const tokens = await googleAuth.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    const user = await response.json<GoogleUser>();
    const existingUser = await db.query.users.findFirst({
      where: (users) => eq(users.email, user.email),
    });

    if (existingUser) {
      console.log("User already exists.");
      return completeRedirect(existingUser.id);
    }

    const userId = generateId(15);

    console.log("User does not exist, creating new user.");
    await db.insert(userTable).values({
      id: userId,
      email: user.email,
      name: user.name,
      role: "user",
    });

    return completeRedirect(userId);
  } catch (e) {
    if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
      // invalid code
      throw createError({
        status: 400,
      });
    }
    console.log(e);
    throw createError({
      status: 500,
    });
  }
}
interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  hd?: string;
}
