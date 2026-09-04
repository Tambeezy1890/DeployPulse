import { randomUUID } from "node:crypto";

import jwt, { type SignOptions } from "jsonwebtoken";

import {
  EXPIRES_IN,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from "../../../config/config.js";

import { ApiError } from "../../../utils/ApiError.js";

interface TokenUser {
  id: string;
  role: string;
}

const accessTokenSecret = JWT_SECRET;
const refreshTokenSecret = REFRESH_TOKEN_SECRET;

if (!accessTokenSecret) {
  throw new ApiError("JWT_SECRET is not defined.", 500);
}

if (!refreshTokenSecret) {
  throw new ApiError("REFRESH_TOKEN_SECRET is not defined.", 500);
}
export const generateToken = (user: TokenUser): string => {
  const expiresIn = (EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    accessTokenSecret,
    {
      expiresIn,
    },
  );
};

export const generateRefreshToken = (userId: string): string => {
  const expiresIn = (REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: userId,
    },
    refreshTokenSecret,
    {
      expiresIn,
      jwtid: randomUUID(),
    },
  );
};
