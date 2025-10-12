"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
exports.prisma = new client_1.PrismaClient();
const connectDB = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.debug('database Connected');
    }
    catch (error) {
        logger_1.logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map