export function buildMandalaUniforms(cfg, width, height, t) {
  return {
    uTime: { value: t ?? 0 },
    uResolution: { value: [width, height] },
    uNoiseAmp: { value: cfg.engine?.noiseAmp ?? 0 },
    uComplexity: { value: cfg.engine?.complexity ?? 1 },
    uAlpha: { value: cfg.style?.opacity ?? 0.8 },
    uColorMode: { value: 0 }
  };
}
export function applyRendererMobilePolicy(renderer, isMobile = false) {
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(Math.min(dpr, isMobile ? 2 : 2.5));
}
