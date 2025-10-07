import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: false, // Try next port if 5173 is taken
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'createkuji.app',
      '.createkuji.app',
      'servarica0.layeredserver.com',
      '.layeredserver.com', // Allow all subdomains
    ],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
