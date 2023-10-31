import { redirect, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { nanoid } from "~/util/nanoid";

export function routeData() {
  return createServerData$(() => redirect(`/${nanoid(10)}`));
}

export default function NewPage() {
  useRouteData();
  return <></>;
}
