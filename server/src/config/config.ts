import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_EXPIRES_IN,
} = process.env;
