import express from "express"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"
import { reportController } from "../controllers/report.controller"
import multer from "multer"
import upload from "../middlewares/multer.middleware"

const router = express.Router()

const storage = multer.memoryStorage()

router.get(
  "/",
  roleGuard(UserRole.ETUDIANT, UserRole.ENCADRANT_UNIVERSITAIRE, UserRole.ENCADRANT_ENTREPRISE),
  reportController.getAllReports,
)

router.post(
  "/",
  roleGuard(UserRole.ETUDIANT),
  upload.single("reportFile"),
  reportController.UploadReport,
)
router.patch(
  "/:reportId",
  roleGuard(UserRole.ETUDIANT),
  reportController.updateReport,
)

router.get(
  "/:reportId",
  roleGuard(UserRole.ETUDIANT),
  reportController.getReportsById,
)

router.delete(
  "/:reportId",
  roleGuard(UserRole.ETUDIANT),
  reportController.deleteReport,
)

router.use("/report-file", express.static("uploads"))

export default router
