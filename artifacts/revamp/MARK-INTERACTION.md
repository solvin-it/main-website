# Glasses and bowtie interaction

The complete Solvin mark follows the mouse with a smooth turn and a small positional shift. Clicking or tapping the scene drops both props. The Assistant link continues the clearer-perspective story.

- Hover guides both props without a mouse button. Dragging still supports unrestricted rotation on both axes.
- A single click or tap drops the mark. A drag, pinch, or cancelled touch never counts as a click.
- Scroll over the scene, pinch with two fingers, or use the compact plus/minus controls to zoom from 100% to 165%. Browser modifier-wheel zoom remains available.
- Arrow keys rotate; Shift increases the step; Enter or Space drops; plus/minus zoom; Home resets.
- Logo view and Drop buttons have been removed. Reset restores the floating mark and 100% zoom, including during a fall.
- The props fall separately with gravity, bounce, floor contact and authored resting poses. This is stylized physics, not a general rigid-body collision solver; airborne collisions between the props are not simulated.
- Rendering pauses offscreen and when settled. Reduced-motion and unavailable-WebGL paths retain the static logo and Assistant link.

Validation: lint, TypeScript, 66 tests across 13 files, and production build. Component coverage includes mouse tracking, click versus drag, wheel bounds, keyboard equivalence, reset, and pinch release without an accidental fall.

Current interaction screenshots: `pointer-mark-desktop.png`, `pointer-mark-mobile.png`, and `pointer-mark-zoom.png`. Earlier `mark-*` images document the previous controls.
