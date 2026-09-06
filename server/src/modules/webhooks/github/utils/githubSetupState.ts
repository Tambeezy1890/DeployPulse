import jwt from "jsonwebtoken";
import { ApiError } from "../../../../utils/ApiError.js";
import { GITHUB_APP_SETUP_STATE_SECRET } from "../../../../config/config.js";

type GitHubSetupStatePayload = {
  userId: string;
  purpose: "github-app-installation";
};

function getSetupStateSecret(): string {
  if (!GITHUB_APP_SETUP_STATE_SECRET) {
    throw new ApiError("GITHUB_APP_SETUP_STATE_SECRET is not configured.", 500);
  }

  return GITHUB_APP_SETUP_STATE_SECRET;
}

export function createGitHubSetupState(userId: string): string {
  return jwt.sign(
    {
      userId,
      purpose: "github-app-installation",
    } satisfies GitHubSetupStatePayload,
    getSetupStateSecret(),
    {
      expiresIn: "10m",
    },
  );
}

export function verifyGitHubSetupState(state: string): GitHubSetupStatePayload {
  try {
    const decoded = jwt.verify(
      state,
      getSetupStateSecret(),
    ) as GitHubSetupStatePayload;

    if (!decoded.userId || decoded.purpose !== "github-app-installation") {
      throw new Error("Unexpected GitHub setup state.");
    }

    return decoded;
  } catch {
    throw new ApiError(
      "GitHub installation session is invalid or expired.",
      401,
    );
  }
}
