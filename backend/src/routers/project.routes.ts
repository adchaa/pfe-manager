import express from "express"
import { projectController } from "../controllers/project.controller"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema"

const router = express.Router()

router.post(
  "/",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(createProjectSchema, "body"),
  projectController.createProject,
)

router.get("/", projectController.getAllProjects)

router.get("/my-project", projectController.getMyProject)

router.get("/:id", projectController.getProjectById)

router.put(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  validateRequest(updateProjectSchema, "body"),
  projectController.updateProject,
)

router.delete(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  projectController.deleteProject,
)

router.patch(
  "/:id/archive",
  roleGuard(UserRole.ETUDIANT),
  projectController.archiveProject,
)

export default router
