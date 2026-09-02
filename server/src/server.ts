import http from "http";
import { Server } from "socket.io";

import { NODE_ENV, PORT } from "./config/config.js";
import app from "./app.js";
import {
  startHealthWorker,
  stopHealthWorker,
} from "./workers/health.worker.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} Connected`);

  socket.on("disconnect", () => {
    console.log(`${socket.id} Disconnected`);
  });
});

// Listen errors can happen asynchronously,
// so try/catch alone won't catch them.
server.on("error", (error) => {
  console.error("HTTP server error:", error);
  stopHealthWorker();
  process.exit(1);
});

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server live on port ${PORT} in ${NODE_ENV} mode`);

    startHealthWorker();
  });
};

startServer();
