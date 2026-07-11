import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

type AppError = Error & {
  status?: number;
};

export const errorMiddleware: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status ?? 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
};