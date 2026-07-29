(function () {
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2.5);
  window.__cfMobilePolicy = { isMobile, dpr, maxDensity: isMobile ? 900 : 1800 };

  const densitySlider = document.getElementById("sDensity");
  if (densitySlider && isMobile) {
    densitySlider.max = "900";
    if (parseInt(densitySlider.value, 10) > 900) densitySlider.value = "900";
  }

  const canvas = document.getElementById("mandalaCanvas");
  if (canvas) canvas.style.touchAction = "none";
})();
