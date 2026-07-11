import express,{type Express, type Request, type Response} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";

const app: Express = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req: Request,res:Response) => {
  res.send("Server is now live")
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "DeployPulse API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(errorMiddleware);

export default app;
