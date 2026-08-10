from pathlib import Path
import re

html = Path("public/mandala-v2.html").read_text(encoding="utf-8")
compact = re.sub(r"\s+", "", html)

required = [
    'class="instrument-shell"',
    'class="instrument-stage"',
    'live-viewport',
    'control-sheet',
    'class="sheet-scroll"',
    'sheet-actions',
    'data-sheet-state="working"',
    'class="sheet-handle',
    'role="tablist"',
    'role="tabpanel"',
    'role="switch"',
    'aria-checked=',
    'aria-selected=',
    'aria-controls=',
    'aria-labelledby=',
    'aria-expanded=',
    'function setSheetState',
    'function cycleSheetState',
    'const patternPriority',
    'function applyPatternPriority',
    'requestAnimationFrame',
]

for token in required:
    assert token in html, f"missing required instrument token: {token}"

for state in ("peek", "working", "expanded"):
    selector = f'[data-sheet-state="{state}"]'
    assert selector in compact, f"missing sheet state selector: {state}"

for element_id in ("mutateBtn", "resetBtn", "saveBtn", "exportBtn", "playButton", "art"):
    assert f'id="{element_id}"' in html, f"missing existing control id: {element_id}"

for expected in (
    "rose:['freq','amp','radius','angle']",
    "toroid:['symmetry','phase','spin','pulse']",
):
    assert expected in compact, f"missing progressive disclosure rule: {expected}"

assert "user-scalable=no" not in html, "pinch zoom must remain enabled"
assert "100dvh" in html, "instrument shell must use dynamic viewport height"
assert "min-height:220px" in compact, "live viewport must retain 220px minimum"
assert re.search(r"html\s*,\s*body\s*\{[^}]*overflow\s*:\s*hidden", html, re.S), (
    "mobile shell must suppress body scrolling"
)

print("mandala-v2 instrument structure: ok")
