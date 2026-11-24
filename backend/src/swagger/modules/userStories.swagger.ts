import { SwaggerModule } from "../swagger.types"

export const userStoriesSwagger: SwaggerModule = {
  paths: {
    "/api/user-stories": {
      get: {
        tags: ["User Stories"],
        summary: "Retrieve the list of user stories",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List successfully retrieved" },
        },
      },
      post: {
        tags: ["User Stories"],
        summary: "Create a new user story",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserStoryInput" },
            },
          },
        },
        responses: {
          "201": { description: "User story successfully created" },
        },
      },
    },
    "/api/user-stories/{id}": {
      get: {
        tags: ["User Stories"],
        summary: "Get a user story by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User story found" },
          "404": { description: "User story not found" },
        },
      },
      put: {
        tags: ["User Stories"],
        summary: "Update a user story",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserStoryInput" },
            },
          },
        },
        responses: {
          "200": { description: "User story updated successfully" },
          "404": { description: "User story not found" },
        },
      },
      delete: {
        tags: ["User Stories"],
        summary: "Delete a user story",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User story deleted successfully" },
          "404": { description: "User story not found" },
        },
      },
    },
  },
  definitions: {
    CreateUserStoryInput: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "number", default: 0 },
        sprintId: { type: "string" },
      },
      required: ["title"],
    },
    UpdateUserStoryInput: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "number" },
        sprintId: { type: "string" },
      },
    },
  },
}
