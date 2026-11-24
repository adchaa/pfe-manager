import { SwaggerModule } from "../swagger.types"

export const reportsSwagger: SwaggerModule = {
  paths: {
    "/api/report/report": {
      post: {
        tags: ["Reports (Uploaded Versions)"],
        summary: "Upload a Report (Create a new version)",
        description:
          "Only the Student is authorized. Requires the file (multipart) and metadata (projectId/notes).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  reportFile: {
                    type: "string",
                    format: "binary",
                    description: "Report file (PDF only).",
                  },
                  projectId: {
                    $ref: "#/components/schemas/ReportCreateMetadata/properties/projectId",
                  },
                  notes: {
                    $ref: "#/components/schemas/ReportCreateMetadata/properties/notes",
                  },
                },
                required: ["reportFile", "projectId"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Report successfully created and file stored",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReportResponse" },
              },
            },
          },
          "400": { description: "Bad Request (Missing file or invalid type)" },
          "403": { description: "Forbidden (Not the project student)" },
        },
      },

      get: {
        tags: ["Reports (Uploaded Versions)"],
        summary: "Get all reports associated with the user's projects",
        description: "Accessible by all project actors (Student, Supervisors).",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of reports retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ReportResponse" },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },

    "/api/rapport/report/{reportId}": {
      get: {
        tags: ["Reports (Uploaded Versions)"],
        summary: "View details of a report by ID",
        description: "Accessible by all project actors.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the ReportVersion document",
          },
        ],
        responses: {
          "200": {
            description: "Report retrieved successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReportResponse" },
              },
            },
          },
          "404": { description: "Report not found" },
        },
      },

      patch: {
        tags: ["Reports (Uploaded Versions)"],
        summary: "Update report metadata",
        description:
          "Only the user who uploaded the report is authorized to update metadata.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the ReportVersion document",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Report updated successfully" },
          "403": { description: "Forbidden (Not the report author)" },
          "404": { description: "Report not found" },
        },
      },

      delete: {
        tags: ["Reports (Uploaded Versions)"],
        summary: "Delete a report",
        description:
          "Only the user who uploaded the report is authorized to delete it.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the ReportVersion document",
          },
        ],
        responses: {
          "200": { description: "Report deleted successfully" },
          "403": { description: "Forbidden (Not the report author)" },
          "404": { description: "Report not found" },
        },
      },
    },
  },
  tags: [
    {
      name: "Reports (Uploaded Versions)",
      description:
        "Management of PDF report versions uploaded by the Student (/api/report/report)",
    },
  ],

  definitions: {
    ReportResponse: {
      type: "object",
      properties: {
        _id: { type: "string" },
        projectId: { type: "string" },
        versionNumber: {
          type: "integer",
          description:
            "Auto-incremented version number (Corrected type: integer)",
        },
        fileUrl: {
          type: "string",
          description: "URL of the stored file (e.g., Cloudinary URL)",
        },
        notes: {
          type: "string",
          description: "Accompanying notes for the report version",
        },
        uploadedBy: { $ref: "#/components/schemas/UserResponse" },
        createdAt: { type: "string", format: "date-time" },
      },
    },

    ReportCreateMetadata: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "ID of the project this report belongs to",
        },
        notes: {
          type: "string",
          description: "Notes or comments for the version.",
        },
      },
      required: ["projectId"],
    },

    ReportUpdate: {
      type: "object",
      properties: {
        notes: { type: "string", description: "New notes or comments." },
      },
    },
  },
}
