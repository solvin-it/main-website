---
name: Solvin Systems Section
description: From the way work happens to the software that improves it.
colors:
  limewash: "#f1efe8"
  paper: "#f8f7f3"
  charcoal: "#17191d"
  daylight-gold: "#d7a52a"
  signal-gold: "#b98516"
  shadow-blue: "#70808e"
  line: "#ccc8bd"
typography:
  display:
    fontFamily: "Sora, sans-serif"
    fontSize: "clamp(2.8rem, 6.7vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.68rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  precise: "3px"
  interface: "4px"
spacing:
  compact: "0.75rem"
  regular: "1.5rem"
  section: "clamp(5rem, 9vw, 8.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.precise}"
    padding: "0.72rem 1.15rem"
  button-signal:
    backgroundColor: "{colors.daylight-gold}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.precise}"
    padding: "0.72rem 1.15rem"
---

# Design System: Solvin Systems Section

## Overview

**Creative North Star: “The Systems Section”**

Solvin borrows the clarity of an architectural sectional drawing to reveal the people, decisions, documents, and software inside real work. The system feels composed, exact, human, and quietly surprising. Architectural language is a method of explanation rather than a costume; every major visual eventually resolves into recognizable software.

Key characteristics are warm limewash grounds, charcoal structural cuts, one daylight-gold signal, measured annotation, strong editorial scale, honest product evidence, and one orchestrated motion moment.

## Colors

The palette is warm and legible, with gold reserved for progress, action, and active state.

- **Limewash** (`#f1efe8`): primary narrative ground.
- **Paper** (`#f8f7f3`): reading surfaces and forms.
- **Section Charcoal** (`#17191d`): primary ink and structural dark surface.
- **Daylight Gold** (`#d7a52a`): signature active signal and major calls to action.
- **Shadow Blue** (`#70808e`): secondary atmospheric surface.
- **Drawing Line** (`#ccc8bd`): rules, dividers, and inactive boundaries.

**The Daylight Rule.** Gold marks what is active, progressing, or actionable. It is never ambient decoration.

## Typography

Sora carries direct statements and section titles. Inter keeps explanations accessible. JetBrains Mono is reserved for measurement, state, classification, and technical data.

Display text stops at 6rem and `-0.04em` tracking. Body copy is at least 1rem with a 65–75 character reading measure. Labels are small but never ornamental filler.

## Layout

The desktop system uses broad horizontal sections, asymmetrical editorial grids, and continuous rules. Hero imagery is allowed to span the viewport; reading content remains inside a 1240px container. Mobile converts horizontal sequences into stacked moments without losing their meaning.

Spacing is generous between ideas and compact inside functional groups. Headings receive more room above than below.

## Elevation & Depth

The system is flat by default. Depth comes from charcoal cuts, overlapping product evidence, and tonal fields. Wide soft shadows are reserved for genuine floating interfaces and must include both offset and blur.

## Shapes

Corners are precise and nearly square: 3px for controls and 4px for interface frames. Borders are hairline drawing rules. Angled or clipped corners may appear only where they carry the sectional-instrument language, not on every container.

## Components

Buttons are direct, compact, and rectangular. The gold button is the signal action; charcoal is the grounded action; text links use a measured underline. Focus uses a visible three-pixel outline.

Cards are not the default page structure. Work is presented as editorial evidence, continuous sections, or full product specimens. Inputs remain flat, high-contrast, and recoverable in error states.

The signature component is the cinematic Solvin mark: one pinned, scroll-controlled sequence that moves from software reflected in eyeglasses to folded glasses settling above a bowtie. The rendered arrangement then crossfades to the exact official mark. It is a visual statement about seeing the work clearly and turning it into a composed result.

The Assistant is the final state of that sequence, not a separate product window. Its logo, question, message stream, and composer share one persistent shell. On the first message, the large centered identity compresses into a quiet conversation header while the existing composer moves to the bottom and the message stream opens above it. The structural transition lasts 500ms with confident deceleration; individual messages arrive in 220ms. Reduced-motion users receive the same state change without spatial movement.

The canonical Assistant has no outer card, toolbar, avatars, privacy banner, or visible completion meter. Assistant replies sit directly on the charcoal field, visitor replies use restrained dark bubbles, and daylight gold is reserved for send and confirmation actions. The generated brief unfolds inline as an editorial document with rules rather than nested cards. Contact details, consent, deferral, and delivery confirmation remain part of the same conversation.

## Do's and Don'ts

### Do

- Do show functioning interfaces and label demonstrations honestly.
- Do use business language before technical terminology.
- Do use one composed scroll-driven transformation with a static reduced-motion equivalent.
- Do use intentional edits when they protect physical credibility; the motion should feel continuous even when the footage is assembled from separate shots.
- Do preserve the official SVG as the final visual authority rather than asking generated footage to reproduce the logo exactly.
- Do keep the Assistant composer visually and structurally continuous from the hero prompt through the completed brief.
- Do let the founder voice be direct and accountable.

### Don't

- Don't use gold as a decorative glow or gradient.
- Don't build pages from equal icon-and-copy cards.
- Don't use literal gentleman props, faux luxury, robots, circuits, or neon AI imagery.
- Don't let architectural styling obscure that Solvin builds software.
- Don't generate visible folding, hinge movement, or complex rotation of the glasses; duplicated temples and unstable geometry immediately break the illusion.
- Don't invent client names, testimonials, outcomes, or metrics.
- Don't replace the hero composer with an assessment window, dashboard frame, or second chat component after submission.
