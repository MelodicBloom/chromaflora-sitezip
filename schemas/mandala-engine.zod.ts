import { z } from "zod";
const hex = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/);
export const MandalaEngineSchema = z.object({
  version: z.literal("1.0.0"),
  engine: z.object({
    mode: z.enum(["cpu-worker", "three-shader-hybrid"]).default("cpu-worker"),
    rings: z.number().int().min(1).max(64).default(12),
    steps: z.number().int().min(16).max(4096).default(720),
    complexity: z.number().min(0).max(4).default(1),
    seed: z.number().int().min(0).max(2147483647).default(1337),
    formula: z.enum(["polar", "rose", "spirograph", "lissajous", "sacred", "toroid"]).default("polar"),
    symmetry: z.number().int().min(1).max(24).default(8),
    layers: z.number().int().min(1).max(12).default(4),
    radius: z.number().min(20).max(100).default(85),
    freq: z.number().min(0.5).max(20).default(3),
    amp: z.number().min(0).max(160).default(40),
    phase: z.number().min(0).max(Math.PI * 2).default(0),
    harm: z.number().min(0).max(1).default(0),
    mirror: z.boolean().default(true),
    golden: z.boolean().default(false),
    noiseAmp: z.number().min(0).max(80).default(0),
    noiseScale: z.number().min(0.002).max(0.2).default(0.02),
    noiseOctaves: z.number().int().min(1).max(8).default(3)
  }),
  render: z.object({
    dprMode: z.enum(["auto", "fixed"]).default("auto"),
    fixedDpr: z.number().min(0.5).max(4).optional(),
    maxDprMobile: z.number().min(1).max(3).default(2),
    maxDprDesktop: z.number().min(1).max(4).default(2.5),
    touchAction: z.enum(["none", "manipulation"]).default("none"),
    safeAreaInsets: z.boolean().default(true),
    targetFps: z.number().int().min(24).max(120).default(60),
    adaptiveQuality: z.boolean().default(true)
  }),
  style: z.object({
    colorMode: z.enum(["palette", "rainbow", "gradient", "mono"]).default("palette"),
    color: hex.default("#a855f7"),
    palette: z.array(hex).min(1).max(16),
    opacity: z.number().min(0.05).max(1).default(0.8),
    lineWeight: z.number().min(0.2).max(6).default(1.2),
    glow: z.boolean().default(true),
    glowAmt: z.number().min(0).max(1).default(0.5),
    bg: z.enum(["void", "radial", "dark", "white"]).default("void")
  }),
  animation: z.object({
    enabled: z.boolean().default(false),
    spin: z.number().min(-0.03).max(0.03).default(0),
    pulse: z.number().min(0).max(3).default(0),
    noiseAnim: z.boolean().default(false),
    trail: z.boolean().default(false)
  }),
  worker: z.object({
    enabled: z.boolean().default(true),
    transferable: z.boolean().default(true),
    batchSize: z.number().int().min(128).max(131072).default(8192),
    maxStepsPerDispatch: z.number().int().min(60).max(720).default(180)
  })
});
export type MandalaEngineConfig = z.infer<typeof MandalaEngineSchema>;
