import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, 
    proxy: {
      // Proxy for WebSocket server
      "/ws": {
        target: "ws://localhost:8080",
        ws: true, // <-- enable WebSocket proxying
        changeOrigin: true, // avoid host header issues
        secure: false, 
      },

      // proxy for REST API 
      "/api": {
        target: "http://localhost:3000", // Express REST API
        changeOrigin: true,
      },
    },
  },
});
