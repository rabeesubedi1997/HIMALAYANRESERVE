import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://himalayanreserve.kitetool.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
