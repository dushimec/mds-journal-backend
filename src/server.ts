// 1️⃣ Load dotenv immediately
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3005;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});


