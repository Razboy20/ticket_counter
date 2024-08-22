import { cache } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { getCookie, setCookie } from "vinxi/http";
import { nanoid } from "./nanoid";

// eslint-disable-next-line @typescript-eslint/require-await
export const getUserData$ = cache(async () => {
  "use server";
  const req = getRequestEvent();
  if (!req) return null;

  const user = req.nativeEvent.context.user;

  return user;
}, "userData");

// not authentication data, but rather for websocket fingerprinting
// eslint-disable-next-line @typescript-eslint/require-await
export const getSessionId$ = cache(async () => {
  "use server";
  const req = getRequestEvent();
  if (!req) throw new Error("Server-only function called in a non-server context.");

  let sessionId = getCookie(req.nativeEvent, "session_id");
  if (!sessionId) {
    sessionId = nanoid();
    setCookie(req.nativeEvent, "session_id", sessionId, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return sessionId;
}, "sessionId");

// eslint-disable-next-line @typescript-eslint/require-await
export const getAuthSessionId$ = cache(async () => {
  "use server";
  const req = getRequestEvent();
  if (!req) throw new Error("Server-only function called in a non-server context.");

  return getCookie(req.nativeEvent, "auth_session");
}, "authSessionId");
