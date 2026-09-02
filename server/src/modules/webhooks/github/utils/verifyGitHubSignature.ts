import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyGitHubSignature(
  rawBody: Buffer,
  receivedSignature: string | undefined,
  secret: string,
): boolean {
  if (!receivedSignature) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}
