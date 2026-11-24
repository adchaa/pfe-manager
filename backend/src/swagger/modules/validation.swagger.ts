import { ValidationStatus } from "../../models/enums"
import { SwaggerModule } from "../swagger.types"

export const validationSwagger: SwaggerModule = {
  paths: {
    "/api/validations": {
      post: {
        tags: ["Validations"],
        summary: "Créer une nouvelle validation",
        description: "Permet de créer une nouvelle validation pour une tâche.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateValidationInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Validation créée avec succès",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationResponse",
                },
              },
            },
          },
          "400": {
            description: "Requête invalide",
          },
          "401": {
            description: "Non autorisé",
          },
        },
      },
    },
    "/api/validations/task/{taskId}": {
      get: {
        tags: ["Validations"],
        summary: "Obtenir les validations par ID de tâche",
        description:
          "Récupère toutes les validations pour une tâche spécifique.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID de la tâche",
          },
        ],
        responses: {
          "200": {
            description: "Liste des validations",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationsListResponse",
                },
              },
            },
          },
          "401": {
            description: "Non autorisé",
          },
        },
      },
    },
    "/api/validations/user-story/{userStoryId}": {
      get: {
        tags: ["Validations"],
        summary: "Obtenir les validations par ID de user story",
        description:
          "Récupère toutes les validations pour une user story spécifique.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userStoryId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID de la user story",
          },
        ],
        responses: {
          "200": {
            description: "Liste des validations",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationsListResponse",
                },
              },
            },
          },
          "401": {
            description: "Non autorisé",
          },
        },
      },
    },
    "/api/validations/sprint/{sprintId}": {
      get: {
        tags: ["Validations"],
        summary: "Obtenir les validations par ID de sprint",
        description:
          "Récupère toutes les validations pour un sprint spécifique.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "sprintId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID du sprint",
          },
        ],
        responses: {
          "200": {
            description: "Liste des validations",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationsListResponse",
                },
              },
            },
          },
          "401": {
            description: "Non autorisé",
          },
        },
      },
    },
    "/api/validations/{validationId}": {
      get: {
        tags: ["Validations"],
        summary: "Obtenir une validation par ID",
        description: "Récupère une validation spécifique par son identifiant.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "validationId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID de la validation",
          },
        ],
        responses: {
          "200": {
            description: "Validation trouvée",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationResponse",
                },
              },
            },
          },
          "401": {
            description: "Non autorisé",
          },
          "404": {
            description: "Validation non trouvée",
          },
        },
      },
    },
  },
  definitions: {
    Validation: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          example: "60d0fe4f5311236168a109ca",
        },
        taskId: {
          type: "string",
          example: "60d0fe4f5311236168a109cb",
        },
        validatorId: {
          type: "string",
          example: "60d0fe4f5311236168a109cc",
        },
        status: {
          type: "string",
          enum: Object.values(ValidationStatus),
          example: "APPROVED",
        },
        meetingId: {
          type: "string",
          example: "60d0fe4f5311236168a109cd",
        },
        note: {
          type: "string",
          example: "Cette validation nécessite une discussion.",
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
        },
      },
    },
    CreateValidationInput: {
      type: "object",
      required: ["taskId", "status"],
      properties: {
        taskId: {
          type: "string",
          example: "60d0fe4f5311236168a109cb",
        },
        status: {
          type: "string",
          enum: Object.values(ValidationStatus),
          example: "APPROVED",
        },
        meetingId: {
          type: "string",
          example: "60d0fe4f5311236168a109cd",
        },
        note: {
          type: "string",
          example: "Note optionnelle pour la validation.",
        },
      },
    },
    ValidationResponse: {
      type: "object",
      properties: {
        data: {
          $ref: "#/components/schemas/Validation",
        },
      },
    },
    ValidationsListResponse: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Validation",
          },
        },
      },
    },
  },
}
