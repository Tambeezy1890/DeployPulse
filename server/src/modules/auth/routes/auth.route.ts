import { Router } from "express";
import {
  registerUser,
  login,
  getUser,
  refreshToken,
} from "../controller/auth.controller.js";

const authRoute = Router();

authRoute.post("/register", registerUser);
authRoute.post("/login", login);
authRoute.get("/getUser", getUser);
authRoute.post("/refresh-token", refreshToken);

export default authRoute;
