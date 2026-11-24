import { SwaggerModule } from "../swagger.types"

export const dashboardSwagger: SwaggerModule = {
  paths: {
    "/api/dashboard/timeline": {
      get: {
        tags: ["Dashboard"],
        summary: "Get user timeline",
        description: "Retrieve chronological timeline of events across all user's projects",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Timeline retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TimelineResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/overview": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard overview",
        description: "Retrieve comprehensive overview of user's projects with statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Overview retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DashboardOverviewResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/project/{projectId}": {
      get: {
        tags: ["Dashboard"],
        summary: "Get project statistics",
        description: "Retrieve detailed statistics for a specific project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": {
            description: "Project statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectStatsResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Project not found" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/sprints/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get sprints statistics",
        description: "Retrieve statistics for all sprints across user's projects",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Sprints statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SprintsStatsResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/sprint/{sprintId}": {
      get: {
        tags: ["Dashboard"],
        summary: "Get sprint details",
        description: "Retrieve detailed information for a specific sprint",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "sprintId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Sprint ID",
          },
        ],
        responses: {
          "200": {
            description: "Sprint details retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SprintDetailsResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Sprint not found" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get projects summary",
        description: "Retrieve summary statistics of user's projects",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Projects summary retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectsSummaryResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/dashboard/active-projects": {
      get: {
        tags: ["Dashboard"],
        summary: "Get active projects",
        description: "Retrieve list of projects with active sprints",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Active projects retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ActiveProjectsResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal server error" },
        },
      },
    },
  },

  definitions: {
    ProjectMember: {
      type: "object",
      properties: {
        _id: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
      },
    },

    BasicProjectInfo: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
      },
    },

    TimelineEvent: {
      type: "object",
      properties: {
        _id: { type: "string" },
        type: { type: "string" },
        date: { type: "string", format: "date-time" },
        title: { type: "string" },
        projectId: { type: "string" },
      },
    },

    ProjectStats: {
      type: "object",
      properties: {
        totalTasks: { type: "number" },
        completedTasks: { type: "number" },
        tasksInProgress: { type: "number" },
        tasksBlocked: { type: "number" },
        tasksTodo: { type: "number" },
        completionPercentage: { type: "number" },
        totalSprints: { type: "number" },
        upcomingMeetings: { type: "number" },
        recentReports: { type: "number" },
        activeSprints: { type: "number" },
      },
    },

    ProjectWithStats: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        state: { type: "string" },
        student: { $ref: "#/components/schemas/ProjectMember" },
        companySupervisor: { $ref: "#/components/schemas/ProjectMember" },
        academicSupervisor: { $ref: "#/components/schemas/ProjectMember" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        stats: { $ref: "#/components/schemas/ProjectStats" },
        activeSprints: { type: "number" },
      },
    },

    TimelineResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            timeline: {
              type: "array",
              items: { $ref: "#/components/schemas/TimelineEvent" },
            },
            projects: {
              type: "array",
              items: { $ref: "#/components/schemas/BasicProjectInfo" },
            },
          },
        },
      },
    },

    DashboardOverviewResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            projects: {
              type: "array",
              items: { $ref: "#/components/schemas/ProjectWithStats" },
            },
            overallStats: {
              type: "object",
              properties: {
                totalProjects: { type: "number" },
                totalSprints: { type: "number" },
                totalTasks: { type: "number" },
                completedTasks: { type: "number" },
                tasksInProgress: { type: "number" },
                tasksBlocked: { type: "number" },
                tasksTodo: { type: "number" },
                completionPercentage: { type: "number" },
                pendingValidations: { type: "number" },
                upcomingMeetings: { type: "number" },
                recentReportVersions: { type: "number" },
              },
            },
            upcomingMeetings: {
              type: "array",
              items: { type: "object" },
            },
            recentReportVersions: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
    },

    TaskByStatus: {
      type: "object",
      properties: {
        _id: { type: "string" },
        count: { type: "number" },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              title: { type: "string" },
              userStoryId: { type: "string" },
              sprintId: { type: "string" },
            },
          },
        },
      },
    },

    ValidationSummary: {
      type: "object",
      properties: {
        validated: { type: "number" },
        pending: { type: "number" },
      },
    },

    UserStoryStats: {
      type: "object",
      properties: {
        _id: { type: "string" },
        userStoryTitle: { type: "string" },
        sprintId: { type: "string" },
        sprintTitle: { type: "string" },
        totalTasks: { type: "number" },
        completedTasks: { type: "number" },
        tasksInProgress: { type: "number" },
        tasksBlocked: { type: "number" },
      },
    },

    SprintStats: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        order: { type: "number" },
        status: { type: "string" },
        projectId: { type: "string" },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        totalUserStories: { type: "number" },
        totalTasks: { type: "number" },
        completedTasks: { type: "number" },
        completionPercentage: { type: "number" },
      },
    },

    ProjectStatsResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            project: { $ref: "#/components/schemas/ProjectWithStats" },
            stats: {
              type: "object",
              properties: {
                totalSprints: { type: "number" },
                totalUserStories: { type: "number" },
                totalTasks: { type: "number" },
                tasksByStatus: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TaskByStatus" },
                },
                validationsSummary: { $ref: "#/components/schemas/ValidationSummary" },
                totalMeetings: { type: "number" },
                totalReportVersions: { type: "number" },
              },
            },
            sprints: {
              type: "array",
              items: { $ref: "#/components/schemas/SprintStats" },
            },
            userStories: {
              type: "array",
              items: { $ref: "#/components/schemas/UserStoryStats" },
            },
            recentMeetings: {
              type: "array",
              items: { type: "object" },
            },
            recentReportVersions: {
              type: "array",
              items: { type: "object" },
            },
            validations: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
    },

    SprintsStatsResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            sprintsStats: {
              type: "array",
              items: { $ref: "#/components/schemas/SprintStats" },
            },
            projects: {
              type: "array",
              items: { $ref: "#/components/schemas/BasicProjectInfo" },
            },
          },
        },
      },
    },

    SprintDetails: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        order: { type: "number" },
        status: { type: "string" },
        projectId: { type: "string" },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
      },
    },

    TaskStatusCount: {
      type: "object",
      properties: {
        status: { type: "string" },
        count: { type: "number" },
      },
    },

    SprintDetailsResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            sprint: { $ref: "#/components/schemas/SprintDetails" },
            userStories: {
              type: "array",
              items: { $ref: "#/components/schemas/UserStoryStats" },
            },
            tasksByStatus: {
              type: "array",
              items: { $ref: "#/components/schemas/TaskStatusCount" },
            },
          },
        },
      },
    },

    ProjectsSummaryResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            totalProjects: { type: "number" },
            activeSprints: { type: "number" },
            totalTasks: { type: "number" },
            completionRate: { type: "number" },
            pendingValidations: { type: "number" },
            upcomingMeetings: { type: "number" },
            recentReports: { type: "number" },
          },
        },
      },
    },

    ActiveProject: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        state: { type: "string" },
        student: { $ref: "#/components/schemas/ProjectMember" },
        companySupervisor: { $ref: "#/components/schemas/ProjectMember" },
        academicSupervisor: { $ref: "#/components/schemas/ProjectMember" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        activeSprints: { type: "number" },
        totalSprints: { type: "number" },
        completionRate: { type: "number" },
      },
    },

    ActiveProjectsResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            activeProjects: {
              type: "array",
              items: { $ref: "#/components/schemas/ActiveProject" },
            },
            totalActiveProjects: { type: "number" },
          },
        },
      },
    },

    ErrorResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        error: { type: "string" },
      },
    },
  },
}