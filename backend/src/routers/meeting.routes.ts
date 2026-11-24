import { Router } from "express"
import { roleGuard } from "../middlewares/roleGuard.middleware"
import { UserRole } from "../models/enums"
import { validateRequest } from "../middlewares/validation.middleware"
import { scheduleMeetingSchema } from "../schemas/meeting.schema"
import meetingController from "../controllers/meeting.controller"

const router = Router()

router.post(
  "/",
  validateRequest(scheduleMeetingSchema, "body"),
  roleGuard(UserRole.ETUDIANT),
  meetingController.scheduleMeeting,
)

router.get("/:id", meetingController.getMeetingById)

router.get("/", meetingController.getAllMeetings)

router.delete(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  meetingController.deleteMeeting,
)
router.patch(
  "/:id",
  roleGuard(UserRole.ETUDIANT),
  meetingController.updateMeetingByStudent,
)

router.patch(
  "/:id/validate",
  roleGuard(UserRole.ENCADRANT_UNIVERSITAIRE),
  meetingController.validateMeetingBySupervisor,
)

export default router
