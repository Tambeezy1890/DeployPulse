import { performance } from "node:perf_hooks";

import type { HealthCheckResult } from "../types/health.types.js";

const allowedHosts = [
  "vercel.app",
  "netlify.app",
  "onrender.com",
  "railway.app",
];

function validateHealthUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error("Use an HTTPS URL without credentials or a fragment.");
  }

  const allowed = allowedHosts.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
  );

  if (!allowed) {
    throw new Error("This hosting provider is not currently supported.");
  }

  return url.href;
}

export async function checkUrl(rawUrl: string): Promise<HealthCheckResult> {
  const url = validateHealthUrl(rawUrl);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(5_000),
      headers: {
        "user-agent": "DeployPulse-Monitor/1.0",
        accept: "application/json,text/plain,*/*",
      },
    });

    const responseTimeMs = Math.round(performance.now() - startedAt);

    await response.body?.cancel();

    return {
      status: response.ok ? "UP" : "DOWN",
      statusCode: response.status,
      responseTimeMs,
      errorMessage: response.ok
        ? null
        : `Endpoint returned HTTP ${response.status}`,
    };
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - startedAt);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return {
      status: "DOWN",
      statusCode: null,
      responseTimeMs,
      errorMessage: isTimeout
        ? "Request timed out after 5 seconds"
        : error instanceof Error
          ? error.message
          : "Could not reach the endpoint",
    };
  }
}
