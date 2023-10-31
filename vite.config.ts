import devtools from "solid-devtools/vite";
import cloudflare from "solid-start-cloudflare-pages";
import solid from "solid-start/vite";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import solidStyled from "vite-plugin-solid-styled";

export default defineConfig(() => {
  return {
    plugins: [
      process.env.NODE_ENV == "development"
        ? devtools({
            autoname: true,
            locator: {
              targetIDE: "vscode",
            },
          })
        : undefined,
      solid({
        ssr: true,
        adapter: cloudflare({}),
      }),
      Icons({ compiler: "solid" }),
      UnoCSS(),
      solidStyled({
        prefix: "ss",
        filter: {
          include: "src/**/*.{ts,js,tsx,jsx}",
          exclude: "node_modules/**/*.{ts,js,tsx,jsx}",
        },
      }),
    ],
    ssr: {
      noExternal: ["@kobalte/core", "@internationalized/message"],
    },
    optimizeDeps: {
      include: ["solid-devtools/setup"],
    },
  };
});
