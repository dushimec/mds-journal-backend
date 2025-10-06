import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/token";
import { AppError } from "../utils/appError";
import { UserRole } from "@prisma/client";




export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role as UserRole,
    };

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }

    next(new AppError("Authentication failed", 401));
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Access denied", 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

