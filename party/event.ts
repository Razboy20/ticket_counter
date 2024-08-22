import type * as Party from "partykit/server";
import type { z } from "zod";
import { AdminSyncMessage, AdminUpdateMessage, InfoMessage, ServerUpdateMessage, UserInfo } from "~/env/party";
import { getUserInfo, validateInternal } from "./utils/auth";
import { json, notFound, ok, unauthorized } from "./utils/response";

export default class EventServer implements Party.Server {
  isVerified = false;
  // todo: replace with array
  users: UserInfo[] = [];
  readonly storageIdPrefix = "user-";

  constructor(readonly room: Party.Room) { }

  getTicketNumer(userId: string) {
    const index = this.users.findIndex((u) => u.id === userId);
    return index != -1 ? index + 1 : undefined;
  }

  async addUser(userId: string, userName: string) {
    const newUser = {
      id: userId,
      name: userName,
      online: true,
      checkinTime: new Date(),
    } satisfies UserInfo;
    this.users.push(newUser);
    await this.room.storage.put("users", this.users);

    return this.users.length;
  }

  /**
   * If a user has a new id, remove the old data and replace it with a new user.
   */
  async tryMigrateUser(sessionId: string, userId: string) {
    const oldIndex = this.users.findIndex((u) => u.id === sessionId);
    const newIndex = this.users.findIndex((u) => u.id === userId);
    if (oldIndex === -1) return newIndex + 1;

    if (oldIndex < newIndex) {
      const oldCheckinTime = this.users[oldIndex].checkinTime;
      this.users[oldIndex] = this.users[newIndex];
      this.users[oldIndex].checkinTime = oldCheckinTime;
      this.users.splice(newIndex, 1);
    } else {
      this.users.splice(oldIndex, 1);
    }

    await this.room.storage.put("users", this.users);

    return Math.min(oldIndex, newIndex) + 1;
  }

  async onStart() {
    this.isVerified = (await this.room.storage.get("isVerified")) ?? false;
    this.users = (await this.room.storage.get<UserInfo[]>("users")) ?? [];

    // check that the users map schema isn't outdated
    if (!UserInfo.safeParse(this.users[0]).success) {
      this.users = [];
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
    const sessionId = new URL(ctx.request.url).searchParams.get("session_id")!;
    const userId = ctx.request.headers.get("X-User-Id")!;
    const userName = ctx.request.headers.get("X-User-Name")!;
    conn.setState({ id: userId });

    let ticketNum = this.getTicketNumer(userId);

    if (ticketNum === undefined) {
      ticketNum = await this.addUser(userId, userName);
    }
    if (sessionId != userId) ticketNum = await this.tryMigrateUser(sessionId, userId);

    const user = this.users[ticketNum - 1];

    // set the user's online status
    if (user && !user.online) {
      user.online = true;
      await this.room.storage.put("users", this.users);
    }

    // send the ticket to the client
    const infoMessage = InfoMessage.parse({
      type: "info",
      ticket: ticketNum,
      room: {
        total: this.users.length,
        verified: this.isVerified,
      },
    });

    conn.send(JSON.stringify(infoMessage));

    const updateMessage = ServerUpdateMessage.parse({
      type: "update",
      room: {
        total: this.users.length,
      },
    });

    this.room.broadcast(JSON.stringify(updateMessage), [conn.id]);
    void this.sendAdminUpdate();
  }

  onClose(conn: Party.Connection<ConnState>) {
    // update the user's online status
    const user = this.users.find((u) => u.id === conn.state?.id);
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
        total: this.users.length,
        verified: this.isVerified,
      },
      users: this.users,
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
