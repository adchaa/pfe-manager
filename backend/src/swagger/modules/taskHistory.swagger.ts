import { SwaggerModule } from "../swagger.types"

export const taskHistorySwagger: SwaggerModule = {
  tags: [
    {
      name: "TaskHistory",
      description: "Historique des changements de statut des tâches",
    },
  ],

  paths: {
    "/api/task-history/task/{taskId}": {
      get: {
        tags: ["TaskHistory"],
        summary: "Récupérer l'historique d'une tâche",
        description:
          "Retourne tout l'historique des changements de statut associés à une tâche.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID de la tâche",
          },
        ],
        responses: {
          "200": {
            description: "Historique récupéré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TaskHistory" },
                },
              },
            },
          },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
          "404": { description: "Tâche non trouvée" },
        },
      },
    },

    "/api/task-history/{historyId}": {
      get: {
        tags: ["TaskHistory"],
        summary: "Récupérer un enregistrement historique",
        description: "Retourne un seul historique de changement de statut.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "historyId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID de l'historique",
          },
        ],
        responses: {
          "200": {
            description: "Historique trouvé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskHistory" },
              },
            },
          },
          "401": { description: "Non autorisé" },
          "404": { description: "Historique non trouvé" },
        },
      },
    },
  },

  definitions: {
    TaskHistory: {
      type: "object",
      properties: {
        _id: { type: "string" },
        taskId: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            status: { type: "string" },
          },
        },
        fromStatus: {
          type: "string",
          enum: ["TODO", "INPROGRESS", "STANDBY", "DONE"],
        },
        toStatus: {
          type: "string",
          enum: ["TODO", "INPROGRESS", "STANDBY", "DONE"],
        },
        changedBy: {
          type: "object",
          properties: {
            _id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
          },
        },
        reason: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
}
