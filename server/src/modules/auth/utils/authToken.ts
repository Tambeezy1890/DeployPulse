import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: string;
};

function getTokenSecret(name: "JWT_SECRET" | "REFRESH_TOKEN_SECRET") {
  const secret = process.env[name];

  if (!secret) {
    throw new Error(`${name} is missing.`);
  }

  return secret;
}

export function createAccessToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies TokenPayload,
    getTokenSecret("ACCESS_TOKEN_SECRET"),
    { expiresIn: "15m" },
  );
}

export function createRefreshToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies TokenPayload,
    getTokenSecret("REFRESH_TOKEN_SECRET"),
    { expiresIn: "7d" },
  );
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(
    token,
    getTokenSecret("REFRESH_TOKEN_SECRET"),
  ) as TokenPayload;
}