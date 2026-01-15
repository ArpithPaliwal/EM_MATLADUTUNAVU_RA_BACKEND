import jwt, { type SignOptions } from "jsonwebtoken";

// Ensure secrets exist, otherwise throw an error early
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT Secrets are not defined in environment variables");
}

export interface TokenPayload {
  _id: string;
  email: string;
  username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY as any) || "60m",
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY as any) || "7d",
  };

  return jwt.sign(
    { _id: userId }, 
    REFRESH_TOKEN_SECRET, 
    options
  );
};
