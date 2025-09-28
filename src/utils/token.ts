import jwt, { SignOptions } from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_EXPIRES_IN = "1d";

export const generateToken = (
  payload: object,
  options: SignOptions = { expiresIn: DEFAULT_EXPIRES_IN }
): string => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
  name: string;
  email: string;

}