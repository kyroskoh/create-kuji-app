import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { fileURLToPath, URL } from "node:url";
import fs from "fs";
import path from "path";

// Helper function to get HTTPS config
function getHttpsConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: Use Let's Encrypt certificates
    const certPath = '/etc/letsencrypt/live/servarica0.layeredserver.com';
    try {
      return {
        key: fs.readFileSync(path.join(certPath, 'privkey.pem')),
        cert: fs.readFileSync(path.join(certPath, 'fullchain.pem')),
      };
    } catch (error) {
      console.warn('⚠️  Production SSL certificates not found, falling back to HTTP');
      return false;
    }
  } else {
    // Development: basicSsl plugin handles self-signed certificates
    return false; // Plugin handles it
  }
}

export default defineConfig({
  plugins: [
    react(),
    // Use basicSsl plugin for development self-signed certificates
    process.env.NODE_ENV !== 'production' && basicSsl(),
  ].filter(Boolean),
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: false, // Try next port if 5173 is taken
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'localhost:3001', // Backend port
      'localhost:5173', // Frontend dev server (primary)
      'localhost:5174', // Frontend dev server (fallback)
      'localhost:3000',  // Alternative frontend port
      'servarica0.layeredserver.com',
      '.layeredserver.com', // Allow all subdomains
      'createkuji.app',
      '.createkuji.app', // Allow all createkuji.app subdomains
    ],
    proxy: {
      // Proxy API calls to backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    https: getHttpsConfig(),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
