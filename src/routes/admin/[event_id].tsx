import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import PartySocket from "partysocket";
import { For, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import type { z } from "zod";
import { FastSpinner } from "~/components/Spinner";
import { Tooltip } from "~/components/Tooltip";
import { clientEnv } from "~/env/client";
import { AdminServerMessage, type AdminUpdateMessage, type RoomInfo, type UserInfo } from "~/env/party";
import { getAuthSessionId$, getUserData$ } from "~/util/auth";
import { showToast } from "~/util/toaster";

import CheckIcon from "~icons/heroicons/check-16-solid";

type PageParams = {
  event_id: string;
};

// todo: replace with auth credentials
export const route = {
  load: () => (getUserData$(), getAuthSessionId$()),
} satisfies RouteDefinition;

export default function TicketAdminPage() {
  const params = useParams<PageParams>();
  const [roomInfo, setRoomInfo] = createStore<z.infer<typeof RoomInfo>>({ total: -1, verified: false });
  const [users, setUsers] = createStore<z.infer<typeof UserInfo>[]>([]);
  const [socket, setSocket] = createSignal<PartySocket | null>(null);

  const getAuthSession = createAsync(() => getAuthSessionId$());

  createEffect(() => {
    const partySocket = new PartySocket({
      host: import.meta.env.DEV ? "localhost:1999" : clientEnv.VITE_PARTY_SOCKET,
      party: "admin",
      room: params.event_id,
      query: {
        auth_session: getAuthSession(),
      },
    });
    partySocket.addEventListener("message", (msg: { data: string }) => {
      const result = AdminServerMessage.safeParse(JSON.parse(msg.data));
      console.log(result, msg.data);
      if (!result.success) return;
      switch (result.data.type) {
        case "admin_sync":
          setRoomInfo(result.data.room);
          setUsers(result.data.users);
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

    setSocket(partySocket);

    onCleanup(() => {
      partySocket.close();
      setSocket(null);
    });
  });

  createEffect(() => {
    console.log(roomInfo.total);
  });

  return (
    <main class="h-full w-full flex items-center justify-center text-neutral-900 dark:text-neutral-100">
      <div class="flex flex-col items-center space-x-6">
        <Show
          when={roomInfo.total != -1}
          fallback={<FastSpinner show class="h-15 w-15 text-neutral-600 dark:text-neutral-400" />}
        >
          <h1 class="mb-6 text-4xl font-bold">
            Admin Panel{" "}
            <Show when={roomInfo.verified}>
              <CheckIcon class="mb-1 inline h-1em w-1em" />
            </Show>
          </h1>
          <h2 class="text-xl">Users:</h2>
          <ul>
            <For each={users}>
              {(user) => (
                <li class="text-xl text-neutral-600 dark:text-neutral-400">
                  {user.ticket}:{" "}
                  <Tooltip
                    as="span"
                    placement="right"
                    tooltipText={`Checked in at ${user.checkinTime.toLocaleString()}`}
                  >
                    <span classList={{ "text-neutral-900 dark:text-neutral-100": user.online }}>{user.name}</span>
                    <Show when={user.online}>
                      <span class="mb-[1px] ml-2 inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                    </Show>
                  </Tooltip>
                </li>
              )}
            </For>
          </ul>
          <button
            class="mt-4 bg-neutral-200/50 outline-none dark:bg-neutral-700/50 hover:bg-neutral-300/60 hover:text-neutral-800 btn dark:hover:bg-neutral-600/60 dark:hover:text-neutral-100"
            disabled={roomInfo.verified}
            onClick={() => {
              socket()?.send(
                JSON.stringify({
                  type: "update",
                  room: {
                    verified: true,
                  },
                } as z.infer<typeof AdminUpdateMessage>),
              );
            }}
          >
            {roomInfo.verified ? "Room already verified" : "Verify room"}
          </button>
        </Show>
      </div>
    </main>
  );
}
