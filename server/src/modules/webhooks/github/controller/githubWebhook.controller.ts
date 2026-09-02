import type { Request, Response } from "express";

import { GITHUB_WEBHOOK_SECRET } from "../../../../config/config.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { verifyGitHubSignature } from "../utils/verifyGitHubSignature.js";

export async function handleGitHubWebhook(req: Request, res: Response) {
  if (!GITHUB_WEBHOOK_SECRET) {
    throw new ApiError("GitHub webhook secret is not configured.", 500);
  }

  if (!Buffer.isBuffer(req.body)) {
    throw new ApiError("GitHub webhook body must be raw.", 400);
  }

  const signature = req.get("x-hub-signature-256");

  const signatureIsValid = verifyGitHubSignature(
    req.body,
    signature,
    GITHUB_WEBHOOK_SECRET,
  );

  if (!signatureIsValid) {
    throw new ApiError("Invalid GitHub webhook signature.", 401);
  }

  const eventName = req.get("x-github-event");
  const deliveryId = req.get("x-github-delivery");

  if (!eventName || !deliveryId) {
    throw new ApiError("Required GitHub webhook headers are missing.", 400);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    throw new ApiError("GitHub webhook payload is invalid JSON.", 400);
  }

  console.log(`GitHub webhook received: ${eventName} (${deliveryId})`);

  if (eventName === "ping") {
    return res.status(200).json({
      success: true,
      message: "GitHub webhook connected successfully.",
    });
  }

  return res.status(202).json({
    success: true,
    message: `GitHub event '${eventName}' accepted.`,
    payloadReceived: payload !== null,
  });
}
