import type { Request as CfRequest, D1Database, ExecutionContext } from "@cloudflare/workers-types";
import type { Session, User } from "lucia";

/**
 * Reference: https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#parameters
 */
export interface CfPagesEnv {
  ASSETS: { fetch: (request: CfRequest) => Promise<Response> };
  CF_PAGES: "1";
  CF_PAGES_BRANCH: string;
  CF_PAGES_COMMIT_SHA: string;
  CF_PAGES_URL: string;

  // Environment variables
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  INTERNAL_SECRET: string;

  // Bindings
  DB: D1Database;
}

declare module "vinxi/http" {
  interface H3EventContext {
    user: User | null;
    session: Session | null;
    cf: CfRequest["cf"];
    cloudflare: {
      request: CfRequest;
      env: CfPagesEnv;
      context: ExecutionContext;
    };
  }
}
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  name: string;
  role: "admin" | "user";
}
