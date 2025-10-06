import "./types"
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./utils/logger";
import { Server, createServer } from "http";
import { connectDB } from "./config/database";
import mainRoute from "./routers/index";
import aboutSectionRoute from "./routers/aboutPageSection.Routes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Set timeout to 5 minutes
app.use((req, res, next) => {
  req.setTimeout(5 * 60 * 1000); // 5 minutes
  res.setTimeout(5 * 60 * 1000);
  next();
});
const server: Server = createServer(app);
const PORT = process.env.PORT || 5000;

const api = process.env.API_URL;
app.use("/about-sections", aboutSectionRoute)
app.use(`${api}`, mainRoute);

(async () => {
    try {
        await connectDB();
        server.listen(PORT, () => logger.info(`Server running on port ${PORT}, and API_URL ${api}`));
    } catch (error) {
        logger.error("Failed to connect to the database, server not started.");
        process.exit(1);
    }
})();
