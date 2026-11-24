const errors = {
  INTERNAL_SERVER_ERROR: {
    code: 3000,
    message: "Internal server error",
  },
  INVALID_INPUT: {
    code: 3001,
    message: "Invalid input",
  },
  BAD_REQUEST: {
    code: 3002,
    message: "Bad request",
  },
  AUTH: {
    INVALID_CREDENTIAL: {
      code: 4000,
      message: "Invalid credential",
    },
    EMAIL_ALREADY_EXISTS: {
      code: 4001,
      message: "Email already exists",
    },
    REFRESH_TOKEN_REQUIRED: {
      code: 4002,
      message: "Refresh token is required",
    },
    INVALID_REFRESH_TOKEN: {
      code: 4003,
      message: "Invalid refresh token",
    },
    REFRESH_TOKEN_EXPIRED: {
      code: 4004,
      message: "Refresh token has expired",
    },
    INVALID_USER: {
      code: 4005,
      message: "Invalid user",
    },
    TOKEN_REQUIRED: {
      code: 4006,
      message: "Token required",
    },
    INVALID_TOKEN: {
      code: 4007,
      message: "Invalid token",
    },
    UNAUTHORIZED: {
      code: 4008,
      message: "Unauthorized",
    },
    FORBIDDEN_ROLE: {
      code: 4009,
      message: "Forbidden role",
    },
    FORBIDDEN_USER: {
      code: 4010,
      message: "Forbidden user",
    },
    FORBIDDEN_PROJECT_ACCESS: {
      code: 4008,
      message: "You are not allowed to access this project",
    },
    USER_NOT_FOUND: {
      code: 4009,
      message: "User not found",
    },
  },
  VALIDATION: {
    TASK_NOT_FOUND: {
      code: 4110,
      message: "Task not found",
    },
    MEETING_NOT_FOUND: {
      code: 4111,
      message: "Meeting not found",
    },
    SPRINT_ID_REQUIRED: {
      code: 4112,
      message: "SprintId is required",
    },
    USER_STORY_NOT_FOUND: {
      code: 4112,
      message: "User Story not found",
    },
    REPORT_NOT_FOUND: {
      code: 4114,
      message: "Report not found",
    },

    INVALID_FILE_TYPE: {
      code: 4115,
      message: "Invalid file type , only pdf",
    },
    FILE_IS_MISSING: {
      code: 4116,
      message: "File is missing ",
    },
  },
  PROJECT: {
    PROJECT_EXISTS: {
      code: 4200,
      message: "Student already has a project",
    },
    ACADEMIC_SUPERVISOR_INVALID: {
      code: 4201,
      message: "Invalid academic supervisor",
    },
    COMPANY_SUPERVISOR_INVALID: {
      code: 4202,
      message: "Invalid company supervisor",
    },
    START_DATE_INVALID: {
      code: 4203,
      message: "Start date must be before end date",
    },
    NO_PROJECT: {
      code: 4204,
      message: "No project found",
    },
    CANNOT_REACTIVATE: {
      code: 4205,
      message: "Cannot reactivate this project because you already have an active project",
    },
  },
  USER_STORY: {
    NOT_FOUND: {
      code: 4300,
      message: "User story not found",
    },
    ALREADY_EXISTS: {
      code: 4301,
      message: "User story already exists",
    },
  },
  SPRINT: {
    INVALID_END_DATE: {
      code: 4400,
      message: "End date should be after start date",
    },
    ORDER_EXISTS: {
      code: 4401,
      message: "Order already exists",
    },
    SPRINT_NOTFOUND: {
      code: 4402,
      message: "Sprint not found",
    },
    NOT_FOUND: {
      code: 4500,
      message: "Sprint not found",
    },
  },
  REPORT: {
    MISSING_PROJECT_ID: {
      code: 4400,
      message: "Project ID missing in report data",
    },
  },

  STORAGE: {
    UPLOAD_FAILED: {
      code: 4400,
      message: "Upload failed",
    },
  },
  TASK: {
    NOT_FOUND: {
      code: 4400,
      message: "Task not found",
    },

    USER_STORY_NOT_FOUND: {
      code: 4403,
      message: "The referenced user story does not exist",
    },

    ASSIGNED_USER_NOT_FOUND: {
      code: 4405,
      message: "Assigned user not found",
    },

    INVALID_STATUS: {
      code: 4407,
      message: "Invalid task status",
    },

    TASK_ALREADY_COMPLETED: {
      code: 4408,
      message: "Task already completed",
    },

    ASSIGNED_USER_NOT_ALLOWED: {
      code: 4413,
      message: "User cannot be assigned to this task",
    },
    STATUS_CANNOT_BE_UPDATED: {
      code: 4413,
      message: "Status cannot be updated from this endpoint",
    },
    STATUS_ALREADY_SET: {
      code: 4413,
      message: "Task already has this status",
    },
    HISTORY_NOT_FOUND: {
      code: 4414,
      message: "Task history record not found",
    },
    INVALID_HISTORY_REQUEST: {
      code: 4415,
      message: "Invalid task history request",
    },
  },
} as const

export default errors
