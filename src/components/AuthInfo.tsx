import { action, cache, createAsync, revalidate, useAction, type RouteDefinition } from "@solidjs/router";
import { createSignal, Show, Suspense, type VoidComponent } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { deleteCookie } from "vinxi/http";
import { googleRedirectUrl } from "~/lib/auth";
import { FastSpinner } from "./Spinner";

// eslint-disable-next-line @typescript-eslint/require-await
const redirectAction$ = action(async () => {
  "use server";
  return googleRedirectUrl(getRequestEvent()!.nativeEvent);
});

const logoutAction$ = action(async () => {
  "use server";
  console.log("Logging user out...");
  const event = getRequestEvent()!;
  const lucia = event.locals.lucia;
  const session = event.nativeEvent.context.session;

  if (session) {
    await lucia.invalidateSession(session.id);
    event.nativeEvent.context.session = null;
    event.nativeEvent.context.user = null;

    // regenerate the fingerprint
    deleteCookie(event.nativeEvent, "session_id");
    // todo: fix single-flight revalidation
    // void revalidate("sessionId");
    // void revalidate("authSessionId");

    console.log("Session invalidated.");

    void revalidate("auth-data");
    return true;
  }

  return false;
});

const GoogleLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.98em"
    height="1em"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 256 262"
    class="h-5 w-5"
  >
    <path
      fill="#4285F4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    />
    <path
      fill="#34A853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    />
    <path
      fill="#FBBC05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
    />
    <path
      fill="#EB4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    />
  </svg>
);

export const GLoginButton: VoidComponent = (props) => {
  const [loading, setLoading] = createSignal(false);
  const redirectGoogle = useAction(redirectAction$);

  return (
    // no-js signin
    <form action="/login/google" onSubmit={(e) => e.preventDefault()}>
      <button
        class="gap-2 border border-blue-500 bg-white p-3 text-gray-800 font-bold active:border-sky-500 hover:border-sky-500 active:bg-sky-50/70 disabled:bg-gray-50 disabled:text-gray-700 hover:text-gray-900 btn disabled:border-gray-400!"
        disabled={loading()}
        type="submit"
        onClick={async (e) => {
          setLoading(true);
          e.preventDefault();
          try {
            await redirectGoogle();
          } catch (e) {
            location.href = "/login/google";
            console.error(e);
          }
        }}
      >
        <Show when={!loading()}>
          <GoogleLogo />
        </Show>
        <FastSpinner class="h-5 w-5 text-[#4285F4]" show={loading()} />
        Login via Google
      </button>
    </form>
  );
};

export const LogoutButton: VoidComponent = () => {
  return (
    <form action={logoutAction$} method="post">
      <button
        class="bg-neutral-200 bg-opacity-0 text-neutral-500 duration-50 dark:bg-neutral-700 dark:bg-opacity-0 hover:bg-opacity-50 hover:text-sky-500 hover:underline btn hover:dark:text-sky-400"
        type="submit"
      >
        Logout
      </button>
    </form>
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
const authData$ = cache(async () => {
  "use server";
  console.log("reacquiring auth data...");
  const event = getRequestEvent()!;
  const user = event.nativeEvent.context.user;

  return user;
}, "auth-data");

export const route = {
  preload: () => authData$(),
} satisfies RouteDefinition;

export const AuthInfo: VoidComponent = () => {
  const session = createAsync(() => authData$(), {
    deferStream: true,
  });

  return (
    <Suspense>
      <Show when={session()} fallback={<GLoginButton />}>
        <LogoutButton />
      </Show>
    </Suspense>
  );
};
