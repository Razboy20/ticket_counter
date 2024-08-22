import type * as Party from "partykit/server";
import type { User } from "~/db/schema";

export const getUserInfo = async (request: Party.Request): Promise<User | null> => {
  const headers = request.headers;
  const origin = headers.get("origin") ?? "";
  // const cookie = headers.get("cookie") ?? "";
  const auth_session = new URL(request.url).searchParams.get("auth_session");

  const url = `${origin}/api/auth/user`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Cookie: `auth_session=${auth_session}`,
    },
  });

  if (!response.ok || response.status === 204) {
    return null;
  }

  return await response.json<User>();
};

export const validateInternal = (request: Party.Request, room: Party.Room): boolean => {
  return request.headers.get("X-Secret") === room.env.INTERNAL_SECRET;
};
