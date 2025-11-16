# Agent Guidelines

## Commands

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm test` - Run all tests with Vitest
- `pnpm test <filename>` - Run single test file
- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier
- `pnpm check` - Format and fix linting issues

## Code Style

- Prettier: no semicolons, single quotes, trailing commas
- TanStack ESLint config with strict TypeScript
- Import React components with PascalCase, use `@/*` path aliases
- Functional components with hooks, default exports
- Tailwind CSS for styling, clsx/tailwind-merge for conditional classes
- Error handling with try/catch, console.error for logging

## Convex Specific

- Use `v` validator builder for all schemas (see .cursorrules for full API)
- System fields `_id` and `_creationTime` are automatic
- Define tables with `defineTable()` and proper validators
- Use `v.id("tableName")` for foreign key references
- Add indexes with `.index("indexName", ["field"])` where needed
- Use `v.union()` and `v.literal()` for enum-like fields
- Import: `import { defineSchema, defineTable } from "convex/server"`

## Testing

- Vitest with React Testing Library
- Test files: `*.test.ts` or `*.test.tsx`
- No existing tests - create when adding new features
