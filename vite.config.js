import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // your frontend port
    proxy: {
      // Proxy for WebSocket server
      "/ws": {
        target: "ws://localhost:8080",
        ws: true, // <-- very important: enable WebSocket proxying
        changeOrigin: true, // avoid host header issues
        secure: false, // if using self-signed certs (for dev)
      },

      // (optional) proxy for REST API if needed later
      "/api": {
        target: "http://localhost:3000", // Express REST API
        changeOrigin: true,
      },
    },
  },
});
