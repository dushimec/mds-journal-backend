import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";
import { logger } from "./logger";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      status: err.status,
    });
  }

  logger.error(err.message);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    status: 500,
  });
};
