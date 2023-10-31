import { nanoid } from "nanoid";
import PartySocket from "partysocket";
import { Show, createSignal, onMount } from "solid-js";
import type { RouteDataArgs } from "solid-start";
import { parseCookie, useParams, useRouteData } from "solid-start";
import { createServerData$, useRequest } from "solid-start/server";
import { FastSpinner } from "~/components/Spinner";
import { clientEnv } from "~/env/client";
import { Message } from "~/env/party";
import { showToast } from "~/util/toaster";
import TicketIcon from "~icons/heroicons/ticket";

type PageParams = {
  event_id: string;
};

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    (_, event) => {
      const req = useRequest();

      if (!req.request) return;

      const userToken = parseCookie(req.request.headers.get("cookie") ?? "").user_token;
      if (!userToken) {
        const newToken = nanoid(10);
        req.responseHeaders.set("Set-Cookie", `user_token=${newToken}`);
        return newToken;
      }

      return userToken;
    },
    {
      deferStream: true,
    },
  );
}

export default function TicketPage() {
  const params = useParams<PageParams>();
  const getUserToken = useRouteData<typeof routeData>();

  const [ticketNum, setTicketNum] = createSignal<number>(-1);
  const [total, setTotal] = createSignal<number>(-1);

  onMount(() => {
    const partySocket = new PartySocket({
      host: import.meta.env.DEV ? "localhost:1999" : clientEnv.PARTY_SOCKET,
      room: params.event_id,
      query: {
        user_token: getUserToken(),
      },
    });
    partySocket.addEventListener("message", (msg: { data: string }) => {
      const result = Message.safeParse(JSON.parse(msg.data));
      if (!result.success) return;
      switch (result.data.type) {
        case "info":
          setTicketNum(result.data.ticket);
          setTotal(result.data.total);
          break;
        case "update":
          setTotal(result.data.total);
          break;
      }
    });

    partySocket.addEventListener("close", () => {
      showToast({
        title: "Connection interrupted",
        description: "",
      });
    });
  });

  return (
    <main class="h-full w-full flex items-center justify-center text-neutral-900 dark:text-neutral-100">
      <div class="flex flex-row items-center space-x-6">
        <TicketIcon class="inline-block h-20 w-20 text-primary-600 dark:text-primary-500" />
        <Show
          when={ticketNum() != -1 && total() != -1}
          fallback={<FastSpinner show class="h-15 w-15 text-neutral-600 dark:text-neutral-400" />}
        >
          <h1 class="text-9xl font-bold">
            {ticketNum()}
            <span class="text-2xl text-neutral-600 dark:text-neutral-400">/ {total()}</span>
          </h1>
        </Show>
      </div>
    </main>
  );
}
