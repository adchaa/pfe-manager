
import express from "express"
import dashboardController from "../controllers/dashboard.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validateRequest } from "../middlewares/validation.middleware"
import { 
  projectStatsParamsSchema,
  sprintDetailsParamsSchema 
} from "../schemas/dashboard.schema"

const router = express.Router()

router.use(authMiddleware)

router.get("/timeline", dashboardController.getTimeline)
router.get("/overview", dashboardController.getOverview)
router.get(
  "/project/:projectId",
  validateRequest(projectStatsParamsSchema, "params"),
  dashboardController.getProjectStats,
)

router.get("/sprints/stats", dashboardController.getSprintsStats)
router.get(
  "/sprint/:sprintId",
  validateRequest(sprintDetailsParamsSchema, "params"),
  dashboardController.getSprintDetails,
)
router.get("/summary", dashboardController.getProjectsSummary)
router.get("/active-projects", dashboardController.getActiveProjects)

export default router