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
  GITHUB_WEBHOOK_SECRET,
  GITHUB_APP_ID,
  GITHUB_APP_SLUG,
  GITHUB_APP_PRIVATE_KEY_PATH,
  GITHUB_APP_SETUP_STATE_SECRET,

  CLIENT_URL,
} = process.env;
