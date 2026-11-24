import { Router } from "express"
import validationController from "../controllers/validation.controller"
import { validateRequest } from "../middlewares/validation.middleware"
import { createValidationSchema } from "../schemas/validation.schema"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"

const router = Router()

router.post(
  "/",
  roleGuard(UserRole.ENCADRANT_ENTREPRISE, UserRole.ENCADRANT_UNIVERSITAIRE),
  validateRequest(createValidationSchema, "body"),
  validationController.createValidation,
)
router.get("/task/:taskId", validationController.getValidationsByTaskId)
router.get(
  "/userStory/:userStoryId",
  validationController.getValidationsByUserStoryId,
)
router.get("/sprint/:sprintId", validationController.getValidationsBySprintId)
export default router
