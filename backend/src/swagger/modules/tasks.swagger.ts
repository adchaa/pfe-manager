import { SwaggerModule } from "../swagger.types"

export const tasksSwagger: SwaggerModule = {
  paths: {
    "/api/tasks": {
      post: {
        tags: ["Tasks"],
        summary: "Créer une tâche",
        description:
          "Permet à l'étudiant de créer une tâche dans une user story.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTaskInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Tâche créée avec succès",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          "400": {
            description: "Requête invalide (erreurs Zod ou règles métier)",
          },
          "401": { description: "Non authentifié" },
          "403": {
            description: "Seul l'étudiant du projet peut créer une tâche",
          },
          "404": { description: "User story non trouvée" },
        },
      },
    },

    "/api/tasks/userStory/{userStoryId}": {
      get: {
        tags: ["Tasks"],
        summary: "Récupérer les tâches d'une user story",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userStoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Liste des tâches",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TasksListResponse" },
              },
            },
          },
          "401": { description: "Non authentifié" },
          "404": { description: "User story non trouvée" },
        },
      },
    },

    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Obtenir une tâche par ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Tâche trouvée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          "401": { description: "Non authentifié" },
          "403": { description: "Accès refusé" },
          "404": { description: "Tâche non trouvée" },
        },
      },

      put: {
        tags: ["Tasks"],
        summary: "Modifier une tâche",
        description: "Permet de modifier tous les champs sauf le statut.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Tâche mise à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          "400": { description: "Requête invalide" },
          "401": { description: "Non authentifié" },
          "403": { description: "Accès refusé" },
          "404": { description: "Tâche non trouvée" },
        },
      },

      delete: {
        tags: ["Tasks"],
        summary: "Supprimer une tâche",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Tâche supprimée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "401": { description: "Non authentifié" },
          "403": { description: "Accès refusé" },
          "404": { description: "Tâche non trouvée" },
        },
      },
    },

    "/api/tasks/{id}/status": {
      patch: {
        tags: ["Tasks"],
        summary: "Changer le statut d'une tâche",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskStatusInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Statut mis à jour + historique enregistré",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          "400": { description: "Statut invalide ou déjà appliqué" },
          "401": { description: "Non authentifié" },
          "403": { description: "Accès refusé" },
          "404": { description: "Tâche non trouvée" },
        },
      },
    },
  },

  definitions: {
    Task: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        estimatedHours: { type: "number" },
        status: {
          type: "string",
          enum: ["TODO", "INPROGRESS", "STANDBY", "DONE"],
        },
        assignedId: { $ref: "#/components/schemas/User" },
        userStoryId: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
          },
        },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },

    CreateTaskInput: {
      type: "object",
      required: ["title", "userStoryId"],
      properties: {
        title: { type: "string", example: "Créer la page Login" },
        description: { type: "string", example: "UI + logique" },
        userStoryId: { type: "string", example: "69262d8e999a691ae1700d45" },
        estimatedHours: { type: "number", example: 5 },
        assignedId: { type: "string", example: "69262d8e999a691ae1700d3d" },
      },
    },

    UpdateTaskInput: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        estimatedHours: { type: "number" },
        assignedId: { type: "string" },
      },
    },

    UpdateTaskStatusInput: {
      type: "object",
      required: ["status"],
      properties: {
        status: {
          type: "string",
          enum: ["TODO", "INPROGRESS", "STANDBY", "DONE"],
        },
      },
    },

    TaskResponse: {
      type: "object",
      properties: {
        data: { $ref: "#/components/schemas/Task" },
      },
    },

    TasksListResponse: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Task" },
        },
      },
    },

    SuccessResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string" },
      },
    },
  },
}
