# Solvin Solutions

Production-minded MVP for the Solvin Solutions AI workflow consulting website.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Claude via the direct Anthropic API
- Supabase PostgreSQL
- n8n webhooks, Resend email, and Cal.com booking
- Vitest

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site and deterministic readiness assessment work without external credentials. Configure `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` to enable Claude-powered extraction and recommendation language.

Apply `supabase/migrations/202606140001_initial_schema.sql` before setting the Supabase environment variables. Without Supabase, development uses an in-memory session store.

## Required production configuration

- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain.
- Set `NEXT_PUBLIC_CALCOM_URL` to the discovery-call booking page.
- Add Anthropic and Supabase server credentials.
- Configure Resend sender/recipient values.
- Configure a signed n8n webhook. Verify `x-solvin-signature` with HMAC-SHA256 over the raw request body and deduplicate using `x-idempotency-key`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
