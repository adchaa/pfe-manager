import { SwaggerModule } from "../swagger.types"

export const projectsSwagger: SwaggerModule = {
  paths: {
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "Get all projects",
        description: "Retrieve the list of projects based on the user's role",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Projects retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectsListResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized (missing or invalid token)",
          },
          "403": {
            description: "Access denied",
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a new project",
        description: "Allows a student to create their PFE project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateProjectInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description:
              "Access denied (not a student or student already has a project)",
          },
        },
      },
    },

    "/api/projects/my-project": {
      get: {
        tags: ["Projects"],
        summary: "Get my project",
        description: "Retrieve the project for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Project retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "No project found for this user",
          },
        },
      },
    },

    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a project by ID",
        description: "Retrieve a specific project by its ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": {
            description: "Project found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description:
              "Access denied (user does not have access to this project)",
          },
          "404": {
            description: "Project not found",
          },
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Update an existing project",
        description: "Allows the student owner to update their project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateProjectInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Project updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid request",
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description: "Access denied (not the owner of the project)",
          },
          "404": {
            description: "Project not found",
          },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        description: "Allows the student owner to delete their project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": {
            description: "Project deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description: "Access denied (not the owner of the project)",
          },
          "404": {
            description: "Project not found",
          },
        },
      },
    },

    "/api/projects/{id}/archive": {
      patch: {
        tags: ["Projects"],
        summary: "Archive a project",
        description: "Allows the student owner to archive their project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": {
            description: "Project archived successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProjectResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description: "Access denied (not the owner of the project)",
          },
          "404": {
            description: "Project not found",
          },
        },
      },
    },
  },

  definitions: {
    Project: {
      type: "object",
      properties: {
        _id: { type: "string", example: "507f1f77bcf86cd799439011" },
        title: { type: "string", example: "PFE Management Application" },
        description: {
          type: "string",
          example:
            "Development of a full platform for managing end-of-study projects",
        },
        state: {
          type: "string",
          enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
          example: "ACTIVE",
        },
        academicSupervisor: { $ref: "#/components/schemas/User" },
        companySupervisor: { $ref: "#/components/schemas/User" },
        student: { $ref: "#/components/schemas/User" },
        startDate: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T00:00:00.000Z",
        },
        endDate: {
          type: "string",
          format: "date-time",
          example: "2024-06-15T00:00:00.000Z",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },

    CreateProjectInput: {
      type: "object",
      required: [
        "title",
        "description",
        "academicSupervisor",
        "companySupervisor",
        "startDate",
        "endDate",
      ],
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 100,
          example: "PFE Management Application",
        },
        description: {
          type: "string",
          minLength: 1,
          maxLength: 1000,
          example: "Development of a platform to manage PFE projects lifecycle",
        },
        academicSupervisor: {
          type: "string",
          example: "507f1f77bcf86cd799439011",
          description: "University supervisor ID",
        },
        companySupervisor: {
          type: "string",
          example: "507f1f77bcf86cd799439012",
          description: "Company supervisor ID",
        },
        startDate: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T00:00:00.000Z",
        },
        endDate: {
          type: "string",
          format: "date-time",
          example: "2024-06-15T00:00:00.000Z",
        },
      },
    },

    UpdateProjectInput: {
      type: "object",
      properties: {
        title: {
          type: "string",
          example: "Updated PFE Management Application",
        },
        description: {
          type: "string",
          example: "Updated project description",
        },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        state: {
          type: "string",
          enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
        },
      },
    },

    User: {
      type: "object",
      properties: {
        _id: { type: "string", example: "507f1f77bcf86cd799439011" },
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        email: {
          type: "string",
          format: "email",
          example: "john.doe@example.com",
        },
        role: {
          type: "string",
          enum: ["STUDENT", "UNIVERSITY_SUPERVISOR", "COMPANY_SUPERVISOR"],
          example: "STUDENT",
        },
      },
    },

    ProjectResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: { $ref: "#/components/schemas/Project" },
      },
    },

    ProjectsListResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Project" },
        },
        count: { type: "number", example: 1 },
      },
    },

    SuccessResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Project deleted successfully" },
      },
    },

    ErrorResponse: {
      type: "object",
      properties: {
        error: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: {
              type: "object",
              properties: {
                code: { type: "number", example: 4000 },
                message: { type: "string", example: "Internal server error" },
              },
            },
            message: {
              type: "object",
              properties: {
                code: { type: "number", example: 4000 },
                message: { type: "string", example: "Internal server error" },
              },
            },
          },
        },
      },
    },
  },
}
