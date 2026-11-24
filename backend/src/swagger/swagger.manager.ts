import { SwaggerModule, SwaggerTag } from "../swagger/swagger.types"

export class SwaggerManager {
  private modules: Map<string, SwaggerModule> = new Map()

  registerModule(moduleName: string, module: SwaggerModule): void {
    this.modules.set(moduleName, module)
  }

  getMergedSpec(): any {
    const baseSpec = {
      openapi: "3.0.0",
      info: {
        title: "API Gestion PFE",
        version: "1.0.0",
        description: "Documentation complète de l'API PFE - Toutes les équipes",
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
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {} as any,
        responses: {} as any,
      },
      tags: [] as SwaggerTag[],
      paths: {} as any,
    }

    // Fusionner tous les modules
    this.modules.forEach((module, moduleName) => {
      // Fusionner les paths
      baseSpec.paths = { ...baseSpec.paths, ...module.paths }

      // Fusionner les schémas
      baseSpec.components.schemas = {
        ...baseSpec.components.schemas,
        ...module.definitions,
      }

      // Ajouter les tags si spécifiés dans le module
      if (module.tags && module.tags.length > 0) {
        module.tags.forEach((tag) => {
          if (
            !baseSpec.tags.some((existingTag) => existingTag.name === tag.name)
          ) {
            baseSpec.tags.push(tag)
          }
        })
      } else {
        // Ajouter un tag par défaut pour le module
        const defaultTag: SwaggerTag = {
          name: moduleName,
          description: `Endpoints de ${moduleName}`,
        }

        if (!baseSpec.tags.some((tag) => tag.name === moduleName)) {
          baseSpec.tags.push(defaultTag)
        }
      }
    })

    return baseSpec
  }

  listModules(): string[] {
    return Array.from(this.modules.keys())
  }

  getModule(moduleName: string): SwaggerModule | undefined {
    return this.modules.get(moduleName)
  }
}

export const swaggerManager = new SwaggerManager()
