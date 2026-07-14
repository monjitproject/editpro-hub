/**
 * Color Blender Tool
 * Mix two colors together with adjustable ratio.
 * Controls:
 *   color#blendColor1 (default: #ff0000)
 *   color#blendColor2 (default: #0000ff)
 *   range#blendRatio  (0-100, default: 50)
 * Displays the blended result and a 5-step gradient between the two colors.
 */
document.addEventListener('DOMContentLoaded', () => {
  const blendColor1 = document.getElementById('blendColor1');
  const blendColor2 = document.getElementById('blendColor2');
  const blendRatio = document.getElementById('blendRatio');
  const ratioVal = document.getElementById('ratioVal');
  const resultSwatch = document.getElementById('blendResult');
  const resultHex = document.getElementById('blendHex');
  const resultRgb = document.getElementById('blendRgb');
  const resultHsl = document.getElementById('blendHsl');
  const gradientSteps = document.getElementById('gradientSteps');

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function blendColors() {
    if (!blendColor1 || !blendColor2) return;

    const c1 = Utils.hexToRgb(blendColor1.value);
    const c2 = Utils.hexToRgb(blendColor2.value);
    const ratio = blendRatio ? parseInt(blendRatio.value) / 100 : 0.5;

    const r = lerp(c1.r, c2.r, ratio);
    const g = lerp(c1.g, c2.g, ratio);
    const b = lerp(c1.b, c2.b, ratio);

    const hex = Utils.rgbToHex(r, g, b).toUpperCase();
    const hsl = Utils.rgbToHsl(r, g, b);

    // Update display
    if (resultSwatch) resultSwatch.style.backgroundColor = hex;
    if (resultHex) resultHex.textContent = hex;
    if (resultRgb) resultRgb.textContent = `rgb(${r}, ${g}, ${b})`;
    if (resultHsl) resultHsl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    if (ratioVal) ratioVal.textContent = blendRatio ? blendRatio.value + '%' : '50%';

    // Render 5-step gradient
    renderGradientSteps();
  }

  function renderGradientSteps() {
    if (!gradientSteps) return;
    gradientSteps.innerHTML = '';

    const c1 = Utils.hexToRgb(blendColor1.value);
    const c2 = Utils.hexToRgb(blendColor2.value);

    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const r = lerp(c1.r, c2.r, t);
      const g = lerp(c1.g, c2.g, t);
      const b = lerp(c1.b, c2.b, t);
      const hex = Utils.rgbToHex(r, g, b).toUpperCase();

      const step = document.createElement('div');
      step.className = 'gradient-step';
      step.style.backgroundColor = hex;
      step.innerHTML = `<span>${hex}</span>`;
      step.title = `Click to copy ${hex}`;
      step.style.flex = '1';

      // Determine text color
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      step.style.color = luminance < 0.5 ? '#fff' : '#000';

      step.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(hex).then(() => {
            Utils.showToast(`Copied: ${hex}`, 'success');
          });
        }
      });

      gradientSteps.appendChild(step);
    }
  }

  // ── Control event listeners ──
  if (blendColor1) blendColor1.addEventListener('input', blendColors);
  if (blendColor2) blendColor2.addEventListener('input', blendColors);
  if (blendRatio) blendRatio.addEventListener('input', blendColors);

  // ── Copy result ──
  const copyBtn = document.getElementById('copyBlendResult');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const hex = resultHex ? resultHex.textContent : '';
      if (navigator.clipboard && hex) {
        navigator.clipboard.writeText(hex).then(() => {
          Utils.showToast(`Copied: ${hex}`, 'success');
        });
      }
    });
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (blendColor1) blendColor1.value = '#ff0000';
      if (blendColor2) blendColor2.value = '#0000ff';
      if (blendRatio) blendRatio.value = 50;
      blendColors();
      Utils.showToast('Color blender reset to default', 'info');
    });
  }

  // ── Initialize ──
  blendColors();
});
