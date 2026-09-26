import http from "http";

import { Server } from "socket.io";

import { CLIENT_URL, NODE_ENV, PORT } from "./config/config.js";

import app from "./app.js";

const allowedOrigins = [
  "http://localhost:5173",
  ...(CLIENT_URL
    ? CLIENT_URL.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
];
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} Connected`);

  socket.on("disconnect", () => {
    console.log(`${socket.id} Disconnected`);
  });
});

server.on("error", (error) => {
  console.error("HTTP server error:", error);
  process.exit(1);
});

const port = Number(PORT) || 5050;

server.listen(port, () => {
  console.log(
    `Server live on port ${port} in ${NODE_ENV ?? "development"} mode`,
  );
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received. Closing HTTP server.`);

  server.close((error) => {
    if (error) {
      console.error("Failed to close HTTP server cleanly:", error);
      process.exit(1);
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error("HTTP server shutdown timed out.");
    process.exit(1);
  }, 10_000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
