# Solvin

Website and project-discovery platform for Solvin, a product design and engineering studio. The public site presents websites, web applications, AI-powered products, mobile and desktop applications, and custom business software. It also includes The Assistant, conversational lead capture, responsive light/dark themes, and production-oriented integrations.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS
- GPT-6 Luna through OpenAI's official SDK
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

## Homepage and 3D experience

The homepage pairs immediately available HTML copy and navigation with an interactive
Three.js scene, loaded through React Three Fiber. `src/components/hero-scene.tsx`
handles capability detection, reduced motion, viewport visibility, drag input, and
a keyboard-accessible front/perspective control. `src/components/glasses-scene.tsx`
models the glasses procedurally, including beveled frames, lenses, hinges, nose
pads, and curved temples. Its studio environment is generated locally; no remote
models, textures, or environment files are required.

Rendering is on demand, with a capped pixel ratio and damped movement. Scroll and
pointer drags and keyboard rotation request frames while the hero is visible.
Both axes support full turns around the model’s center, preserve the chosen angle,
and offer front-view and reset controls. Reduced-motion visitors,
WebGL failures, and loading failures receive the official static mark. All primary
content and navigation remain usable without the scene.

The homepage embeds the working Assistant directly, with prominent desktop and
mobile entry points, and provides three illustrative workflow examples. Selecting an example updates the diagram and carries
that example into a new Assistant conversation. These are demonstrations, not client
outcome claims. `/readiness` hosts the focused conversation, project brief, contact
consent, and delivery states.

The shared visual foundation lives in `src/app/foundation.css`; the redesign is
implemented in `src/components/revamp.css`. Existing marketing and Assistant styles
remain available for their component-specific layouts. The earlier cinematic video
components and source footage are retained as unused historical assets.

Public routes include `/capabilities`, `/about`, `/contact`, `/readiness`, and `/privacy`. The legacy `/services` route permanently redirects to `/capabilities`; `/work` redirects to the working Assistant on the homepage.

The Assistant uses an application-controlled information-gap planner rather than
a fixed questionnaire. It classifies the visitor's problem, skips facts already
provided, asks one contextual question at a time, and prepares a brief after
enough useful context—normally within three to five substantive answers and no
later than six.

GPT-6 Luna extracts structured facts, offers restrained interpretations, and
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
| `OPENAI_MODEL` | Configurable OpenAI model (defaults to `gpt-6-luna` when unset) |
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
