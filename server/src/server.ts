import http from "http";
import { Server } from "socket.io";

import { NODE_ENV, PORT } from "./config/config.js";
import app from "./app.js";


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`${socket.id} Connected`);
  socket.on("disconnect", () => {
    console.log(`${socket.id} Disconnected`);
  });
});

const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server live on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

startServer();