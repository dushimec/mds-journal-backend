// 1️⃣ Load dotenv immediately
import dotenv from "dotenv";
dotenv.config(); // MUST be first

import "./types";
import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";
import { Server, createServer } from "http";
import { connectDB } from "./config/database";
import mainRoute from "./routers/index";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Set timeout to 5 minutes
app.use((req, res, next) => {
  req.setTimeout(5 * 60 * 1000);
  res.setTimeout(5 * 60 * 1000);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the MDS API');
});

// API route
const api = process.env.API_URL || '/api';
app.use(api, mainRoute);

// Start server
const server: Server = createServer(app);
const PORT = Number(process.env.PORT) || 5000;

(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}, API_URL: ${api}`));
  } catch (error) {
    logger.error("Failed to connect to the database, server not started.");
    process.exit(1);
  }
})();
