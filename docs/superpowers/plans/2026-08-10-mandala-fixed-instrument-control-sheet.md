# Mandala Fixed Instrument Control Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Mandala Studio V2 from a vertically scrolling settings page into a fixed mobile creative instrument where the live canvas remains visible while a three-state control sheet exposes all controls.

**Architecture:** Preserve the existing renderer, parameter model, event IDs, review-fix accessibility semantics, and local persistence. Recompose `public/mandala-v2.html` into a `100dvh` shell with a compact header, flexible live stage, and bounded bottom control sheet whose interior is the only vertically scrollable region on mobile. Add a small sheet-state controller that snaps among `peek`, `working`, and `expanded`, and update visual-audit tooling to capture the target mobile states.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, Canvas 2D, browser Pointer Events, ARIA tabs/switches, `requestAnimationFrame`, Python static server, headless Chromium visual audit.

## Global Constraints

- Do not rewrite the Canvas renderer or generative algorithms.
- Preserve all existing controls and parameter depth.
- Preserve PR #5 fixes: pinch zoom enabled; tab/panel ARIA state; switch `aria-checked`; batched redraw scheduling.
- Preserve existing element IDs used by JavaScript bindings.
- Preserve local XP/streak and gallery persistence behavior.
- Mobile document body must not vertically scroll.
- Live canvas must remain visible and at least 220 px tall at 360×740, 390×844, and 412×915.
- Only the control-sheet interior may vertically scroll on target mobile sizes.
- Keep large touch targets; solve density through sheet states and progressive disclosure rather than shrinking controls.
- Sheet states: `peek` ≈ 88 px, `working` ≈ 42dvh default, `expanded` ≈ 62dvh.
- Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

---

### Task 1: Lock the mobile shell and regression assertions

**Files:**
- Modify: `public/mandala-v2.html`
- Create: `scripts/verify-mandala-v2-instrument.py`

**Interfaces:**
- Consumes: existing `.topbar`, `.app`, `.stage-card`, `.pattern-section`, `.control-shell`, `.tabbar`, `.control-panel`, `.bottom-dock` structure.
- Produces: structural hooks `.instrument-shell`, `.instrument-stage`, `.live-viewport`, `.control-sheet`, `.sheet-scroll`, `.sheet-actions`, `[data-sheet-state]` used by later tasks.

- [ ] **Step 1: Write the failing static verification script**

Create `scripts/verify-mandala-v2-instrument.py` with assertions that read `public/mandala-v2.html` and fail unless all of these literals/patterns exist:

```python
from pathlib import Path
import re

html = Path("public/mandala-v2.html").read_text(encoding="utf-8")

required = [
    'class="instrument-shell"',
    'class="instrument-stage"',
    'class="live-viewport',
    'class="control-sheet',
    'class="sheet-scroll"',
    'class="sheet-actions',
    'data-sheet-state="working"',
    'role="tablist"',
    'role="tabpanel"',
    'role="switch"',
    'aria-checked=',
]
for token in required:
    assert token in html, f"missing required instrument token: {token}"

assert "user-scalable=no" not in html, "pinch zoom must remain enabled"
assert re.search(r"html\s*,?\s*body[^}]*overflow\s*:\s*hidden", html, re.S), "mobile shell must suppress body scrolling"
assert "100dvh" in html, "instrument shell must use dynamic viewport height"
assert "min-height:220px" in html.replace(" ", ""), "live viewport must retain 220px minimum"
print("mandala-v2 instrument structure: ok")
```

- [ ] **Step 2: Run it and verify it fails against current `main` structure**

Run:

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: FAIL on `class="instrument-shell"`.

- [ ] **Step 3: Recompose the page shell without changing renderer IDs**

In `public/mandala-v2.html`:

- wrap the header + app in `.instrument-shell`;
- make the content region `.instrument-stage`;
- retain the existing stage card as the live viewport container by adding `.live-viewport`;
- transform `.control-shell` into `.control-sheet` with `data-sheet-state="working"`;
- introduce `.sheet-scroll` around pattern + tab panels;
- move the existing bottom dock markup into the sheet as `.sheet-actions` while retaining `mutateBtn`, `resetBtn`, `saveBtn`, and `exportBtn` IDs;
- remove the old page-level pattern section from between stage and controls and place its pattern rail at the start of the Shape sheet content.

- [ ] **Step 4: Add fixed-shell CSS**

Implement mobile CSS equivalent to:

```css
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.instrument-shell {
  width: min(100%, 1180px);
  height: 100dvh;
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}

.instrument-stage {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(220px, 1fr) auto;
  overflow: hidden;
}

.live-viewport {
  min-height: 220px;
  position: relative;
  overflow: hidden;
}

.control-sheet {
  --sheet-height: 42dvh;
  height: var(--sheet-height);
  max-height: 62dvh;
  min-height: 88px;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  overflow: hidden;
}

.sheet-scroll {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.sheet-actions {
  position: relative;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
}
```

Keep desktop overrides separate under the existing wide-screen media query so wide layouts remain useful.

- [ ] **Step 5: Re-run structural verification**

Run:

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/mandala-v2.html scripts/verify-mandala-v2-instrument.py
git commit -m "feat: recompose mandala v2 as fixed instrument"
```

---

### Task 2: Implement three-state sheet interaction

**Files:**
- Modify: `public/mandala-v2.html`
- Modify: `scripts/verify-mandala-v2-instrument.py`

**Interfaces:**
- Consumes: `.control-sheet[data-sheet-state]` from Task 1.
- Produces: `setSheetState(state)`, `cycleSheetState()`, and pointer-drag snap behavior.

- [ ] **Step 1: Extend the static verifier with sheet-state requirements**

Add assertions for:

```python
for token in [
    'class="sheet-handle',
    'data-sheet-state="peek"',
    'data-sheet-state="working"',
    'data-sheet-state="expanded"',
    'function setSheetState',
    'function cycleSheetState',
    'aria-expanded',
]:
    assert token in html, f"missing sheet-state behavior: {token}"
```

The state tokens may live in CSS selectors or JavaScript constants.

- [ ] **Step 2: Run verifier and confirm failure**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: FAIL on the sheet handle/state controller.

- [ ] **Step 3: Add the sheet handle and state CSS**

Add a semantic button before the tabs:

```html
<button
  class="sheet-handle tactile"
  id="sheetHandle"
  type="button"
  aria-label="Resize control panel"
  aria-expanded="true"
  aria-describedby="sheetStateLabel"
>
  <span class="sheet-grabber" aria-hidden="true"></span>
  <span id="sheetStateLabel" class="sr-only">Working controls</span>
</button>
```

Define:

```css
.control-sheet[data-sheet-state="peek"] { --sheet-height: 88px; }
.control-sheet[data-sheet-state="working"] { --sheet-height: 42dvh; }
.control-sheet[data-sheet-state="expanded"] { --sheet-height: 62dvh; }
```

Ensure Peek keeps tabs/quick affordance visible without exposing an unusable partial card.

- [ ] **Step 4: Add state controller**

Implement:

```js
const sheet = $('.control-sheet');
const sheetHandle = $('#sheetHandle');
const sheetStates = ['peek', 'working', 'expanded'];

function setSheetState(state) {
  if (!sheetStates.includes(state)) return;
  sheet.dataset.sheetState = state;
  const expanded = state !== 'peek';
  sheetHandle.setAttribute('aria-expanded', String(expanded));
  $('#sheetStateLabel').textContent =
    state === 'peek' ? 'Controls collapsed' :
    state === 'expanded' ? 'Controls expanded' :
    'Working controls';
  requestAnimationFrame(sizeCanvas);
}

function cycleSheetState() {
  const index = sheetStates.indexOf(sheet.dataset.sheetState);
  setSheetState(sheetStates[(index + 1) % sheetStates.length]);
}

sheetHandle.addEventListener('click', cycleSheetState);
```

- [ ] **Step 5: Add pointer drag with gesture boundaries**

Use Pointer Events only from the handle region. On pointer down, capture the pointer and record `clientY`; on move, update a temporary sheet height; on pointer up/cancel, snap to the nearest state by viewport-relative height. Do not bind drag listeners to `.sheet-scroll`, `.range`, or `.pattern-rail`, so slider and horizontal rail gestures remain native.

Use a reduced-motion guard:

```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
```

When reduced motion is active, omit spring transitions during state changes.

- [ ] **Step 6: Re-run verifier**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add public/mandala-v2.html scripts/verify-mandala-v2-instrument.py
git commit -m "feat: add three-state mandala control sheet"
```

---

### Task 3: Add pattern-aware progressive control ordering

**Files:**
- Modify: `public/mandala-v2.html`
- Modify: `scripts/verify-mandala-v2-instrument.py`

**Interfaces:**
- Consumes: existing `P.pattern`, `[data-pattern]`, `[data-key]`, `[data-step]`, and control cards.
- Produces: `patternPriority` configuration and `applyPatternPriority(pattern)`.

- [ ] **Step 1: Add failing verifier assertions**

Require:

```python
for token in [
    'const patternPriority',
    'function applyPatternPriority',
    "rose:['freq','amp','radius','angle']",
    "toroid:['symmetry','phase','spin','pulse']",
]:
    assert token.replace(' ', '') in html.replace(' ', ''), f"missing progressive disclosure rule: {token}"
```

- [ ] **Step 2: Run and confirm failure**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: FAIL on `patternPriority`.

- [ ] **Step 3: Tag control cards with stable parameter ownership**

Add `data-control="..."` to cards/steppers so ordering is independent of label text. Preserve current input IDs and data attributes.

- [ ] **Step 4: Define pattern priority**

```js
const patternPriority = {
  mandala: ['symmetry', 'layers', 'radius', 'freq'],
  rose: ['freq', 'amp', 'radius', 'angle'],
  spiro: ['freq', 'amp', 'radius', 'phase'],
  lissajous: ['freq', 'amp', 'phase', 'angle'],
  sacred: ['symmetry', 'layers', 'radius', 'angle'],
  toroid: ['symmetry', 'phase', 'spin', 'pulse']
};
```

- [ ] **Step 5: Implement ordering without deleting secondary controls**

`applyPatternPriority(pattern)` should assign CSS `order` values to `[data-control]` cards in the relevant tab and add a `.priority-control` class to the first four. All non-priority controls remain present and internally scrollable.

Call the function from initial setup, pattern selection, mutate, reset, and preset sync paths after `P.pattern` may change.

- [ ] **Step 6: Run verifier**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add public/mandala-v2.html scripts/verify-mandala-v2-instrument.py
git commit -m "feat: prioritize mandala controls by pattern"
```

---

### Task 4: Preserve accessibility/render regressions through the recompose

**Files:**
- Modify: `scripts/verify-mandala-v2-instrument.py`
- Modify if necessary: `public/mandala-v2.html`

**Interfaces:**
- Consumes: PR #5 tab/switch/redraw behavior.
- Produces: explicit regression checks for those behaviors after the layout rewrite.

- [ ] **Step 1: Add regression checks**

Verify the HTML still contains the repaired behavior:

```python
regressions = [
    'aria-selected=',
    'aria-controls=',
    'aria-labelledby=',
    'role="tabpanel"',
    'role="switch"',
    'aria-checked=',
    'requestAnimationFrame',
]
for token in regressions:
    assert token in html, f"regression: missing {token}"

assert 'user-scalable=no' not in html
```

Also assert all existing action IDs remain:

```python
for element_id in ['mutateBtn', 'resetBtn', 'saveBtn', 'exportBtn', 'playButton', 'art']:
    assert f'id="{element_id}"' in html
```

- [ ] **Step 2: Run verifier**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS; if any regression assertion fails, repair `public/mandala-v2.html` before proceeding.

- [ ] **Step 3: Commit**

```bash
git add public/mandala-v2.html scripts/verify-mandala-v2-instrument.py
git commit -m "test: guard mandala v2 interaction regressions"
```

---

### Task 5: Update visual audit for the fixed instrument acceptance sizes

**Files:**
- Modify: `scripts/termux-visual-audit.sh`

**Interfaces:**
- Consumes: `public/mandala-v2.html` served by `python -m http.server`.
- Produces: screenshots at the three required mobile sizes plus tablet/desktop reference captures.

- [ ] **Step 1: Point the audit to Mandala V2 and expand target sizes**

Change:

```bash
BASE="http://127.0.0.1:${PORT}/mandala-v2.html"
```

Use:

```bash
for VP in \
  "360,740,mobile-small" \
  "390,844,mobile-reference" \
  "412,915,mobile-large" \
  "768,1024,tablet" \
  "1366,768,desktop"; do
```

Name outputs `mandala-v2-${NAME}.png`.

- [ ] **Step 2: Add a DOM geometry probe when Chromium is available**

After the screenshot pass, use Chromium headless with a short inline/devtools-compatible evaluation or a temporary data script to record, for each mobile viewport:

- `document.scrollingElement.scrollHeight <= innerHeight + 1`
- live viewport bounding height `>= 220`
- control sheet bottom `<= innerHeight`
- sheet scroll region `scrollHeight >= clientHeight` when content overflows

If the installed Chromium does not expose a convenient evaluation CLI, keep screenshot capture authoritative and print manual geometry checks as required audit steps rather than adding a new dependency.

- [ ] **Step 3: Run static verifier first**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS.

- [ ] **Step 4: Run visual audit in Termux-compatible environment**

```bash
bash scripts/termux-visual-audit.sh
```

Expected: screenshots for all five viewports under `artifacts/visual-audit/<timestamp>/`.

- [ ] **Step 5: Inspect mobile captures**

For 360×740, 390×844, and 412×915 confirm:

- canvas visible;
- canvas height ≥ 220 px;
- no page-level vertical continuation below the viewport;
- action row inside sheet and unobscured;
- working sheet shows usable controls;
- pattern rail is inside the sheet;
- no clipped topbar or safe-area collision.

- [ ] **Step 6: Commit**

```bash
git add scripts/termux-visual-audit.sh
git commit -m "test: audit mandala fixed-instrument viewports"
```

---

### Task 6: Final verification and PR handoff

**Files:**
- Review: `public/mandala-v2.html`
- Review: `scripts/verify-mandala-v2-instrument.py`
- Review: `scripts/termux-visual-audit.sh`
- Review: `docs/superpowers/specs/2026-08-10-mandala-fixed-instrument-control-sheet-design.md`

**Interfaces:**
- Produces: one reviewable PR against `main`.

- [ ] **Step 1: Run final static verification**

```bash
python scripts/verify-mandala-v2-instrument.py
```

Expected: PASS.

- [ ] **Step 2: Check the diff only contains bounded Mandala V2 work**

```bash
git diff main...HEAD -- public/mandala-v2.html scripts/verify-mandala-v2-instrument.py scripts/termux-visual-audit.sh docs/superpowers/
```

Expected: no unrelated application/refactor changes.

- [ ] **Step 3: Confirm all acceptance criteria in the design doc**

Check each numbered acceptance criterion explicitly against code/static assertions/visual captures. Any criterion without evidence blocks PR readiness.

- [ ] **Step 4: Open PR**

Title:

```text
Mandala V2: keep live canvas visible with fixed control sheet
```

PR body must include:

```markdown
## Why
Mandala V2 had large enough touch targets, but deeper controls required scrolling the live artwork out of view. This made the page behave like settings rather than a live generative instrument.

## What changed
- locks the mobile route to a `100dvh` fixed instrument shell
- keeps the live canvas visible while controls are used
- moves pattern selection into the sheet
- moves Mutate / Reset / Save / PNG into the sheet footer
- adds Peek / Working / Expanded sheet states
- prioritizes controls by active pattern without removing advanced controls
- preserves PR #5 accessibility and redraw repairs
- adds static regression checks and target viewport visual-audit coverage

## Acceptance target
360×740, 390×844, 412×915: no body vertical scroll, canvas ≥220 px and always visible, only sheet interior scrolls, actions never obscure controls.
```

- [ ] **Step 5: Request review only after visual evidence exists**

Do not merge solely on static assertions. Attach or reference the generated mobile captures and request review after they have been inspected.
