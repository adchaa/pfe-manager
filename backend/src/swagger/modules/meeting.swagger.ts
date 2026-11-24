import { MeetingStatus, RefModel } from "../../models/enums"
import { SwaggerModule } from "../swagger.types"

export const meetingSwagger: SwaggerModule = {
  paths: {
    "/api/meetings": {
      post: {
        tags: ["Meetings"],
        summary: "Créer un nouveau meeting",
        description: "Planifier / créer un meeting pour un projet.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/CreateMeetingInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Meeting créé avec succès",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingResponse" },
              },
            },
          },
          "400": { description: "Requête invalide" },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
        },
      },
      get: {
        tags: ["Meetings"],
        summary: "Lister les meetings",
        description:
          "Récupère la liste des meetings accessibles pour l'utilisateur connecté.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "projectId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filtrer par projectId",
          },
        ],
        responses: {
          "200": {
            description: "Liste des meetings",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingsListResponse" },
              },
            },
          },
          "401": { description: "Non autorisé" },
        },
      },
    },
    "/api/meetings/{id}": {
      get: {
        tags: ["Meetings"],
        summary: "Obtenir un meeting par ID",
        description: "Récupère un meeting spécifique par son identifiant.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID du meeting",
          },
        ],
        responses: {
          "200": {
            description: "Meeting trouvé",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingResponse" },
              },
            },
          },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
          "404": { description: "Meeting non trouvé" },
        },
      },
      delete: {
        tags: ["Meetings"],
        summary: "Supprimer un meeting",
        description: "Supprime un meeting par son ID (étudiant uniquement).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID du meeting",
          },
        ],
        responses: {
          "200": {
            description: "Meeting supprimé",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingResponse" },
              },
            },
          },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
          "404": { description: "Meeting non trouvé" },
        },
      },
      patch: {
        tags: ["Meetings"],
        summary: "Mettre à jour un meeting (étudiant)",
        description:
          "Met à jour les informations d'un meeting (utilisé par le rôle étudiant).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID du meeting",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/UpdateMeetingInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Meeting mis à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingResponse" },
              },
            },
          },
          "400": { description: "Requête invalide" },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
          "404": { description: "Meeting non trouvé" },
        },
      },
    },
    "/api/meetings/{id}/validate": {
      patch: {
        tags: ["Meetings"],
        summary: "Valider un meeting (encadrant universitaire)",
        description:
          "Valide un meeting — réservé au rôle encadrant universitaire.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID du meeting à valider",
          },
        ],
        responses: {
          "200": {
            description: "Meeting validé",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/MeetingResponse" },
              },
            },
          },
          "401": { description: "Non autorisé" },
          "403": { description: "Accès refusé" },
          "404": { description: "Meeting non trouvé" },
        },
      },
    },
  },
  definitions: {
    Reference: {
      type: "object",
      required: ["referredToId", "referredToModel"],
      properties: {
        referredToId: { type: "string", example: "60d0fe4f5311236168a109aa" },
        referredToModel: {
          type: "string",
          enum: Object.values(RefModel),
          example: Object.values(RefModel)[0],
        },
      },
    },
    Meeting: {
      type: "object",
      properties: {
        _id: { type: "string", example: "60d0fe4f5311236168a109bb" },
        projectId: { type: "string", example: "60d0fe4f5311236168a109cc" },
        title: { type: "string", example: "Réunion de planification" },
        plannedDate: {
          type: "string",
          format: "date-time",
          example: "2025-12-10T09:00:00Z",
        },
        status: {
          type: "string",
          enum: Object.values(MeetingStatus),
          example: Object.values(MeetingStatus)[0],
        },
        refs: {
          type: "array",
          items: { $ref: "#/definitions/Reference" },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    CreateMeetingInput: {
      type: "object",
      required: ["projectId", "title", "plannedDate", "status"],
      properties: {
        projectId: { type: "string", example: "60d0fe4f5311236168a109cc" },
        title: { type: "string", example: "Réunion de planification" },
        plannedDate: {
          type: "string",
          format: "date-time",
          example: "2025-10-10T09:00:00Z",
        },
        status: {
          type: "string",
          enum: Object.values(MeetingStatus),
          example: Object.values(MeetingStatus)[0],
        },
        refs: {
          type: "array",
          items: { $ref: "#/definitions/Reference" },
        },
      },
    },
    UpdateMeetingInput: {
      type: "object",
      properties: {
        projectId: { type: "string", example: "60d0fe4f5311236168a109cc" },
        title: { type: "string", example: "Titre mis à jour" },
        plannedDate: {
          type: "string",
          format: "date-time",
          example: "2025-10-11T09:00:00Z",
        },
        status: {
          type: "string",
          enum: Object.values(MeetingStatus),
          example: Object.values(MeetingStatus)[0],
        },
        refs: {
          type: "array",
          items: { $ref: "#/definitions/Reference" },
        },
      },
    },
    MeetingResponse: {
      type: "object",
      properties: {
        data: { $ref: "#/definitions/Meeting" },
      },
    },
    MeetingsListResponse: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/definitions/Meeting" },
        },
      },
    },
  },
}
