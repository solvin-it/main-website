# Solvin Solutions

Five-page MVP for Solvin Solutions, an AI workflow consulting and implementation business. The site includes an AI readiness assessment, lead capture, responsive light/dark themes, and production-oriented integrations.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS
- Claude through Anthropic's official SDK
- Supabase PostgreSQL as the production system of record
- n8n for completion workflows, Resend for email, and Cal.com for booking
- Zod validation, Vitest, Testing Library, and ESLint

## Project Structure

```text
src/app/             Pages, metadata, and API routes
src/components/      Shared UI and marketing components
src/lib/             Assessment, Claude, persistence, and server utilities
public/              Brand and social assets
supabase/migrations/ Database schema
specifications/      Product and brand source material
```

The readiness flow is application-controlled:

```text
opening -> context -> pain_point -> workflow_clarity
-> tools_data -> risk -> contact -> completed
```

Claude extracts structured facts and writes recommendation language. Application code controls stage transitions, scoring, consent, persistence, and completion. When Claude is unavailable, deterministic extraction and recommendation fallbacks keep the assessment functional.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

External credentials are optional for local UI development. Without Supabase, sessions use an in-memory store and are lost when the server restarts. Without Anthropic, the deterministic assessment path is used.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NEXT_PUBLIC_CALCOM_URL` | Discovery-call booking page |
| `ANTHROPIC_API_KEY` | Server-only Claude credential |
| `ANTHROPIC_MODEL` | Configurable Claude model |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access |
| `RESEND_API_KEY` | Contact notification delivery |
| `CONTACT_FROM_EMAIL` | Verified Resend sender |
| `CONTACT_TO_EMAIL` | Internal inquiry recipient |
| `N8N_WEBHOOK_URL` | Assessment-completion workflow |
| `N8N_WEBHOOK_SECRET` | HMAC signing secret |

Never expose server credentials through `NEXT_PUBLIC_*` variables.

## Supabase and Integrations

Apply `supabase/migrations/202606140001_initial_schema.sql` before enabling Supabase credentials. The migration creates leads, sessions, messages, facts, scores, recommendations, and follow-up records with constraints, indexes, deletion relationships, and row-level security.

The completion webhook sends `x-solvin-signature`, an HMAC-SHA256 signature of the JSON body, and uses the session ID as `x-idempotency-key`. The n8n workflow must verify both and deduplicate completion events.

## Commands

```bash
npm run dev            # Start the development server
npm run lint           # Run ESLint
npm run typecheck      # Check TypeScript
npm test               # Run unit tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage
npm run build          # Create a production build
npm start              # Serve the production build
```

## Production Readiness

Before launch:

1. Configure Vercel environment variables and apply the Supabase migration.
2. Build and test the signed n8n workflow and Resend sender.
3. Update the production domain and Cal.com URL.
4. Replace process-local rate limiting with a distributed production store.
5. Add API integration and end-to-end coverage for persistence, recovery, contact capture, and idempotent completion.

Run all checks before deployment:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```
