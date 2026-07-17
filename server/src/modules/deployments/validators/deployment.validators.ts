import { body, param } from "express-validator";

import {
  DeploymentStatus,
  Environment,
} from "../../../../generated/prisma/enums.js";

const environmentValues = Object.values(Environment);
const statusValues = Object.values(DeploymentStatus);

export const projectIdValidator = [
  param("projectId").trim().notEmpty().withMessage("Project ID is required."),
];

export const deploymentIdValidator = [
  param("deploymentId")
    .trim()
    .notEmpty()
    .withMessage("Deployment ID is required."),
];

export const createDeploymentValidator = [
  body("environment")
    .optional()
    .isIn(environmentValues)
    .withMessage(
      `Environment must be one of: ${environmentValues.join(", ")}.`,
    ),

  body("branch")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Branch cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Branch cannot exceed 255 characters."),

  body("commitSha")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Commit SHA cannot be empty.")
    .isLength({ max: 64 })
    .withMessage("Commit SHA cannot exceed 64 characters."),

  body("commitMessage")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Commit message cannot exceed 500 characters."),
];

export const updateDeploymentStatusValidator = [
  body("status")
    .exists()
    .withMessage("Status is required.")
    .bail()
    .isIn(statusValues)
    .withMessage(`Status must be one of: ${statusValues.join(", ")}.`),

  body("deploymentUrl")
    .optional()
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Deployment URL must be a valid URL."),

  body("logsUrl")
    .optional()
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Logs URL must be a valid URL."),
];
