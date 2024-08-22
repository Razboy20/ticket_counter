import type * as Party from "partykit/server";
import type { z } from "zod";
import { AdminSyncMessage, AdminUpdateMessage, InfoMessage, ServerUpdateMessage, UserInfo } from "~/env/party";
import { getUserInfo, validateInternal } from "./utils/auth";
import { json, notFound, ok, unauthorized } from "./utils/response";

export default class EventServer implements Party.Server {
  currTicket = 0;
  isVerified = false;
  users!: Map<string, UserInfo>;
  readonly storageIdPrefix = "user-";

  constructor(readonly room: Party.Room) { }

  async getTicketNumer(userId: string, userName: string) {
    if (!this.users) {
      const storedUsers = await this.room.storage.get<Map<string, UserInfo>>("users");
      this.users = storedUsers ?? new Map<string, UserInfo>();
    }

    let user = this.users.get(userId);
    if (user == undefined) {
      user = {
        name: userName,
        online: true,
        ticket: ++this.currTicket,
        checkinTime: new Date(),
      };
      this.users.set(userId, user);
      await this.room.storage.put("currTicket", this.currTicket);
      await this.room.storage.put("users", this.users);
    }

    return user.ticket;
  }

  async onStart() {
    this.currTicket = (await this.room.storage.get("currTicket")) ?? 0;
    this.isVerified = (await this.room.storage.get("isVerified")) ?? false;
    this.users = (await this.room.storage.get<Map<string, UserInfo>>("users")) ?? new Map<string, UserInfo>();

    // check that the users map schema isn't outdated
    if (!UserInfo.safeParse(this.users.values().next().value).success) {
      this.currTicket = 0;
      this.users = new Map<string, UserInfo>();
      await this.room.storage.put("currTicket", this.currTicket);
      await this.room.storage.put("users", this.users);
    }
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const sessionId = new URL(request.url).searchParams.get("session_id");
    const userInfo = await getUserInfo(request);

    if (userInfo) {
      request.headers.set("X-User-Id", userInfo.id);
      request.headers.set("X-User-Name", userInfo.name);
    } else {
      request.headers.set("X-User-Id", sessionId ?? "");
      request.headers.set("X-User-Name", "Anonymous");
    }

    return request;
  }

  async onConnect(conn: Party.Connection<ConnState>, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    const userId = ctx.request.headers.get("X-User-Id")!;
    const userName = ctx.request.headers.get("X-User-Name")!;
    // if userId is not in the ticketMap, add it
    const ticketNum = await this.getTicketNumer(userId, userName);
    conn.setState({ id: userId });

    // set the user's online status
    const user = this.users.get(userId);
    if (user && !user.online) {
      user.online = true;
      await this.room.storage.put("users", this.users);
    }

    // send the ticket to the client
    const infoMessage = InfoMessage.parse({
      type: "info",
      ticket: ticketNum,
      room: {
        total: this.currTicket,
        verified: this.isVerified,
      },
    });

    conn.send(JSON.stringify(infoMessage));

    const updateMessage = ServerUpdateMessage.parse({
      type: "update",
      room: {
        total: this.currTicket,
      },
    });

    this.room.broadcast(JSON.stringify(updateMessage), [conn.id]);
    void this.sendAdminUpdate();
  }

  onClose(conn: Party.Connection<ConnState>) {
    // update the user's online status
    const user = this.users.get(conn.state!.id);
    // check if the user has multiple connections
    const otherClient = Array.from(this.room.getConnections<ConnState>()).some(
      (c) => c.state?.id === conn.state?.id && c.id !== conn.id,
    );

    if (user && !otherClient) {
      user.online = false;
      void this.room.storage.put("users", this.users);
    }

    void this.sendAdminUpdate();
  }

  getAdminInfo() {
    return AdminSyncMessage.parse({
      type: "admin_sync",
      room: {
        total: this.currTicket,
        verified: this.isVerified,
      },
      users: Array.from(this.users.values()).sort((a, b) => a.ticket - b.ticket),
    });
  }

  sendAdminUpdate() {
    return this.room.context.parties.admin.get(this.room.id).fetch({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Secret": this.room.env.INTERNAL_SECRET as string,
      },
      body: JSON.stringify(this.getAdminInfo()),
    });
  }

  async onRequest(req: Party.Request) {
    if (!validateInternal(req, this.room)) {
      return unauthorized();
    }

    switch (req.method) {
      case "POST": {
        const result = AdminUpdateMessage.safeParse(await req.json());

        if (!result.success) {
          return notFound();
        }

        const newInfo = result.data.room;
        if (newInfo.verified !== undefined) {
          this.isVerified = newInfo.verified;
          await this.room.storage.put("isVerified", this.isVerified);
        }
        // todo: add name change handling

        this.room.broadcast(JSON.stringify(result.data));
        await this.sendAdminUpdate();

        return ok();
      }
      case "GET":
        return json(this.getAdminInfo());
      default:
        return notFound();
    }
  }
}

EventServer satisfies Party.Worker;

type ConnState = {
  id: string;
};

type UserInfo = z.infer<typeof UserInfo>;
