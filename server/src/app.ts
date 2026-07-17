import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import authRoute from "./modules/auth/routes/auth.route.js";
import { errorMiddleware } from "./middleware/Error.Middleware.js";
import cookieParser from "cookie-parser";
import projectRouter from "./modules/projects/routes/project.route.js";
import deploymentRouter from "./modules/deployments/routes/deployment.route.js";

const app: Express = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is now live");
});
app.use("/api/auth", authRoute);
app.use("/api/projects", projectRouter);
app.use("/api/deployments", deploymentRouter);

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
