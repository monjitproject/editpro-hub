/**
 * Random Color Generator Tool
 * Generate random colors with hue and saturation controls.
 * Controls:
 *   range#hueRange (0-360, default: 360) — limits hue range
 *   range#satRange (0-100, default: 50)  — minimum saturation
 * Generate button creates new random colors displayed as large swatches.
 * Click a swatch to copy its hex value.
 */
document.addEventListener('DOMContentLoaded', () => {
  const hueRange = document.getElementById('hueRange');
  const satRange = document.getElementById('satRange');
  const hueVal = document.getElementById('hueVal');
  const satVal = document.getElementById('satVal');
  const generateBtn = document.getElementById('generateBtn');
  const colorGrid = document.getElementById('colorGrid');
  const colorCount = document.getElementById('colorCount');

  function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateRandomColor() {
    const maxHue = hueRange ? parseInt(hueRange.value) : 360;
    const minSat = satRange ? parseInt(satRange.value) : 50;

    const h = randomInRange(0, maxHue);
    const s = randomInRange(minSat, 100);
    const l = randomInRange(30, 80);

    const rgb = Utils.hslToRgb(h, s, l);
    const hex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();

    return { hex, h, s, l, r: rgb.r, g: rgb.g, b: rgb.b };
  }

  function generateColors() {
    if (!colorGrid) return;
    colorGrid.innerHTML = '';

    const count = colorCount ? parseInt(colorCount.value) || 12 : 12;
    const colors = [];

    for (let i = 0; i < count; i++) {
      colors.push(generateRandomColor());
    }

    colors.forEach((color) => {
      const swatch = document.createElement('div');
      swatch.className = 'random-swatch';
      swatch.style.backgroundColor = color.hex;
      swatch.innerHTML = `
        <span class="swatch-label">${color.hex}</span>
      `;

      // Determine text color based on luminance
      const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
      if (luminance < 0.5) {
        swatch.style.color = '#ffffff';
      } else {
        swatch.style.color = '#000000';
      }

      swatch.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(color.hex).then(() => {
            Utils.showToast(`Copied: ${color.hex}`, 'success');
          });
        }
      });

      swatch.title = `Click to copy ${color.hex}`;
      colorGrid.appendChild(swatch);
    });
  }

  // ── Control event listeners ──
  if (hueRange) {
    hueRange.addEventListener('input', () => {
      if (hueVal) hueVal.textContent = hueRange.value + '°';
    });
  }
  if (satRange) {
    satRange.addEventListener('input', () => {
      if (satVal) satVal.textContent = satRange.value + '%';
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateColors);
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (hueRange) hueRange.value = 360;
      if (satRange) satRange.value = 50;
      if (hueVal) hueVal.textContent = '360°';
      if (satVal) satVal.textContent = '50%';
      if (colorCount) colorCount.value = 12;
      generateColors();
      Utils.showToast('Random color generator reset', 'info');
    });
  }

  // ── Initialize with first set ──
  generateColors();
});
