import { mount, StartClient } from "solid-start/entry-client";

if (import.meta.env.DEV) {
  await import("solid-devtools");
}

mount(() => <StartClient />, document);
