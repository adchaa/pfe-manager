import express from "express"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import taskHistoryController from "../controllers/TaskHistory.controller"

const router = express.Router()

router.get(
  "/:historyId",
  roleGuard(
    UserRole.ETUDIANT,
    UserRole.ENCADRANT_ENTREPRISE,
    UserRole.ENCADRANT_UNIVERSITAIRE,
  ),
  taskHistoryController.getHistoryById,
)

router.get(
  "/task/:taskId",
  roleGuard(
    UserRole.ETUDIANT,
    UserRole.ENCADRANT_ENTREPRISE,
    UserRole.ENCADRANT_UNIVERSITAIRE,
  ),
  taskHistoryController.getHistoryByTask,
)

export default router
