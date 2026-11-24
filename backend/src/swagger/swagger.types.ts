export interface SwaggerPath {
  [path: string]: {
    [method: string]: SwaggerOperation
  }
}

export interface SwaggerOperation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: SwaggerParameter[]
  requestBody?: SwaggerRequestBody
  responses: SwaggerResponses
  security?: SwaggerSecurity[]
}

export interface SwaggerParameter {
  name: string
  in: "path" | "query" | "header" | "cookie"
  required?: boolean
  schema: SwaggerSchema
  description?: string
  example?: any
}

export interface SwaggerRequestBody {
  required?: boolean
  description?: string
  content: {
    [mediaType: string]: {
      schema: SwaggerSchema
    }
  }
}

export interface SwaggerResponses {
  [statusCode: string]: SwaggerResponse
}

export interface SwaggerResponse {
  description: string
  content?: {
    [mediaType: string]: {
      schema: SwaggerSchema
    }
  }
}

export interface SwaggerSchema {
  // Propriétés de base
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object"
  format?: string
  $ref?: string

  // Propriétés pour les strings
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]
  example?: any
  description?: string

  // Propriétés pour les numbers
  minimum?: number
  maximum?: number

  // Propriétés pour les arrays
  items?: SwaggerSchema

  // Propriétés pour les objects
  properties?: { [key: string]: SwaggerSchema }
  required?: string[]
  additionalProperties?: boolean | SwaggerSchema

  // Autres propriétés
  nullable?: boolean
  default?: any
  readOnly?: boolean
  writeOnly?: boolean
  deprecated?: boolean
}

export interface SwaggerSecurity {
  [securityScheme: string]: string[]
}

export interface SwaggerDefinition {
  [definitionName: string]: SwaggerSchema
}

export interface SwaggerModule {
  paths: SwaggerPath
  definitions: SwaggerDefinition
  tags?: SwaggerTag[]
}

export interface SwaggerTag {
  name: string
  description: string
}
