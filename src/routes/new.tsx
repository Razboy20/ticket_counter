import { nanoid } from "nanoid";
import { redirect, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";

export function routeData() {
  return createServerData$(() => redirect(`/${nanoid(10)}`));
}

export default function NewPage() {
  useRouteData();
  return <></>;
}
