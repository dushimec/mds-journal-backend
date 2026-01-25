import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      // Log network/connection errors with more context
      if (error instanceof AggregateError || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.error('Network/Connection Error in asyncHandler', {
          error: error.message,
          code: error.code,
          url: req.url,
        });
      }
      next(error);
    });
  };
};
