import express from "express"
import { htmlReportController } from "../controllers/htmlReport.controller"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"

const router = express.Router()

router.get(
  "/projects/:projectId/sprints/:sprintId/html-report",
  roleGuard(UserRole.ETUDIANT),
  htmlReportController.generateSprintReport,
)

router.get(
  "/projects/:projectId/global-html-report",
  roleGuard(UserRole.ETUDIANT),
  htmlReportController.generateGlobalReport,
)

export default router
