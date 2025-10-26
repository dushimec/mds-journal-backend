import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";
import { logger } from "./logger";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  logger.error(`Unhandled error: ${err.stack || err.message}`);

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
};
