import { SwaggerModule } from "../swagger.types"

export const sprintSwagger: SwaggerModule = {
  paths: {
    "/api/sprints": {
      post: {
        tags: ["Sprints"],
        summary: "Create a new sprint",
        description: "Create a sprint for a project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSprintInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Sprint created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SprintResponse" },
              },
            },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/api/sprints/project/{projectId}": {
      get: {
        tags: ["Sprints"],
        summary: "Get sprints by project",
        description: "Retrieve all sprints belonging to a project",
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
            description: "Sprints retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sprints: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Sprint" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/api/sprints/{id}": {
      get: {
        tags: ["Sprints"],
        summary: "Get sprint by ID",
        description: "Retrieve a sprint by its identifier",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Sprint ID",
          },
        ],
        responses: {
          "200": {
            description: "Sprint found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SprintResponse" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Sprint not found" },
        },
      },
      put: {
        tags: ["Sprints"],
        summary: "Update a sprint",
        description: "Update sprint details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Sprint ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSprintInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Sprint updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SprintResponse" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Sprint not found" },
        },
      },
      delete: {
        tags: ["Sprints"],
        summary: "Delete sprint",
        description: "Remove a sprint permanently",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            schema: { type: "string" },
            required: true,
            description: "Sprint ID",
          },
        ],
        responses: {
          "200": {
            description: "Sprint deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Sprint not found" },
        },
      },
    },
  },

  definitions: {
    Sprint: {
      type: "object",
      properties: {
        _id: { type: "string", example: "678abcde9012fd1234567890" },
        projectId: { type: "string", example: "507f1f77bcf86cd799439011" },
        title: { type: "string", example: "Sprint 1" },
        startDate: {
          type: "string",
          format: "date-time",
          example: "2024-01-10T00:00:00.000Z",
        },
        endDate: {
          type: "string",
          format: "date-time",
          example: "2024-01-20T00:00:00.000Z",
        },
        order: { type: "number", example: 1 },
        status: {
          type: "string",
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          example: "TODO",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },

    CreateSprintInput: {
      type: "object",
      required: ["title", "startDate", "endDate", "order", "projectId"],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        order: { type: "number", example: 1 },
        projectId: { type: "string" },
      },
    },

    UpdateSprintInput: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        order: { type: "number", example: 1 },
        status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
      },
    },

    SprintResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: { $ref: "#/components/schemas/Sprint" },
      },
    },

    SuccessResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Operation completed successfully",
        },
      },
    },
  },
}
