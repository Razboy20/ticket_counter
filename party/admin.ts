import type * as Party from "partykit/server";
import { AdminUpdateMessage } from "~/env/party";
import { getUserInfo, validateInternal } from "./utils/auth";
import { ok, unauthorized } from "./utils/response";

export default class AdminServer implements Party.Server {
  constructor(readonly room: Party.Room) { }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const user = await getUserInfo(request);
    // todo: validate role
    if (!user) {
      return unauthorized();
    }

    return request;
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // send the admin the room info
    const request = await this.room.context.parties.event.get(this.room.id).fetch({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Secret": this.room.env.INTERNAL_SECRET as string,
      },
    });

    conn.send(await request.text());
  }

  async onMessage(message: string) {
    const result = AdminUpdateMessage.safeParse(JSON.parse(message));
    if (!result.success) {
      return;
    }

    await this.sendToEvent(result.data);
  }

  async onRequest(req: Party.Request) {
    if (!validateInternal(req, this.room)) {
      return unauthorized();
    }

    this.room.broadcast(await req.text());

    return ok();
  }

  async sendToEvent(message: Record<string, unknown>) {
    return this.room.context.parties.event.get(this.room.id).fetch({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Secret": this.room.env.INTERNAL_SECRET as string,
      },
      body: JSON.stringify(message),
    });
  }
}

AdminServer satisfies Party.Worker;
