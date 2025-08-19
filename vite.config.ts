import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server with proper path handling
      server.middlewares.use("/api", (req, res, next) => {
        console.log(`🔧 Vite middleware intercepted: ${req.method} ${req.url}`);
        app(req, res, next);
      });

      // Fallback for any other API routes
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          console.log(`🔧 Vite fallback middleware: ${req.method} ${req.url}`);
          app(req, res, next);
        } else {
          next();
        }
      });
    },
  };
}
