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

The signature component is the Systems Section: an authored workflow plate combined with a real interface whose scroll progression moves from observation to a finished system.

## Do's and Don'ts

### Do

- Do show functioning interfaces and label demonstrations honestly.
- Do use business language before technical terminology.
- Do use one composed scroll-driven transformation with a static reduced-motion equivalent.
- Do let the founder voice be direct and accountable.

### Don't

- Don't use gold as a decorative glow or gradient.
- Don't build pages from equal icon-and-copy cards.
- Don't use literal gentleman props, faux luxury, robots, circuits, or neon AI imagery.
- Don't let architectural styling obscure that Solvin builds software.
- Don't invent client names, testimonials, outcomes, or metrics.
