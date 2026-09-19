import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof ApiError ? err.status : 500;

  return res.status(status).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
    ...(err instanceof ApiError &&
      err.errors && {
        errors: err.errors,
      }),
  });
};
