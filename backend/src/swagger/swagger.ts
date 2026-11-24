import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerManager } from "./swagger.manager"

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gestion PFE",
      version: "1.0.0",
      description: "Documentation complète de l'API PFE",
      contact: {
        name: "Équipe PFE",
        email: "pfe@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
}

const baseSwaggerSpec = swaggerJSDoc(swaggerOptions)

export const getFullSwaggerSpec = () => {
  const mergedSpec = swaggerManager.getMergedSpec()

  return {
    ...baseSwaggerSpec,
    ...mergedSpec,
  }
}

export { swaggerUi }
