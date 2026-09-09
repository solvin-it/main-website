# Solvin

Website and project-discovery platform for Solvin, a product design and engineering studio. The public site presents websites, web applications, AI-powered products, mobile and desktop applications, and custom business software. It also includes The Assistant, conversational lead capture, responsive light/dark themes, and production-oriented integrations.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS
- GPT-5.6 Luna through OpenAI's official SDK
- Supabase PostgreSQL as the production system of record
- Resend for inquiry and project-brief email, and Cal.com for booking
- Zod validation, Vitest, Testing Library, and ESLint

## Project Structure

```text
src/app/             Pages, metadata, and API routes
src/components/      Shared UI and marketing components
src/lib/             Assessment, OpenAI integration, persistence, and server utilities
public/              Brand and social assets
supabase/migrations/ Database schema
brand/               Brand guide and source assets
website-specification.md  Original MVP specification
```

## Homepage Motion

The homepage hero contains one scroll-controlled cinematic sequence implemented by
`src/components/cinematic-mark.tsx`. It maps the visitor's scroll position to an
eight-second H.264 video rather than autoplaying it:

1. a software interface is reflected through the glasses;
2. the camera pulls back to reveal the complete frame;
3. an intentional edit moves to the bowtie on the table;
4. already-folded glasses descend into the Solvin mark;
5. the rendered composition crossfades to the exact SVG logo.

The web asset is `public/media/solvin-cinematic-mark.mp4`; its poster is stored
beside it. The MP4 is silent, fast-start enabled, and encoded with frequent
keyframes for responsive seeking. Source storyboards and generated masters remain
under `brand/storyboards/`.

Do not replace the intentional cut with generated folding or rotating mechanics.
Video models have produced duplicated glasses temples in those transitions. If the
asset is regenerated, preserve the two mechanically simple shots, keep the final
logo alignment, and re-encode the combined file with frequent keyframes.

Visitors with `prefers-reduced-motion: reduce`, or visitors whose browser cannot
load the video, receive the static official Solvin mark. The page's proposition and
actions remain available without the animation.

The film resolves into the canonical Assistant. The centered identity and composer
are one persistent interface: after the visitor submits a problem, the identity
compresses, the message stream opens above the same composer, and the film remains
locked on its resolved state. The homepage URL does not change. `/readiness` uses
the same Assistant presentation without the cinematic footage. Generated briefs,
contact extraction, consent, deferral, and delivery confirmation all remain inline
in the conversation.

Public routes include `/work`, `/capabilities`, `/about`, `/contact`, `/readiness`, and `/privacy`. The legacy `/services` route permanently redirects to `/capabilities`.

The Assistant uses an application-controlled information-gap planner rather than
a fixed questionnaire. It classifies the visitor's problem, skips facts already
provided, asks one contextual question at a time, and prepares a brief after
enough useful context—normally within three to five substantive answers and no
later than six.

GPT-5.6 Luna extracts structured facts, offers restrained interpretations, and
proposes follow-up wording. Application code independently selects the next
topic and validates the wording before it is shown. Scoring, consent,
persistence, and completion remain deterministic. When OpenAI is unavailable
or its proposed question fails validation, topic-specific fallbacks keep the
Assistant functional.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

External credentials are optional for local UI development. Without Supabase, sessions use an in-memory store and are lost when the server restarts. Without OpenAI, the deterministic project-brief path is used.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NEXT_PUBLIC_CALCOM_URL` | Discovery-call booking page |
| `OPENAI_API_KEY` | Server-only OpenAI credential. Luna runs whenever this is set. |
| `OPENAI_MODEL` | Configurable OpenAI model (defaults to `gpt-5.6-luna` when unset) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access |
| `RESEND_API_KEY` | Contact notification delivery |
| `CONTACT_FROM_EMAIL` | Verified Resend sender |
| `CONTACT_TO_EMAIL` | Internal inquiry recipient |

Never expose server credentials through `NEXT_PUBLIC_*` variables.

## Supabase and Integrations

Apply all files in `supabase/migrations/` before enabling Supabase credentials. The migrations create the Assistant records and an atomic, hashed-key rate limiter for multi-instance production deployments.

Assistant completion sends the same project brief directly to the prospect and Solvin through Resend. Session-based idempotency keys prevent duplicate sends during retries. Future business workflows will be implemented as Python services when usage justifies them.

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
2. Verify the Resend sender domain and test both prospect and internal project-brief delivery.
3. Update the production domain and Cal.com URL.
4. Exercise persistence, recovery, contact capture, email retry, and idempotent completion against the production integrations.

Run all checks before deployment:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```
