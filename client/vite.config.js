import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const BACKEND_URL = env.VITE_BACKEND_URL ?? "http://localhost:3000/";
  const PORT = parseInt(env.VITE_PORT ?? "5000");

  return {
    plugins: [react()],
    server: {
      allowedHosts: [env.VITE_FRONTEND_URL],
      host: true,
      port: PORT,
      proxy: {
        "/api": {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
