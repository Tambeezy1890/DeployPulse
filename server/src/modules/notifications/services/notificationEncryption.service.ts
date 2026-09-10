import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { NOTIFICATION_ENCRYPTION_KEY } from "../../../config/config.js";

import { ApiError } from "../../../utils/ApiError.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  console.log("NOTIFICATION_ENCRYPTION_KEY", NOTIFICATION_ENCRYPTION_KEY);
  if (!NOTIFICATION_ENCRYPTION_KEY) {
    throw new ApiError("Notification encryption key is not configured.", 500);
  }

  if (!/^[a-fA-F0-9]{64}$/.test(NOTIFICATION_ENCRYPTION_KEY)) {
    throw new ApiError(
      "Notification encryption key must be a 64-character hexadecimal value.",
      500,
    );
  }

  return Buffer.from(NOTIFICATION_ENCRYPTION_KEY, "hex");
}

export function encryptNotificationSecret(value: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authenticationTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authenticationTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptNotificationSecret(value: string) {
  const key = getEncryptionKey();

  const [ivValue, authenticationTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authenticationTagValue || !encryptedValue) {
    throw new ApiError("Stored notification credentials are invalid.", 500);
  }

  try {
    const iv = Buffer.from(ivValue, "base64");
    const authenticationTag = Buffer.from(authenticationTagValue, "base64");

    const encrypted = Buffer.from(encryptedValue, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authenticationTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new ApiError("Could not decrypt notification credentials.", 500);
  }
}
