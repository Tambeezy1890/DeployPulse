import jwt, { type SignOptions } from "jsonwebtoken";
import {
  EXPIRES_IN,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
} from "../../../config/config.js";
import { ApiError } from "../../../utils/ApiError.js";
interface TokenUser {
  id: string;
  role: string;
}

const ACCESS_TOKEN_SECRET = JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new ApiError(
    "JWT_SECRET is not defined in the environment variables.",
    500,
  );
}

if (!REFRESH_TOKEN_SECRET) {
  throw new ApiError(
    "REFRESH_TOKEN_SECRET is not defined in the environment variables.",
    500,
  );
}

export const generateToken = (user: TokenUser): string => {
  const payload = {
    id: user.id,
    role: user.role,
  };
  const expiresIn = (EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const expiresIn = (REFRESH_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn,
  });
};
