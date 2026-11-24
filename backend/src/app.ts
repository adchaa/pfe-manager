import express, { NextFunction, Request, Response } from "express"
import { swaggerUi, getFullSwaggerSpec } from "./swagger/swagger"
import { swaggerManager } from "./swagger/swagger.manager"
import { projectsSwagger } from "./swagger/modules/projects.swagger"
import { authSwagger } from "./swagger/modules/auth.swagger"
import { tasksSwagger } from "./swagger/modules/tasks.swagger"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routers/auth.routes"
import projectRoutes from "./routers/project.routes"
import sprintRoutes from "./routers/sprint.routes"
import { randomUUID } from "crypto"
import { HttpError } from "./util/httpError"
import errors from "./util/errorsContants"
import { env } from "./config/env"
import { authMiddleware } from "./middlewares/auth.middleware"
import validationRouter from "./routers/validation.routes"
import userStoryRouter from "./routers/userStory.routes"
import meetingRoutes from "./routers/meeting.routes"
import reportRoutes from "./routers/report.routes"
import taskRouter from "./routers/tasks.routes"
import htmlReportRoutes from "./routers/htmlReport.routes"
import taskHistoryRouter from "./routers/TaskHistory.routes"
import { validationSwagger } from "./swagger/modules/validation.swagger"
import { sprintSwagger } from "./swagger/modules/sprint.swagger"
import { taskHistorySwagger } from "./swagger/modules/taskHistory.swagger"
import { htmlreportsSwagger } from "./swagger/modules/htmlreports.swagger"
import dashboardRoutes from "./routers/dashboard.routes"
import { dashboardSwagger } from "./swagger/modules/dashboard.swagger"
import { meetingSwagger } from "./swagger/modules/meeting.swagger"

const app = express()

swaggerManager.registerModule("Projects", projectsSwagger)
swaggerManager.registerModule("Validations", validationSwagger)
swaggerManager.registerModule("Authentication", authSwagger)
swaggerManager.registerModule("Sprints", sprintSwagger)
swaggerManager.registerModule("Tasks", tasksSwagger)
swaggerManager.registerModule("TaskHistory", taskHistorySwagger)
swaggerManager.registerModule("Rapports Html", htmlreportsSwagger)
swaggerManager.registerModule("Dashboard", dashboardSwagger)
swaggerManager.registerModule("Meetings", meetingSwagger)

const fullSpec = getFullSwaggerSpec()

const swaggerOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "API Gestion PFE - Documentation",
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(fullSpec, swaggerOptions))

app.get("/api-docs/json", (req, res) => {
  res.json(fullSpec)
})

app.get("/api-docs/modules", (req, res) => {
  const modules = swaggerManager.listModules()
  res.json({
    success: true,
    data: {
      modules,
      count: modules.length,
      timestamp: new Date().toISOString(),
    },
  })
})

// app.use(cors())
app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true,                 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)

app.use(authMiddleware)

app.use("/api/validation", validationRouter)
app.use("/api/projects", projectRoutes)
app.use("/api/sprints", sprintRoutes)
app.use("/api/user-stories", userStoryRouter)
app.use("/api/meetings", meetingRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/tasks", taskRouter)
app.use("/api/task-history", taskHistoryRouter)
app.use("/api/html-reports", htmlReportRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode)
    res.json({
      error: {
        id: randomUUID(),
        code: error.code,
        message: error.message,
        stack: env.NODE_ENV !== "production" ? error.stack : null,
      },
    })
  } else {
    res.status(500)
    res.json({
      error: {
        id: randomUUID(),
        code: errors.INTERNAL_SERVER_ERROR,
        message: errors.INTERNAL_SERVER_ERROR,
        stack: env.NODE_ENV !== "production" ? error.stack : null,
      },
    })
  }
})

export default app
