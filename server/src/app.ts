import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CLIENT_URL } from "./config/config.js";
import authRoute from "./modules/auth/routes/auth.route.js";
import { errorMiddleware } from "./middleware/Error.Middleware.js";
import projectRouter from "./modules/projects/routes/project.route.js";
import deploymentRouter from "./modules/deployments/routes/deployment.route.js";
import githubWebhookRouter from "./modules/webhooks/github/routes/githubWebhook.route.js";
import githubInstallationRouter from "./modules/webhooks/github/routes/githubInstallation.route.js";
import incidentRouter from "./modules/incidents/routes/incident.route.js";
import notificationRouter from "./modules/notifications/routes/notification.route.js";

const app: Express = express();

const allowedOrigins = [
  "http://localhost:5173",
  ...(CLIENT_URL
    ? CLIENT_URL.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  }),
);

/*
 * Keep this before express.json() if the GitHub webhook route
 * verifies signatures using the original raw request body.
 */
app.use("/api/webhooks/github", githubWebhookRouter);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is now live");
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

app.use("/api/auth", authRoute);
app.use("/api/incidents", incidentRouter);
app.use("/api/github", githubInstallationRouter);
app.use("/api/projects", projectRouter);
app.use("/api/deployments", deploymentRouter);
app.use("/api/notifications", notificationRouter);

app.use(errorMiddleware);

export default app;
