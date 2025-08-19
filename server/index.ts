import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import apiRouter from "./routes/api";
import Database from "./database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database will be tested on first use - avoiding startup crash
  console.log('🗄️ Database connection will be tested on first use');

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Main API routes
  app.use("/api", apiRouter);

  return app;
}
