# ChromaFlora Design System v5.0

**Creator:** Jennipher Troup · [girlwithstarryeyes@outlook.com](mailto:girlwithstarryeyes@outlook.com)

> *Part of the **Morphica** family — a series of design systems that translate physical material properties and natural phenomena into browser-native UI language.*

A cosmic bioluminescent creative platform and generative art suite — built entirely in pure HTML/CSS/JavaScript. No frameworks. No external images. All visual output is procedural Canvas 2D or CSS. Everything that renders, you can trace to a formula.

🔴 **[Live Demo](https://replit.com/@qt314wink/chromaflora-sitezip)** — runs in browser, no install required.

🟣 **[Mandala Engine](https://chromaflora.replit.app/mandala.html)** — direct link to the real-time mandala generator.

---

## What It Is

ChromaFlora is a 20-page browser application that combines a generative art studio, harmonic audio synthesizer, digital-to-physical plotter pipeline, creator community features, and a marketplace — all without a single external image asset. Every visual element is drawn at runtime from mathematical primitives.

The system demonstrates that a full creative platform can be built using only the browser's native capabilities: Canvas 2D API, Web Audio API, CSS custom properties, and localStorage. No React, no build step, no CDN dependencies.

---

## Pages & Capabilities

| Page | What It Does |
|---|---|
| `index.html` | Main landing — 18-tile live gallery, each tile a navigable canvas effect |
| `studio.html` | Art Studio — 12 procedural style presets, sacred geometry overlays, Spirograph/Harmonograph tools, semantic prompt parser, physical export panel |
| `player.html` | **ChromaSynth v2** — harmonic partial synthesis (8 Fourier partials per voice), 9 modal scales, 4 tuning systems, 4 visualizer modes |
| `plotter.html` | Digital-to-physical pipeline — SVG (AxiDraw-ready), GCode (.nc), TurtleToy scripts; 8 generative pattern types |
| `ai-studio.html` | AI Studio — HuggingFace Inference API, Leonardo.ai, Replicate/ComfyUI/SDXL, pipeline builder |
| `project.html` | Embed variant system — 5 orientations × 4 sizes × 5 color themes × 7 code formats |
| `gallery.html` | Creator gallery — upvotes, comments, remix, trending |
| `marketplace.html` | Asset packs, commission board, NFT callout |
| `challenges.html` | Active challenges + leaderboard |
| `admin.html` | Password-protected CMS dashboard |

---

## Key Technical Systems

### ChromaSynth v2 Audio Engine
Harmonic synthesis built on the Web Audio API. Each voice is constructed from up to 8 sine-wave partials following the Fourier overtone series. Supports 9 modal scales, 4 historical tuning systems (Equal Temperament, Just Intonation, Pythagorean, Quarter-comma Meantone), ADSR per voice, spatial panning, and a full FX chain (reverb, delay, saturation, bass boost, hi-pass, compressor).

### Sacred Geometry + Math Tools
Non-destructive canvas overlay system for Phi Grid, Fibonacci spiral, Flower of Life, Metatron's Cube, Vesica Piscis, and Seed of Life. Combined with Spirograph (hypotrochoid curves) and Harmonograph (damped pendulum oscillation) drawing tools that output both screen renders and plotter-ready exports.

### Digital-to-Physical Pipeline
Generates machine-ready output for AxiDraw, EggBot, WaterColorBot, and GRBL machines. SVG exports are mm-accurate. GCode uses G0/G1 with Z-lift. This is the bridge between screen-based generative art and physical mark-making.

### Semantic Prompt Parser
Real-time natural language analysis (600ms debounce) that extracts style, color, shape, and material keywords and auto-updates the studio's parameter dropdowns.

### Embed Variant System
Every project embeds in 35 configurations: 5 orientations × 4 sizes × 5 color themes, exported as 7 code formats including typed Next.js (SSR-safe) and a native Web Component (`<chroma-flora>`).

---

## 12 Art Style Presets

| # | Style | Aesthetic |
|---|---|---|
| 1 | Void Crystal | Geometric crystal spikes, cyan/indigo |
| 2 | Nebula Flow | Flowing color ribbons, cosmic depth |
| 3 | Acid Pour | Neon cell-drip fluid simulation |
| 4 | Biolume Tide | Glowing deep-sea organism tendrils |
| 5 | Cosmic Mandala | Symmetric petal rings, gold/purple |
| 6 | Plasma Storm | Electric arc lightning networks |
| 7 | Cherry Data | Delicate floral + data grid overlay |
| 8 | Dark Matter | Point-network graph topology |
| 9 | Neon Garden | Procedural neon stem + bloom flowers |
| 10 | Space Rift | Fractal void crack + starfield |
| 11 | Electric Coral | Branching recursive coral fractals |
| 12 | Chrome Dreams | Spiral vortex with chrome sheen |

---

## Design Tokens

```css
--purple: #a855f7;   --aqua: #22d3ee;   --pink: #ec4899;
--orange: #f97316;   --green: #10b981;

--t-snap:   0.1s cubic-bezier(0.4,0,0.2,1);
--t-spring: 0.4s cubic-bezier(0.34,1.56,0.64,1);
```

---

## Running Locally

```bash
cd public
python3 -m http.server 8000
# open http://localhost:8000
```

No install. No build step. No node_modules.

---

## The Morphica Family

| System | Material Source | Aesthetic |
|---|---|---|
| **ChromaFlora** | Bioluminescence, cosmic growth | Procedural glow, living light, bloom |
| [Jewelmorphism](https://github.com/qt314wink/neumorphism-soft-ui-design-system) | Gems, crystal, refracted light | Chromatic depth, physics interaction |
| [Woodmorphism](https://github.com/qt314wink/woodmorphism) | Wood grain, organic structure | Warmth, grain flow, structural honesty |

---

## Design Philosophy

ChromaFlora is a proof of concept for **constraint-based generative design**: the limitation of using only browser-native APIs isn't a compromise — it's the parameter that produces integrity. Every effect is explainable, every export is portable, every render is reproducible.

---

girlwithstarryeyes@outlook.com · Philadelphia, PA
