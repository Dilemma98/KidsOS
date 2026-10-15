import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["wera.jpg", "star-192.png", "star-512.png", "animals/*"],
      manifest: {
        name: "KidsOS",
        short_name: "KidsOS",
        lang: "sv",
        display: "fullscreen",
        start_url: "/",
        background_color: "#fff8f5",
        theme_color: "#fff8f5",
        icons: [
          { src: "/star-192.png", sizes: "192x192", type: "image/png" },
          { src: "/star-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/star-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,jpg,png,svg,mp3,ico}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "/index.html",
      },
    }),
  ],
});