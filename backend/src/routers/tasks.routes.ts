import express from "express"
import taskController from "../controllers/tasks.controller"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"

import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../schemas/tasks.schema"

const router = express.Router()

router.post(
  "/",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(createTaskSchema, "body"),
  taskController.createTask,
)

router.get("/:id", roleGuard(UserRole.ETUDIANT), taskController.getTaskById)

router.get(
  "/userStory/:userStoryId",
  roleGuard(
    UserRole.ENCADRANT_ENTREPRISE,
    UserRole.ENCADRANT_UNIVERSITAIRE,
    UserRole.ETUDIANT,
  ),
  taskController.getTasksByUserStory,
)

router.put(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(updateTaskSchema, "body"),
  taskController.updateTask,
)

router.patch(
  "/:id/status",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(updateTaskStatusSchema, "body"),
  taskController.updateTaskStatus,
)

router.delete("/:id", roleGuard(UserRole.ETUDIANT), taskController.deleteTask)

export default router
