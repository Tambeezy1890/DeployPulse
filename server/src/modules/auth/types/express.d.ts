import type { AccessTokenPayload } from "../modules/auth/types/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
