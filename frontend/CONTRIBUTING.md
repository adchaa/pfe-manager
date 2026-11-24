# Contributing to the Frontend

## Project Structure

Our project follows a modular structure:

- `src/assets/`: Static assets like images and fonts.
- `src/components/`: Reusable React components.
  - `src/components/ui/`: Small UI components (Shadcn UI).
- `src/lib/`: Utility functions and shared logic (e.g., `utils.ts`, `error.ts`).
- `src/pages/`: Page-level components associated with routes.
- `src/schemas/`: Zod validation schemas.
- `src/services/`: API service layers and external integrations.
- `src/types/`: TypeScript interfaces,types and enums.

## Coding Standards

- **TypeScript:** Always use TypeScript. Avoid `any` at all costs. Use interfaces for props and data structures.
- **Path Aliases:** Use the `@/` alias to refer to the `src/` directory.
  - Example: `import { Button } from "@/components/ui/button";`

## Component Guidelines

- **UI Library:** We use [Shadcn UI](https://ui.shadcn.com/) for our base components. Check `src/components/ui/` before creating a new base component.
- **Styling:** Use Tailwind CSS for all styling. Follow the [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta) guidelines.
- **Purity:** Keep components small and focused on a single responsibility.

## State Management & API

- **Remote State:** Use [TanStack Query (React Query)](https://tanstack.com/query/latest) for fetching, caching, and updating server state.
- **API Calls:** Use `axios` within the `src/services/` directory. Do not make direct API calls within components.
- **Validation:** Use `zod` for schema-based validation. Define schemas in `src/schemas/`.
