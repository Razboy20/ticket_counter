import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import PartySocket from "partysocket";
import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import type { z } from "zod";
import { FastSpinner } from "~/components/Spinner";
import { clientEnv } from "~/env/client";
import { ServerMessage, type RoomInfo } from "~/env/party";
import { getAuthSessionId$, getSessionId$ } from "~/util/auth";
import { showToast } from "~/util/toaster";
import TicketIcon from "~icons/heroicons/ticket";

type PageParams = {
  event_id: string;
};

export const route = {
  load: () => (getSessionId$(), getAuthSessionId$()),
} satisfies RouteDefinition;

export default function TicketPage() {
  const params = useParams<PageParams>();
  const getSessionId = createAsync(() => getSessionId$());
  const getAuthSession = createAsync(() => getAuthSessionId$());

  const [ticketNum, setTicketNum] = createSignal<number>(-1);

  const [roomInfo, setRoomInfo] = createStore<z.infer<typeof RoomInfo>>({ total: -1, verified: false });

  createEffect(() => {
    const partySocket = new PartySocket({
      host: import.meta.env.DEV ? "localhost:1999" : clientEnv.VITE_PARTY_SOCKET,
      party: "event",
      room: params.event_id,
      query: {
        session_id: getSessionId(),
        auth_session: getAuthSession(),
      },
    });
    partySocket.addEventListener("message", (msg: { data: string }) => {
      const result = ServerMessage.safeParse(JSON.parse(msg.data));
      if (!result.success) return;
      switch (result.data.type) {
        case "info":
          setTicketNum(result.data.ticket);
          setRoomInfo(result.data.room);
          break;
        case "update":
          setRoomInfo(reconcile({ ...roomInfo, ...result.data.room }));
          break;
      }
    });

    partySocket.addEventListener("close", () => {
      showToast({
        title: "Connection interrupted",
        description: "",
      });
    });

    onCleanup(() => {
      partySocket.close();
    });
  });

  return (
    <main class="h-full w-full flex items-center justify-center text-neutral-900 dark:text-neutral-100">
      <div class="flex flex-row items-center space-x-6">
        <TicketIcon class="inline-block h-20 w-20 text-primary-600 dark:text-primary-500" />
        <Show
          when={ticketNum() != -1 && roomInfo.total != -1}
          fallback={<FastSpinner show class="h-15 w-15 text-neutral-600 dark:text-neutral-400" />}
        >
          <h1 class="text-9xl font-bold">
            {ticketNum()}
            <span class="text-2xl text-neutral-600 dark:text-neutral-400">/ {roomInfo.total}</span>
          </h1>
        </Show>
      </div>
    </main>
  );
}
