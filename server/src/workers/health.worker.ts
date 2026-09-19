import { HEALTH_CHECK_INTERVAL_MS } from "../config/config.js";

import { checkEnabledProjects } from "../modules/health/services/health.service.js";

const parsedInterval = Number.parseInt(
  HEALTH_CHECK_INTERVAL_MS ?? "300000",
  10,
);

const CHECK_INTERVAL_MS =
  Number.isFinite(parsedInterval) && parsedInterval >= 60_000
    ? parsedInterval
    : 180_000;

let timer: ReturnType<typeof setTimeout> | undefined;

let running = false;

let stopped = true;

async function runCycle(): Promise<void> {
  if (stopped || running) return;

  running = true;

  try {
    await checkEnabledProjects();

    console.log("Health-check cycle completed.");
  } catch (error) {
    console.error("Health-check cycle failed:", error);
  } finally {
    running = false;

    if (!stopped) {
      timer = setTimeout(() => {
        void runCycle();
      }, CHECK_INTERVAL_MS);
    }
  }
}

export function startHealthWorker(): void {
  if (!stopped) return;

  stopped = false;

  console.log(
    `Health worker started. Check interval: ${CHECK_INTERVAL_MS / 60_000} minute(s).`,
  );

  // Run immediately, then schedule subsequent cycles.
  void runCycle();
}

export function stopHealthWorker(): void {
  stopped = true;

  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }

  console.log("Health worker stopped.");
}
