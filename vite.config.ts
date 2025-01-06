import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/spotify-throwback-random/',
  plugins: [react()],
  server: {
    port: 3000,
  },
});
