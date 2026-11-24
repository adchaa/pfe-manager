import express from "express"
import authController from "../controllers/auth.controller"
import { validateRequest } from "../middlewares/validation.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import {
  loginSchema,
  refreshTokenSchema,
  signupSchema,
} from "../schemas/auth.schema"

const router = express.Router()

router.post(
  "/signup",
  validateRequest(signupSchema, "body"),
  authController.signup,
)
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.login,
)
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema, "cookies"),
  authController.refreshToken,
)
router.get(
  "/users/by-email/:email",
  authMiddleware,
  authController.getUserByEmail,
)


export default router
