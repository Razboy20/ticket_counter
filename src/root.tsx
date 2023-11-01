// @refresh reload
import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";

import { Toast } from "@kobalte/core";
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Link, Meta, Routes, Scripts, Title } from "solid-start";
import { ThemeControllerButton, ThemeProvider } from "./components/ThemeController";

import logo from "~/assets/img/logo.svg";
import { QRCodeButton } from "./components/QRCodeButton";

export default function Root() {
  return (
    <ThemeProvider>
      {(theme) => (
        <Html lang="en" class="h-full font-sans" classList={{ dark: theme() === "dark" }}>
          <Head>
            <Title>Ticket Counter</Title>
            <Meta charset="utf-8" />
            <Meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta name="theme-color" content="#2463eb" />
            <Meta
              name="description"
              content="Ticket Counter: An easy to use ticket counter/caller, made for student organizations."
            />
            <Link rel="icon" type="image/svg+xml" href={logo} />
          </Head>
          <Body class="h-full w-full bg-neutral-50 transition-colors duration-100 dark:bg-neutral-900">
            <Suspense>
              <ErrorBoundary>
                <div class="absolute right-0 top-0 p-4 flex items-center gap-2">
                  <QRCodeButton link={location.href}></QRCodeButton>
                  <ThemeControllerButton />
                </div>
                <Routes>
                  <FileRoutes />
                </Routes>
                <Toast.Region>
                  <Toast.List class="fixed bottom-0 right-0 z-9999 max-w-full w-100 flex flex-col gap-2 p-4 outline-none" />
                </Toast.Region>
              </ErrorBoundary>
            </Suspense>
            <Scripts />
          </Body>
        </Html>
      )}
    </ThemeProvider>
  );
}
