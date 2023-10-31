import type * as Party from "partykit/server";
import { InfoMessage, UpdateMessage } from "~/env/party";

export default class Server implements Party.Server {
  currTicket = 1;
  ticketMap = new Map<string, number>();

  constructor(readonly party: Party.Party) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    const userId = new URL(ctx.request.url).searchParams.get("user_token") ?? "";
    // if userId is not in the ticketMap, add it
    if (!this.ticketMap.has(userId)) {
      this.ticketMap.set(userId, this.currTicket);
      this.currTicket++;
    }
    // send the ticket to the client
    const infoMessage = InfoMessage.parse({
      type: "info",
      ticket: this.ticketMap.get(userId)!,
      total: this.ticketMap.size,
    });

    conn.send(JSON.stringify(infoMessage));

    const updateMessage = UpdateMessage.parse({
      type: "update",
      total: this.ticketMap.size,
    });

    this.party.broadcast(JSON.stringify(updateMessage), [conn.id]);
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id],
    );
  }
}

Server satisfies Party.Worker;
