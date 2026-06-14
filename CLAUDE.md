# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Solvin Solutions marketing site (Next.js 16 App Router, React 19, TypeScript, Tailwind v4). Five marketing pages plus an AI readiness assessment chat that scores a visitor's workflow and captures leads. See `AGENTS.md` and `README.md` for contributor conventions and deployment steps; `website-specification.md` holds the product/brand source.

## Commands

```bash
npm run dev            # Next.js dev server (http://localhost:3000)
npm run lint           # ESLint (eslint.config.mjs)
npm run typecheck      # tsc --noEmit
npm test               # Vitest once
npm run test:watch     # Vitest watch mode
npm run test:coverage
npm run build && npm start

# Run a single test file
npx vitest run src/lib/assessment.test.ts
# Run tests matching a name
npx vitest run -t "scoreAssessment"
```

Vitest uses jsdom and only discovers `src/**/*.test.ts` (note: `.ts`, not `.tsx`). The `@/` alias maps to `src/` in both `tsconfig.json` and `vitest.config.ts`.

Before opening a PR: `npm run lint && npm run typecheck && npm test && npm run build`.

## Core architectural invariant

**The readiness assessment is application-controlled; Claude is advisory only.** Application code in `src/lib/assessment.ts` and the API routes own stage transitions, scoring, consent, sensitive-data handling, persistence, and completion. Claude (`src/lib/claude.ts`) is used *only* to (1) extract structured facts from a free-text answer and (2) write recommendation wording. Every Claude call must have a deterministic fallback and must never gate authorization, scoring, or DB writes. Keep it this way when editing — do not let the model drive control flow.

## Assessment flow

Stages (`stageOrder` in `assessment.ts`):
```
opening → context → pain_point → workflow_clarity → tools_data → risk → summary → contact → completed
```
`summary` is never a resting stage — `messages/route.ts` collapses it into `contact`, at which point the score and recommendation are generated. There is also a hard cap: after 15 answers the flow forces `contact`.

Request lifecycle for a turn (`src/app/api/chat/sessions/[id]/messages/route.ts`):
1. Per-session rate limit (`rateLimit` in `server.ts`).
2. Validate body with Zod.
3. `containsSensitiveData()` screens the message. If it matches (passwords, API keys, card/SSN patterns), the raw text is replaced with a placeholder before storage and Claude is **not** called — a fixed privacy acknowledgment is returned and `sensitiveData: true` is recorded.
4. Otherwise `analyzeAnswer()` calls Claude with a forced tool call; on any failure it falls back to `extractFallback()` (keyword heuristics in `assessment.ts`).
5. Facts merge into the session, stage advances, and at `contact` `scoreAssessment()` + `createRecommendation()` run.

Scoring (`scoreAssessment`) is a weighted sum of five sub-scores (clarity .25, repetition .2, data/tool .2, impact .2, risk .15) producing a 0–100 total mapped to one of four `ReadinessCategory` bands. All thresholds live in `assessment.ts`.

## Persistence (`src/lib/store.ts`)

Single module behind which Supabase is **optional**. If `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set, it uses Supabase with the service-role client (server-only); otherwise it falls back to an in-process `Map` that is lost on restart. Every store function branches on `supabase()` returning null. When changing persistence, update both branches and the row↔record mappers (`sessionFromRow`, `persistAssessmentOutcome`). The camelCase domain types (`src/lib/types.ts`) and snake_case DB columns are translated only here.

Schema lives in `supabase/migrations/`; apply migrations before enabling Supabase credentials. Tables: `chat_sessions`, `chat_messages`, `assessment_facts`, `readiness_scores`, `recommendations`, `leads`.

## Integrations & security

- **Claude** (`src/lib/claude.ts`): requires both `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`; missing either disables Claude entirely (deterministic path). Uses forced tool calls + Zod parse, short timeout, no SDK retries.
- **n8n completion webhook** (`triggerN8n` in `server.ts`): fired on session completion, HMAC-SHA256 signed via `x-solvin-signature`, with the session id as `x-idempotency-key`. The consumer must verify the signature and dedupe.
- **Resend** powers `/api/contact` notifications; **Cal.com** (`NEXT_PUBLIC_CALCOM_URL`) is the booking target.
- Service credentials are server-only — never expose them via `NEXT_PUBLIC_*`. Don't log transcripts or sensitive user content. Security headers are set globally in `next.config.ts`.
- `rateLimit` is process-local (an in-memory Map) and must be replaced with a distributed store before production scaling.

## Layout

- `src/app/` — App Router pages (`page.tsx` per route), `robots.ts`, `sitemap.ts`, and `api/` routes.
- `src/components/` — UI components with co-located `*.css`.
- `src/lib/` — assessment logic, Claude, store, server utilities, shared types, content.
- Tests live beside implementation as `*.test.ts`.
