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

  // Test database connection on startup (non-blocking)
  Database.testConnection().then(connected => {
    if (connected) {
      console.log('✅ MySQL database connected successfully');
    } else {
      console.log('❌ MySQL database connection failed - using fallback mode');
    }
  }).catch(error => {
    console.log('⚠️ Database connection test failed - using fallback mode');
  });

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
