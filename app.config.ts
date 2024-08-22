import { defineConfig } from "@solidjs/start/config";
import devtools from "solid-devtools/vite";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import solidStyled from "vite-plugin-solid-styled";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  server: {
    compatibilityDate: "2024-08-04",
    preset: "cloudflare-pages",
    rollupConfig: {
      external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
    },
    experimental: {
      wasm: true,
      database: true,
    },
    database: {
      default: {
        connector: isProduction ? "cloudflare-d1" : "sqlite",
        options: {
          name: "db",
        },
      },
    },
  },
  vite: {
    plugins: [
      !isProduction
        ? devtools({
          autoname: true,
          locator: {
            targetIDE: "vscode-insiders",
          },
        })
        : undefined,
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
      external: ["@prisma/client"],
    },
  },
  middleware: "./src/middleware.ts",
});
