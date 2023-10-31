import presetUno from "@unocss/preset-uno";
import presetWebFonts from "@unocss/preset-web-fonts";
import transformerDirectives from "@unocss/transformer-directives";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import { defineConfig, presetTypography } from "unocss";
import { presetKobalte } from "unocss-preset-primitives";
import { theme } from "unocss/preset-mini";

export default defineConfig({
  rules: [
    [
      "btn-transition",
      { transition: "color 180ms, border-color 150ms, background-color 150ms, box-shadow 150ms, transform 50ms" },
    ],
    [
      "ring-offset-0",
      {
        "--un-ring-offset-width": "0px",
      },
    ],
  ],
  shortcuts: {
    btn: `
      btn-transition inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-transparent px-3 font-medium disabled:cursor-not-allowed disabled:opacity-70
      outline-none ring-blue-500/50 dark:ring-blue-400/60 ring-0 focus-visible:ring-4
      active:scale-[0.96] disabled:active:scale-100
      `,
    focusable: "outline-none ring-blue-500/50 dark:ring-blue-400/60 ring-0 focus-visible:ring-4",
    "focusable-form":
      "focusable focus-visible:ring-3 ring-offset-3 ring-offset-neutral-100 dark:ring-offset-neutral-800 hover:border-neutral-500 hover:dark:border-neutral-500 transition-colors duration-100",
    link: "relative text-cyan-500 transition-all after:(content-empty pointer-events-none absolute inset-x-0.5 bottom-0 h-px translate-y-0.5 rounded-full bg-current opacity-0 transition-all duration-100 ease-in-out-expo) hover:after:(inset-x-0 translate-y-0 opacity-100)",
  },
  theme: {
    easing: {
      "in-out-expo": "cubic-bezier(.46, 0, .21, 1)",
      "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
    },
    colors: {
      neutral: theme.colors.zinc,
      primary: theme.colors.blue,
      secondary: theme.colors.green,
      error: theme.colors.red,
      warning: theme.colors.yellow,
      success: theme.colors.green,
    },
    breakpoints: {
      xs: "410px",
      ...theme.breakpoints,
    },
  },

  presets: [
    presetUno(),
    presetKobalte(),
    // presetRadix({
    //   palette: ["blue", "green", "red", "slate"],
    //   darkSelector: ".dark",
    //   aliases: {
    //     primary: "blue",
    //     base: "slate",
    //   },
    //   extend: true,
    // }) as Preset,
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: {
          name: "Hanken Grotesk",
          weights: ["300", "400", "600", "700"],
          italic: true,
        },
      },
    }),
    presetTypography({
      cssExtend: {
        "blockquote p:first-of-type::before": { content: "none" },
        "blockquote p:first-of-type::after": { content: "none" },
        "code::before": { content: "none" },
        "code::after": { content: "none" },
        h1: {
          "font-weight": "600",
          "font-size": "1.75rem",
          "border-bottom": "1px solid #e5e7eb",
          "padding-bottom": "1rem",
          "margin-top": "2rem",
          color: "var(--tw-prose-headings)",
        },
        h2: {
          "font-weight": "600",
          "border-bottom": "1px solid #e5e7eb",
          "padding-bottom": "1rem",
          "margin-top": "2rem",
          color: "var(--tw-prose-headings)",
        },
        a: {
          color: "#999",
          "text-decoration": "none",
          "font-weight": "600",
        },
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
});
