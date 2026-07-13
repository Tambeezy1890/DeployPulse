import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/AsyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { generateRefreshToken, generateToken } from "../utils/authToken.js";
import bcrypt from "bcryptjs";
interface RegisterBody {
  name: string;
  email: string;
  password: string;
}
interface LoginBody {
  email: string;
  password: string;
}

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ApiError("Name, email and password are required.", 400);
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ApiError("User with this email already exists.", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: name,
        email,
        passwordHash: hashedPassword,
        role: "USER",
      },
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken(newUser.id);

    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: newUser.id,
        name: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  },
);
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError("Email and password are required.", 400);
    }

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

    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  },
);
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);
