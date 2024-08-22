import { getRequestEvent } from "solid-js/web";
import { serverEnv } from "~/env/server.js";
import type { CfPagesEnv } from "../global.d.ts";

// server-only helper function to access cloudflare environment variables
export const env = (event = getRequestEvent()): CfPagesEnv => {
  if (!event) throw new Error("env() must be called in a server context.");
  // fallback to process.env for local development
  const env = event.nativeEvent.context?.cloudflare?.env ?? serverEnv;
  return env;
};
