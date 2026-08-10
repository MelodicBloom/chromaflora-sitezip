# Mandala V2 Fixed Instrument + Control Sheet Design

## Status

Approved implementation design for the mobile Mandala Studio V2 interaction architecture.

## Problem

`public/mandala-v2.html` currently behaves like a long settings page. The canvas, pattern selector, controls, and fixed action dock are stacked vertically, so adjusting deeper controls requires scrolling the live artwork out of view. That breaks the core feedback loop of a generative instrument: change a parameter and immediately see the result.

The prior accessibility/render review repairs are already on `main` via PR #5. This change must preserve those repairs while restructuring the mobile layout.

## Product Principle

Canvas and controls are two simultaneous regions of one instrument, not two sections of a page.

The document body must not vertically scroll on the target mobile layouts. The live canvas remains visible while the user changes any parameter. Only the interior of the control sheet may scroll.

## Mobile Architecture

```text
┌──────────────────────────────────┐
│ Compact header / undo / export   │  56–64 px
├──────────────────────────────────┤
│                                  │
│       LIVE MANDALA CANVAS        │  always visible
│                                  │
│  mode · points · play controls   │
├──────────────────────────────────┤
│ ───── draggable sheet handle ─── │
│ Shape  Motion  Color  Effects    │
│                                  │
│ contextual controls              │  internally scrollable
│                                  │
├──────────────────────────────────┤
│ Mutate   Reset   Save   Export   │  fixed inside sheet
└──────────────────────────────────┘
```

### Shell

- `html` and `body` occupy the viewport and do not vertically scroll.
- The app uses `100dvh` so browser chrome expansion/contraction does not break the composition.
- The compact header is a fixed-height top region.
- The remaining viewport is split between the live canvas and the control sheet.
- The canvas may resize as the sheet changes state but never disappears and never becomes shorter than 220 px at target sizes.

### Control Sheet States

The sheet exposes three discrete states.

#### Peek

- Height: 76–92 px; target 88 px.
- Shows the drag handle, tab row, and one quick-control affordance or current-parameter summary.
- Gives the canvas maximum room.

#### Working

- Height: 38–46dvh; target 42dvh.
- Default editing state.
- Shows roughly two to three large controls while preserving approximately half of the viewport for the artwork.

#### Expanded

- Height: 58–64dvh; target 62dvh.
- Used for pattern selection, presets, and advanced controls.
- Canvas remains visible as a compressed live preview.

The user can move between states using the sheet handle. Pointer/touch drag snaps to the nearest state; keyboard users can cycle states using the handle button.

## Control Organization

### Pattern selection

Remove the standalone `Choose a pattern` section from the page flow. Move the existing horizontal pattern rail into the control sheet as the first Shape-tab subsection. It remains horizontally scrollable and retains the current pattern buttons and semantics.

### Tabs

Retain Shape, Motion, Color, and Effects. Preserve the accessible tab semantics already repaired on `main`:

- `role="tablist"`
- tabs with IDs, `aria-selected`, `aria-controls`, and roving `tabindex`
- panels with `role="tabpanel"`, `aria-labelledby`, and `hidden` when inactive
- ArrowLeft/ArrowRight/Home/End keyboard behavior

### Progressive disclosure

Keep all existing detailed parameters, but surface the most relevant controls first for the selected pattern.

Pinned/high-priority controls by pattern:

- Mandala: symmetry, layers, radius, frequency
- Rose Curve: frequency, amplitude, radius, heading
- Spirograph: frequency, amplitude, radius, phase
- Lissajous: frequency, amplitude, phase, heading
- Sacred Geo: symmetry, layers, radius, heading
- Toroid: symmetry, phase, spin, pulse

Secondary controls remain accessible within their owning tab and may be reached by internal sheet scrolling.

The underlying parameter model and renderer remain unchanged; this is a presentation/interaction architecture change rather than a renderer rewrite.

## Action Dock

Move Mutate, Reset, Save, and PNG 2× into the sheet as its fixed footer.

Requirements:

- It must never cover a slider, toggle, card, or pattern button.
- It is outside the sheet's scrolling content region.
- It respects `env(safe-area-inset-bottom)`.
- Existing button IDs and event bindings remain intact.

## Header

Reduce the mobile header's vertical weight while preserving the ChromaFlora brand and existing top actions. Target total header height: 56–64 px including safe-area padding.

## Accessibility and Input Requirements

Preserve the existing review repairs and extend them to the sheet interaction:

- Browser pinch zoom remains enabled.
- Toggle buttons remain `role="switch"` with synchronized `aria-checked` state.
- Tab/panel ARIA state remains synchronized during all interactions.
- Slider redraws remain batched using `requestAnimationFrame` when animation is off.
- The sheet handle is a semantic button with a descriptive accessible name.
- Sheet state is exposed through `aria-expanded` and/or an accessible state label.
- Keyboard activation cycles the sheet through Peek → Working → Expanded → Peek.
- Pointer dragging must not steal horizontal pattern-rail scrolling or slider gestures.
- Reduced-motion users get state changes without spring/overshoot animation.

## Responsive Behavior

### Mobile: 360×740, 390×844, 412×915

- Body vertical scroll: none.
- Canvas always visible.
- Canvas minimum height: 220 px.
- Default sheet: Working.
- Sheet internal content scrolls vertically when required.
- Action footer remains visible inside the sheet.

### Tablet/Desktop

Do not force the mobile bottom-sheet geometry onto wide screens. Preserve the existing desktop usefulness with a split composition:

- live stage on the left/top as space permits;
- controls in a bounded panel on the right or below;
- no regression to the renderer or existing desktop control availability.

The mobile fixed-instrument behavior is the primary acceptance target.

## Structural Target

```html
<div class="instrument-shell">
  <header class="instrument-header">...</header>

  <main class="instrument-stage">
    <section class="live-viewport">
      <canvas id="art"></canvas>
      <div class="viewport-hud">...</div>
    </section>

    <section
      class="control-sheet"
      data-sheet-state="working"
      aria-label="Mandala controls"
    >
      <button class="sheet-handle" aria-label="Resize control panel"></button>
      <div class="sheet-tabs">...</div>
      <div class="sheet-scroll">...</div>
      <footer class="sheet-actions">...</footer>
    </section>
  </main>
</div>
```

Implementation may retain existing internal class names where that minimizes regression risk; the behavioral boundaries above are normative.

## Acceptance Criteria

At 360×740, 390×844, and 412×915:

1. The document body has zero vertical scrolling.
2. The live canvas is visible during every parameter adjustment.
3. The canvas remains at least 220 px tall.
4. Only the control sheet's interior scrolls vertically.
5. The action row never obscures a slider, switch, card, or pattern selector.
6. Pattern changes happen without navigating away from the canvas.
7. The control sheet supports Peek, Working, and Expanded states.
8. Browser address-bar expansion does not break the layout because the shell uses `100dvh`.
9. Pinch zoom, accessible tab behavior, screen-reader panel state, and switch state remain intact.
10. Large controls stay large; solve density through architecture and progressive disclosure, not by shrinking touch targets.
11. Existing render/preset/mutate/reset/save/export functionality continues to work.
12. Existing local XP/streak persistence continues to work.

## Non-Goals

- No renderer rewrite.
- No change to the visual-generative algorithms.
- No new persistence backend.
- No removal of existing parameter depth.
- No replacement of the current route with a new framework.
- No broad repository refactor outside the Mandala V2 surface and its targeted validation tooling.
