import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/AsyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { generateRefreshToken, generateToken } from "../utils/authToken.js";
import bcrypt from "bcryptjs";
import type {
  LoginBody,
  RefreshTokenPayload,
  RegisterBody,
} from "../types/auth.types.js";
import jwt from "jsonwebtoken";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../utils/authCookie.js";

import { REFRESH_TOKEN_SECRET } from "../../../config/config.js";

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ApiError("User with this email already exists.", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: "USER",
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  },
);
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw new ApiError("Invalid credentials.", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new ApiError("Invalid credentials.", 401);
    }

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  },
);
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  },
);
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const presentedToken = req.cookies?.refreshToken as string | undefined;

    if (!presentedToken) {
      throw new ApiError("Refresh token is required.", 401);
    }

    if (!REFRESH_TOKEN_SECRET) {
      throw new ApiError("REFRESH_TOKEN_SECRET is not configured.", 500);
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(
        presentedToken,
        REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;
    } catch {
      clearRefreshTokenCookie(res);

      throw new ApiError("Invalid or expired refresh token.", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user || !user.refreshToken || user.refreshToken !== presentedToken) {
      clearRefreshTokenCookie(res);

      throw new ApiError("Refresh token is invalid.", 401);
    }

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
    });

    const nextRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: nextRefreshToken,
      },
    });

    setRefreshTokenCookie(res, nextRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  },
);
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (refreshToken) {
    await prisma.user.updateMany({
      where: {
        refreshToken,
      },
      data: {
        refreshToken: null,
      },
    });
  }
  clearRefreshTokenCookie(res);

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});
