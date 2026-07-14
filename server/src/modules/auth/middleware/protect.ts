import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../utils/ApiError.js";
import { JWT_SECRET } from "../../../config/config.js";
import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "../types/auth.types.js";

const protect = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(new ApiError("Unauthorized", 401));
  }
  let token;
  token = authorizationHeader.split(" ")[1];
  if (!token) {
    return next(new ApiError("Unauthorized", 401));
  }
  const AccessTokenSecret = JWT_SECRET;
  if (!AccessTokenSecret) {
    return next(new ApiError("Access token secret is not defined", 500));
  }
  try {
    const decoded = jwt.verify(token, AccessTokenSecret) as AccessTokenPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(new ApiError("Unauthorized", 401));
  }
};

export default protect;
