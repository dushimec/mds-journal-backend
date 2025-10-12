"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./types");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./utils/logger");
const http_1 = require("http");
const database_1 = require("./config/database");
const index_1 = __importDefault(require("./routers/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Set timeout to 5 minutes
app.use((req, res, next) => {
    req.setTimeout(5 * 60 * 1000); // 5 minutes
    res.setTimeout(5 * 60 * 1000);
    next();
});
const server = (0, http_1.createServer)(app);
const PORT = Number(process.env.PORT) || 5000;
const api = process.env.API_URL || '/api';
app.use(api, index_1.default);
(async () => {
    try {
        await (0, database_1.connectDB)();
        server.listen(PORT, () => logger_1.logger.info(`Server running on port ${PORT}, and API_URL ${api}`));
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to the database, server not started.");
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map