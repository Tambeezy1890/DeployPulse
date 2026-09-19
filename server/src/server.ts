import http from "http";

import { Server } from "socket.io";

import { CLIENT_URL, NODE_ENV, PORT } from "./config/config.js";

import app from "./app.js";

import {
  startHealthWorker,
  stopHealthWorker,
} from "./workers/health.worker.js";

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

  stopHealthWorker();
  process.exit(1);
});

const port = Number(PORT) || 5050;

server.listen(port, () => {
  console.log(
    `Server live on port ${port} in ${NODE_ENV ?? "development"} mode`,
  );

  startHealthWorker();
});
