import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError, ValidationErrorDetail } from "../utils/ApiError.js";

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors: ValidationErrorDetail[] = result.array().map((error) => {
    if (error.type === "field") {
      return {
        field: error.path || "request",
        message: String(error.msg),
      };
    }
    return {
      field: "request",
      message: String(error.msg),
    };
  });
  return next(new ApiError("Validation failed", 422, errors));
};
