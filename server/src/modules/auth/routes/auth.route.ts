import { Router } from "express";
import {
  registerUser,
  login,
  getUser,
  refreshAccessToken,
  logout,
} from "../controller/auth.controller.js";
import protect from "../middleware/protect.js";
import {
  loginValidation,
  registerValidator,
} from "../validators/auth.validators.js";
import { validateRequest } from "../../../middleware/validateRequest.js";

const authRoute = Router();

authRoute.post("/register", registerValidator, validateRequest, registerUser);
authRoute.post("/login", loginValidation, validateRequest, login);
authRoute.get("/me", protect, getUser);
authRoute.post("/refresh-token", refreshAccessToken);
authRoute.post("/logout", logout);

export default authRoute;
