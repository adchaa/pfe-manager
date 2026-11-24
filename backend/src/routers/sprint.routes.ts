import express from "express"
import { sprintController } from "../controllers/sprint.controller"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"
import {
  createSprintSchema,
  updateSprintSchema,
} from "../schemas/sprint.schema"

const router = express.Router()

router.post(
  "/",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(createSprintSchema, "body"),
  sprintController.createSprint,
)

router.get("/project/:projectId", sprintController.getSprintsByProject)

router.get("/:id", sprintController.getSprintById)

router.put(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(updateSprintSchema, "body"),
  sprintController.updateSprint,
)

router.delete(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  sprintController.deleteSprint,
)

export default router
