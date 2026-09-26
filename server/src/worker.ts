import prisma from "./config/prisma.js";
import {
  startHealthWorker,
  stopHealthWorker,
} from "./workers/health.worker.js";

console.log("Starting DeployPulse health worker.");
startHealthWorker();

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log(`${signal} received. Stopping health worker.`);
  stopHealthWorker();

  try {
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to stop health worker cleanly:", error);
    process.exit(1);
  }
}

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
