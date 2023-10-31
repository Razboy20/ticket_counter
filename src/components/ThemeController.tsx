import { Tooltip } from "@kobalte/core";
import type { Accessor, JSX } from "solid-js";
import { Show, createContext, createEffect, createSignal, onMount, useContext } from "solid-js";
import { css } from "solid-styled";
import { createUserTheme } from "~/util/cookie";

import MoonIcon from "~icons/heroicons/moon-20-solid";
import SunIcon from "~icons/heroicons/sun-20-solid";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Accessor<Theme>;
  updateTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export function ThemeProvider(props: { children: JSX.Element }): JSX.Element;
export function ThemeProvider(props: { children: (theme: Accessor<Theme>) => JSX.Element }): JSX.Element;
export function ThemeProvider(props: { children: JSX.Element | ((theme: Accessor<Theme>) => JSX.Element) }) {
  const [theme, updateTheme] = createUserTheme("color-theme", {
    defaultValue: "light",
  });

  const child = props.children;
  const fn = typeof child === "function" && child.length > 0;

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {fn ? child(theme) : (child as JSX.Element)}
    </ThemeContext.Provider>
  );
}

export const ThemeControllerButton = () => {
  const { theme, updateTheme } = useTheme();

  const toggleDarkMode = () => {
    updateTheme(theme() === "dark" ? "light" : "dark");
  };

  createEffect(() => {
    document.querySelector("html")?.classList.toggle("dark", theme() === "dark");
  });

  onMount(() => {
    if (theme() == undefined) {
      updateTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  });

  const [open, setOpen] = createSignal(false);

  css`
    .tooltip__content {
      transform-origin: var(--kb-tooltip-content-transform-origin);
      animation: fadeIn 0ms;
    }

    .tooltip__content[data-expanded] {
      animation: fadeIn 150ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.98);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  return (
    <Tooltip.Root onOpenChange={setOpen}>
      <Tooltip.Trigger
        onClick={toggleDarkMode}
        type="button"
        aria-label={theme() == "dark" ? "Switch to light mode" : "Switch to dark mode"}
        class="m-0 w-10 bg-neutral-200/50 p-0 text-neutral-500 outline-none dark:bg-neutral-700/50 hover:bg-neutral-300/60 dark:text-neutral-400 hover:text-neutral-800 btn dark:hover:bg-neutral-600/60 dark:hover:text-neutral-100"
      >
        <Show when={theme() == "dark"}>
          <SunIcon class="h-5 w-5" />
        </Show>
        <Show when={theme() == "light"}>
          <MoonIcon class="h-5 w-5" />
        </Show>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          class="tooltip__content z-10 border border-neutral-300 rounded-lg bg-white p-2 px-2.5 dark:(border-neutral-700 bg-neutral-700 text-neutral-100)"
          use:solid-styled
        >
          <Tooltip.Arrow />
          <p>{theme() == "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
