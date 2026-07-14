import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/AsyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { generateRefreshToken, generateToken } from "../utils/authToken.js";
import bcrypt from "bcryptjs";
import {
  LoginBody,
  RefreshTokenPayload,
  RegisterBody,
} from "../types/auth.types.js";
import jwt from "jsonwebtoken";

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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

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
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new ApiError("Refresh token is required.", 401);
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!refreshTokenSecret) {
      throw new ApiError("REFRESH_TOKEN_SECRET is not configured.", 500);
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(
        refreshToken,
        refreshTokenSecret,
      ) as RefreshTokenPayload;
    } catch {
      throw new ApiError("Invalid or expired refresh token.", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user || !user.refreshToken) {
      throw new ApiError("Refresh token is invalid.", 401);
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError("Refresh token does not match.", 401);
    }

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
    });

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

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});
