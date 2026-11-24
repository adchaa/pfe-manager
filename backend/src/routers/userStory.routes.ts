import express from "express"
import userStoryController from "../controllers/userStory.controller"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"
import {
  createUserStorySchema,
  updateUserStorySchema,
} from "../schemas/userStory.schema"

const router = express.Router()

router.post(
  "/",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(createUserStorySchema, "body"),
  userStoryController.createUserStory,
)

router.get("/", userStoryController.getUserStoriesBySprint)

router.get("/:id", userStoryController.getUserStoryById)

router.put(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(updateUserStorySchema, "body"),
  userStoryController.updateUserStory,
)

router.delete(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  userStoryController.deleteUserStory,
)

export default router
