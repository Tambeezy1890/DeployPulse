import type { CookieOptions, Response } from "express";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export function getRefreshCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: SEVEN_DAYS_IN_MS,
    path: "/",
  };
}

export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
) {
  response.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
}

export function clearRefreshTokenCookie(response: Response) {
  const { maxAge: _maxAge, ...clearOptions } = getRefreshCookieOptions();

  response.clearCookie("refreshToken", clearOptions);
}
