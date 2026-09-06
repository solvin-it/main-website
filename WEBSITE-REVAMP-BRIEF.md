# Solvin Website Revamp Brief

Status: Draft for confirmation

## 1. Job and Audience

The site is a founder-led portfolio for nontechnical business owners and decision-makers. It must answer four questions quickly:

1. What does Solvin make?
2. Can Solvin understand the way our business works?
3. Is there credible evidence of execution?
4. What is the easiest way to start a useful conversation?

Technical founders and evaluators are a secondary audience. They receive implementation depth inside project pages, not in the main sales narrative.

The dominant visitor mode is **Experience**, with a **Persuade** outcome: the work leads visually, then earns an inquiry.

## 2. Outcome and Proof

The primary outcome is a qualified conversation with a prospect who understands which category of solution might help them. Visitors can either:

- explore a relevant product or demonstration;
- speak with the Solvin Guide in plain language; or
- send a direct project inquiry.

Initial proof consists of owned products, live demonstrations, experiments, interface recordings, system diagrams, and implementation notes. Every item is labeled honestly. No client identity, outcome, testimonial, or performance metric is implied without evidence and permission.

## 3. Selected Direction: The Systems Section

### Visual authority

The system borrows the discipline of architectural sectional drawings: limewash-like light ground, deep charcoal structural cuts, measured annotations, restrained daylight gold for active state, and shadow blue for secondary information.

This is not architectural cosplay. The subject is always business work and software. The section is a way to reveal hidden relationships: people, decisions, documents, systems, exceptions, and the resulting interface.

### Structural thesis

Solvin does not begin with a technology list. It opens the work, understands how the parts relate, and builds the smallest useful system. The page makes that method visible.

### First viewport

A continuous horizontal business-workflow section occupies most of the screen. On the left, people perform fragmented work across a conversation, inbox, document, and spreadsheet. A narrow gold signal passes through the scene. As it reaches the right, the same work resolves into a clear product interface.

Primary line:

> From the way work happens to the software that improves it.

Supporting identity is concise: founder-led Solvin, based in Manila and working globally. The main action is **Explore the work**. **Talk through your problem** opens the guided assistant.

### Signature interaction

The homepage uses one scroll-controlled transformation:

1. **Observe:** the operational scene is visible but fragmented.
2. **Trace:** the gold signal follows documents, handoffs, approvals, and decisions.
3. **Clarify:** unnecessary elements recede and the system structure becomes legible.
4. **Build:** the architectural section transforms into a real Solvin product interface.
5. **Inspect:** the finished project opens into its case study.

The scene remains pinned while scroll position controls progress. The production approach should prefer transforms, opacity, masks, and CSS scroll timelines. Canvas or a frame sequence is justified only if the chosen artwork cannot be decomposed efficiently. Reduced-motion users receive a clear static before/after composition and ordinary navigation.

### Cross-surface reach

- Project pages use sectional layers: context, friction, intervention, working product, and technical notes.
- Services become solution paths mapped to familiar business situations.
- The guided assistant uses the same vocabulary: observe, clarify, shape, recommend.
- The internal lead summary can show a compact section of the prospect's current process and proposed next step.

### Honest risk

The architectural vocabulary may make Solvin appear to be an architecture or process-consulting firm. Every major visual must therefore terminate in recognizable software, and plain copy must name web applications, AI-native products, websites, and cross-platform applications early.

## 4. Information Architecture

### Primary navigation

- Work
- What we build
- How we work
- About Jose
- Start a conversation

Avoid separate overlapping pages for Services and Capabilities. **What we build** should connect solution categories to business situations and examples.

### Homepage sequence

1. **Systems Section hero** — visible transformation from work to software.
2. **Selected work** — three strong owned products or demonstrations, with one featured deeply.
3. **What we build** — web applications, AI-native applications, websites, and cross-platform products, explained through problems rather than technology labels.
4. **How Solvin works** — understand, shape, build, validate; concise and evidence-oriented.
5. **Founder note** — why clients work directly with Jose and how Solvin expands delivery when needed.
6. **Guided conversation** — a clear invitation to discuss the visitor's current process.
7. **Direct contact** — email or short form for visitors ready to proceed.

### Work index

The work index leads with large visual evidence rather than equal cards. Each item includes:

- classification: Product, Demonstration, Experiment, or Client Work;
- the business situation;
- what the software does;
- platforms and capabilities;
- current status;
- a live link when available.

Filters should be omitted until the portfolio is large enough to need them. With fewer than seven projects, editorial sequencing is clearer.

### Case-study structure

1. What was happening.
2. What needed to become clearer or easier.
3. The product decision.
4. The system in motion.
5. The working interface.
6. What was built.
7. What is real today and what remains exploratory.
8. Relevant next conversation.

Technical notes are available as a secondary layer for expert readers.

## 5. Content Strategy

### Core proposition

> Solvin turns unclear business problems into useful software.

### Capability language

- **Web applications:** purpose-built tools for customers, teams, and operations.
- **AI-native applications:** products where AI helps interpret, retrieve, recommend, or complete work under clear boundaries.
- **Websites:** focused digital experiences that make an offer understandable and credible.
- **Cross-platform applications:** mobile and desktop applications when the work belongs outside the browser.

### Voice

Short, declarative, specific, and candid. Prefer evidence and examples over adjectives. Avoid announcing expertise, innovation, premium quality, or gentlemanly character; let the work demonstrate those traits.

Use “I” when describing founder judgment, accountability, or personal experience. Use “Solvin” when describing the studio, delivery system, products, and commercial relationship. Use “we” only when collaborators are materially involved.

## 6. Guided Prospect Assistant

Working name: **Solvin Guide**. Avoid presenting it as a magical AI or as a substitute for a human conversation.

### Visitor experience

The assistant opens with one low-effort question:

> What part of running your business feels more difficult or repetitive than it should?

It asks one question at a time and adapts from the answer. The useful discovery sequence is:

1. The work or problem in the visitor's own words.
2. Who handles it today.
3. What they currently use: email, chat, documents, spreadsheets, existing software, or something else.
4. What tends to go wrong, take too long, or get missed.
5. What a better result would look like.
6. Whether this is exploratory, planned, or urgent.

Questions should be answerable in a sentence. The assistant can offer examples when someone is unsure, summarize periodically, and skip questions already answered. It must not ask for budgets, databases, APIs, model choices, or architecture in the opening conversation.

### Visitor output

Before requesting contact information, the visitor receives a concise and explicitly preliminary summary:

- current situation;
- likely opportunity;
- possible type of solution;
- important unknowns;
- sensible next step.

The assistant should say when ordinary process improvement or existing software may be more appropriate than custom AI development.

### Solvin output

After explicit consent, Solvin receives:

- contact information;
- structured problem summary;
- current process and tools;
- people involved;
- pain and desired outcome;
- stage and urgency;
- suggested follow-up questions;
- conversation link or identifier.

Luna may extract facts and draft summaries. Deterministic application logic owns consent, validation, stage transitions, sending, persistence, and any lead qualification score.

### Important states

- fresh conversation;
- returning session recovery;
- uncertain or very short answers;
- off-topic request;
- sensitive information warning;
- provider timeout or failure;
- consent declined;
- contact submission success or retry;
- human handoff request;
- reduced-motion and keyboard-only use.

## 7. Backend Recommendation

Start with the smallest useful lead system:

### Phase-one backend

- existing Next.js API routes;
- server-side Luna integration behind a provider interface;
- Zod validation;
- deterministic conversation stages;
- minimal session storage with retention controls;
- Resend email containing the structured lead summary;
- consent record and privacy copy;
- no sensitive transcript logging in analytics or application logs.

### Dashboard threshold

Do not build a full CRM dashboard initially. Add one when real usage creates a need for at least two of these:

- more than a manageable number of weekly conversations;
- lead status and ownership tracking;
- search across prior opportunities;
- follow-up reminders;
- conversion or source reporting;
- collaboration between Jose and the BDM.

Until then, structured storage plus a strong email summary gives most of the value at much lower complexity.

## 8. Responsive and Accessibility Behavior

- Desktop uses the complete horizontal section and pinned scroll transformation.
- Tablet simplifies annotations and shortens the transformation.
- Mobile converts the section into stacked moments: current work, intervention, finished interface.
- Essential meaning never depends on animation.
- All text and controls remain legible at 200% zoom.
- Motion respects `prefers-reduced-motion` and does not trap scrolling.
- The assistant supports keyboard use, visible focus, resumable state, and clear error recovery.

## 9. Scope and Boundaries

### First release

- redesigned shared visual system and navigation;
- new homepage;
- portfolio index;
- one complete flagship case study plus two lighter project entries;
- What we build page;
- founder About page;
- guided assistant integrated with the current readiness foundation;
- Resend lead summary and minimal persistence;
- signature homepage interaction with responsive and reduced-motion alternatives.

### Preserve

- Solvin name and recognizable logo assets;
- working API, assessment, consent, validation, and test behavior unless a planned contract change requires migration;
- current privacy and security principles;
- existing subdomain strategy.

### Anti-goals

- pretending to be a large agency;
- manufacturing client proof;
- listing every possible technology;
- building a CRM before inquiry volume justifies it;
- scattering animation across every section;
- literal gentleman props or faux-luxury styling;
- turning the entire site into an architectural drawing at the expense of clarity.

## 10. Implementation Phases

1. **Evidence inventory:** select three publishable owned projects, gather screenshots or recordings, confirm live links, and write factual project notes.
2. **Comp round:** retain the approved Systems Section composition, create two focused variations, and lock the homepage composition and responsive interpretation.
3. **Design system:** establish typography, palette, drawing language, annotation rules, project imagery, states, and motion grammar.
4. **Portfolio foundation:** rebuild the shell, homepage, work index, and flagship case study around real evidence.
5. **Signature motion:** implement and performance-test the scroll transformation with static and reduced-motion fallbacks.
6. **Guided assistant:** simplify the current assessment into an adaptive business conversation, integrate Luna, consent, summaries, and Resend.
7. **Validation:** test content comprehension, keyboard and mobile behavior, provider failures, consent boundaries, Core Web Vitals, and production build.

## 11. Open Decisions Before Implementation

- Which three owned products or demonstrations will launch the portfolio.
- Whether the existing Readiness Advisor remains a separately named product or becomes the Solvin Guide.
- The final founder biography details and preferred personal photograph, if any.
- Whether project subdomains open directly or first pass through a case-study page.
- The retention period for prospect conversations and whether full transcripts are stored at all.
