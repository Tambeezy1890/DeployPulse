import { checkEnabledProjects } from "../modules/health/services/health.service.js";

const CHECK_INTERVAL_MS = 60_000;

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

  console.log("Health worker started.");

  // Run immediately, then schedule subsequent cycles.
  void runCycle();
}

export function stopHealthWorker(): void {
  stopped = true;

  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
}
