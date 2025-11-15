import jwt, { SignOptions } from "jsonwebtoken";

const DEFAULT_EXPIRES_IN = "1d";

// Generate JWT token safely
export const generateToken = (
  payload: object,
  options: SignOptions = { expiresIn: DEFAULT_EXPIRES_IN }
): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
  return jwt.sign(payload, secret, options);
};

// Verify JWT token safely
export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
  return jwt.verify(token, secret);
};

// JWT payload interface
export interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
  name: string;
  email: string;
}
