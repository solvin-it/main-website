# Repository Guidelines

## Project Structure & Module Organization

- `src/app/` contains Next.js App Router pages, metadata endpoints, and server API routes.
- `src/components/` contains reusable UI and adjacent component-specific CSS.
- `src/lib/` contains assessment rules, Claude integration, persistence, shared types, and server utilities.
- Tests live beside implementation files as `*.test.ts`.
- `public/` stores web-ready brand assets; source brand files and specifications remain under `brand/` and `website-specification.md`.
- `supabase/migrations/` contains versioned PostgreSQL schema changes.

Keep scoring and stage transitions in `src/lib/assessment.ts`. Claude may extract facts and generate wording, but must not control authorization, scoring, consent, or database operations.

## Build, Test, and Development Commands

```bash
npm install          # Install pinned dependencies
npm run dev          # Start local Next.js development
npm run lint         # Run Next.js/TypeScript ESLint rules
npm run typecheck    # Run TypeScript without emitting files
npm test             # Run Vitest once
npm run test:watch   # Run tests interactively
npm run test:coverage
npm run build        # Create the production build
npm start            # Serve the production build
```

Before opening a PR, run `npm run lint && npm run typecheck && npm test && npm run build`.

## Coding Style & Naming Conventions

Use TypeScript with strict typing and two-space indentation. Prefer named exports for reusable modules and PascalCase for React components. Use camelCase for functions and variables, and lowercase route directories such as `src/app/readiness/`.

Keep components focused, use semantic HTML, and preserve keyboard and reduced-motion support. Validate external input with Zod. Never expose service-role credentials to client components.

## Testing Guidelines

Vitest runs in `jsdom` and discovers `src/**/*.test.ts`. Name tests after the module under test, for example `assessment.test.ts`. Cover stage transitions, score boundaries, validation, sensitive-data handling, provider failures, and deterministic fallbacks. Add integration coverage when changing API contracts or persistence behavior.

## Commit & Pull Request Guidelines

History currently contains only `first commit`, so no established convention exists. Use concise imperative subjects such as `Add readiness session recovery`.

PRs should include a clear behavior summary, verification commands, linked issues when applicable, and screenshots for visual changes in both desktop and mobile layouts. Call out schema migrations, new environment variables, and deployment steps explicitly.

## Security & Configuration

Copy `.env.example` to `.env.local`; never commit secrets. Apply Supabase migrations before enabling persistence. Keep n8n webhooks signed and idempotent, and avoid logging transcripts or sensitive user content.
