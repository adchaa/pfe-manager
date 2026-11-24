import { SwaggerModule } from "../swagger.types"

export const authSwagger: SwaggerModule = {
  paths: {
    "/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create a new user account",
        description: "Allows a user to register with a specific role",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "User successfully registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "400": {
            description: "Invalid request or email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { description: "Internal server error" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description:
          "Authenticates a user and returns a JWT token + refresh token stored in a cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { description: "Internal server error" },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh JWT token",
        description:
          "Generates a new JWT token using the refresh token stored in cookies",
        responses: {
          "200": {
            description: "Token successfully refreshed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshTokenResponse" },
              },
            },
          },
          "400": {
            description: "Refresh token missing in cookies",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { description: "Internal server error" },
        },
      },
    },
    "/auth/accounts": {
      get: {
        tags: ["Authentication"],
        summary: "Get all user accounts",
        description:
          "Retrieves the list of all users (authentication required)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Users retrieved successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UsersListResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized (missing or invalid token)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { description: "Internal server error" },
        },
      },
    },
  },

  definitions: {
    SignupInput: {
      type: "object",
      required: ["firstName", "lastName", "email", "password", "role"],
      properties: {
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        email: {
          type: "string",
          format: "email",
          example: "john.doe@example.com",
        },
        password: { type: "string", example: "password123" },
        role: {
          type: "string",
          enum: ["STUDENT", "ACADEMIC_SUPERVISOR", "COMPANY_SUPERVISOR"],
          example: "STUDENT",
        },
      },
    },

    LoginInput: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: {
          type: "string",
          format: "email",
          example: "john.doe@example.com",
        },
        password: { type: "string", example: "password123" },
      },
    },

    LoginResponse: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "JWT token valid for 15 minutes",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        user: { $ref: "#/components/schemas/User" },
      },
    },

    RefreshTokenResponse: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "New JWT token valid for 15 minutes",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      },
    },

    UsersListResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/User" },
        },
        count: { type: "number", example: 5 },
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
          enum: ["STUDENT", "ACADEMIC_SUPERVISOR", "COMPANY_SUPERVISOR"],
          example: "STUDENT",
        },
        isActive: { type: "boolean", example: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
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
                code: { type: "number", example: 4001 },
                message: { type: "string", example: "Email already exists" },
              },
            },
            message: {
              type: "object",
              properties: {
                code: { type: "number", example: 4001 },
                message: { type: "string", example: "Email already exists" },
              },
            },
          },
        },
      },
    },
  },
}
