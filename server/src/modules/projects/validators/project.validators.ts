import { body, param } from "express-validator";
import { Provider } from "../../../../generated/prisma/enums.js";

const providerValues = Object.values(Provider);

export const projectIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Project ID is required.")
    .isString()
    .withMessage("Project ID must be a string."),
];

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("repository")
    .optional()
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Repository must be a valid URL."),

  body("provider")
    .optional()
    .isIn(providerValues)
    .withMessage(`Provider must be one of: ${providerValues.join(", ")}.`),
];

export const updateProjectValidator = [
  ...projectIdValidator,

  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error("At least one field must be provided.");
    }

    return true;
  }),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters."),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("repository")
    .optional({ nullable: true })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Repository must be a valid URL."),

  body("provider")
    .optional({ nullable: true })
    .isIn(providerValues)
    .withMessage(`Provider must be one of: ${providerValues.join(", ")}.`),
];
