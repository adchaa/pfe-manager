import { SwaggerModule } from "../swagger.types"

export const htmlreportsSwagger: SwaggerModule = {
  paths: {
    "/api/reports/projects/{projectId}/sprints/{sprintId}/report": {
      get: {
        tags: ["Rapports"],
        summary: "Générer un rapport JSON pour un sprint spécifique",
        description:
          "Génère un rapport JSON détaillé pour un sprint donné avec les statistiques, user stories et tâches. **Accès réservé aux étudiants uniquement.**",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            description: "ID du projet",
          },
          {
            name: "sprintId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
            },
            description: "ID du sprint",
          },
        ],
        responses: {
          "200": {
            description: "Rapport JSON généré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    data: {
                      $ref: "#/definitions/SprintReport"
                    }
                  }
                }
              },
            },
          },
          "400": {
            description: "Données d'entrée invalides",
          },
          "401": {
            description: "Non authentifié",
          },
          "403": {
            description:
              "Accès interdit - Réservé aux étudiants uniquement ou non autorisé à accéder à ce projet",
          },
          "404": {
            description: "Projet ou sprint non trouvé",
          },
          "500": {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
    "/api/reports/projects/{projectId}/global-report": {
      get: {
        tags: ["Rapports"],
        summary: "Générer un rapport JSON global du projet",
        description:
          "Génère un rapport JSON complet avec toutes les informations du projet. Inclut les sprints, user stories, tâches, réunions et statistiques globales. **Accès réservé aux étudiants uniquement.**",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            description: "ID du projet",
          },
        ],
        responses: {
          "200": {
            description: "Rapport JSON global généré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    data: {
                      $ref: "#/definitions/GlobalReport"
                    }
                  }
                }
              },
            },
          },
          "400": {
            description: "Données d'entrée invalides",
          },
          "401": {
            description: "Non authentifié",
          },
          "403": {
            description:
              "Accès interdit - Réservé aux étudiants uniquement ou non autorisé à accéder à ce projet",
          },
          "404": {
            description: "Projet non trouvé",
          },
          "500": {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
  },
  definitions: {
    SprintReport: {
      type: "object",
      properties: {
        project: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            title: { type: "string", example: "Projet PFE 2024" },
            description: { type: "string", example: "Description du projet" }
          }
        },
        sprint: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439012" },
            title: { type: "string", example: "Sprint 1" },
            status: { type: "string", example: "IN_PROGRESS" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            order: { type: "number", example: 1 }
          }
        },
        statistics: {
          type: "object",
          properties: {
            totalTasks: { type: "number", example: 15 },
            doneTasks: { type: "number", example: 10 },
            inProgressTasks: { type: "number", example: 3 },
            standbyTasks: { type: "number", example: 1 },
            todoTasks: { type: "number", example: 1 },
            progress: { type: "number", example: 67 },
            userStoriesCount: { type: "number", example: 5 }
          }
        },
        userStories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string" },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string" },
                    estimatedHours: { type: "number" },
                    assignedTo: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        generatedAt: { type: "string", format: "date-time" }
      }
    },
    GlobalReport: {
      type: "object",
      properties: {
        project: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            state: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            team: {
              type: "object",
              properties: {
                student: { type: "object" },
                academicSupervisor: { type: "object" },
                companySupervisor: { type: "object" }
              }
            }
          }
        },
        statistics: {
          type: "object",
          properties: {
            global: {
              type: "object",
              properties: {
                totalTasks: { type: "number", example: 45 },
                doneTasks: { type: "number", example: 30 },
                inProgressTasks: { type: "number", example: 8 },
                standbyTasks: { type: "number", example: 4 },
                todoTasks: { type: "number", example: 3 },
                progress: { type: "number", example: 67 },
                sprintsCount: { type: "number", example: 3 },
                userStoriesCount: { type: "number", example: 12 },
                meetingsCount: { type: "number", example: 8 },
                totalEstimatedHours: { type: "number", example: 120 },
                completedHours: { type: "number", example: 85 }
              }
            },
            byStatus: {
              type: "object",
              properties: {
                done: { type: "number", example: 30 },
                inProgress: { type: "number", example: 8 },
                standby: { type: "number", example: 4 },
                todo: { type: "number", example: 3 }
              }
            }
          }
        },
        sprints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              status: { type: "string" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
              order: { type: "number" },
              statistics: {
                type: "object",
                properties: {
                  totalTasks: { type: "number" },
                  doneTasks: { type: "number" },
                  progress: { type: "number" },
                  userStoriesCount: { type: "number" }
                }
              }
            }
          }
        },
        userStories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string" },
              sprintId: { type: "string" },
              sprintTitle: { type: "string" },
              statistics: {
                type: "object",
                properties: {
                  totalTasks: { type: "number" },
                  doneTasks: { type: "number" },
                  progress: { type: "number" }
                }
              },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string" },
                    estimatedHours: { type: "number" }
                  }
                }
              }
            }
          }
        },
        meetings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              plannedDate: { type: "string", format: "date-time" },
              status: { type: "string" },
              plannedBy: { type: "object" },
              createdAt: { type: "string", format: "date-time" }
            }
          }
        },
        generatedAt: { type: "string", format: "date-time" }
      }
    }
  },
  tags: [
    {
      name: "Rapports",
      description: "Endpoints pour la génération de rapports JSON",
    },
  ],
}