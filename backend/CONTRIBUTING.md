# Project Conventions

This document outlines the conventions and best practices to follow when working on this project.

## Directory Structure

The `src` directory is organized as follows:

- `app.ts`: The main application entry point.
- `server.ts`: The server setup.
- `config`: Configuration files (e.g., environment variables).
- `controllers`: Request handlers that interact with services and send responses.
- `middlewares`: Express middleware for tasks like authentication and validation.
- `models`: TypeScript interfaces and type definitions for data structures.
- `routers`: Express router definitions.
- `schemas`: Zod schemas for request validation.
- `services`: Business logic and interaction with data sources.
- `swagger`: Swagger documentation files.
- `util`: Utility functions and constants.

## File Naming Conventions

To maintain consistency, please adhere to the following naming conventions:

- **Controllers**: `[name].controller.ts` (e.g., `auth.controller.ts`)
- **Services**: `[name].service.ts` (e.g., `user.service.ts`)
- **Routes**: `[name].routes.ts` (e.g., `auth.routes.ts`)
- **Schemas**: `[name].schema.ts` (e.g., `auth.schema.ts`)
- **Middlewares**: `[name].middleware.ts` (e.g., `auth.middleware.ts`)
- **Models**: `[name].ts` (e.g., `user.ts`)
- **Swagger**: `[name].swagger.ts` (e.g., `auth.swagger.ts`)

## Workflow

1.  **Define Routes**: Create a new file in `src/routers` for the new feature's routes.
2.  **Create a Controller**: In `src/controllers`, create a controller to handle the requests defined in the router.
3.  **Implement Business Logic**: If the controller logic is complex, abstract it into a service in `src/services`.
4.  **Add Validation**: Create validation schemas in `src/schemas` for request bodies, params, or queries. Use the `validation.middleware.ts` to apply the validation in the router.
5.  **Document the API**: Add Swagger documentation for the new endpoints in `src/swagger/modules`.

## Error Handling

All errors should be handled by the `HttpError` class in `src/util/httpError.ts`.
every error should have a code and a message and should be defined in `src/util/errorsContants.ts`.

## Code Style

The project uses `Prettier` for code formatting. Please run the formatter before committing your changes.

## Response Format

All responses should be in JSON format.

```json
{
  "data": model // data returned by the service
}
```
