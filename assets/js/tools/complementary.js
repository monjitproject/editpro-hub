/**
 * Complementary & Color Schemes Tool
 * Calculate various color schemes from a base color.
 * Controls:
 *   color#baseColor (default: #4f46e5)
 * Calculates: complementary (180deg), analogous (+/-30deg),
 *   triadic (+/-120deg), split-complementary (+/-150deg).
 * Displays all color schemes as swatches with hex values.
 */
document.addEventListener('DOMContentLoaded', () => {
  const baseColorInput = document.getElementById('baseColor');
  const schemesContainer = document.getElementById('schemesContainer');

  function hslToHexStr(h, s, l) {
    h = ((h % 360) + 360) % 360; // normalize to 0-360
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));
    const rgb = Utils.hslToRgb(h, s, l);
    return Utils.rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
  }

  function generateSchemes() {
    if (!baseColorInput || !schemesContainer) return;

    const hex = baseColorInput.value;
    const rgb = Utils.hexToRgb(hex);
    const hsl = Utils.rgbToHsl(rgb.r, rgb.g, rgb.b);

    const baseH = hsl.h;
    const baseS = hsl.s;
    const baseL = hsl.l;

    const schemes = [
      {
        name: 'Base Color',
        colors: [
          { hex: hex.toUpperCase(), label: 'Base' }
        ]
      },
      {
        name: 'Complementary',
        colors: [
          { hex: hslToHexStr(baseH, baseS, baseL), label: 'Base' },
          { hex: hslToHexStr(baseH + 180, baseS, baseL), label: 'Complement' }
        ]
      },
      {
        name: 'Analogous',
        colors: [
          { hex: hslToHexStr(baseH - 30, baseS, baseL), label: '-30°' },
          { hex: hslToHexStr(baseH - 15, baseS, baseL), label: '-15°' },
          { hex: hslToHexStr(baseH, baseS, baseL), label: 'Base' },
          { hex: hslToHexStr(baseH + 15, baseS, baseL), label: '+15°' },
          { hex: hslToHexStr(baseH + 30, baseS, baseL), label: '+30°' }
        ]
      },
      {
        name: 'Triadic',
        colors: [
          { hex: hslToHexStr(baseH, baseS, baseL), label: 'Base' },
          { hex: hslToHexStr(baseH + 120, baseS, baseL), label: '+120°' },
          { hex: hslToHexStr(baseH + 240, baseS, baseL), label: '+240°' }
        ]
      },
      {
        name: 'Split-Complementary',
        colors: [
          { hex: hslToHexStr(baseH, baseS, baseL), label: 'Base' },
          { hex: hslToHexStr(baseH + 150, baseS, baseL), label: '+150°' },
          { hex: hslToHexStr(baseH + 210, baseS, baseL), label: '+210°' }
        ]
      },
      {
        name: 'Tetradic (Square)',
        colors: [
          { hex: hslToHexStr(baseH, baseS, baseL), label: 'Base' },
          { hex: hslToHexStr(baseH + 90, baseS, baseL), label: '+90°' },
          { hex: hslToHexStr(baseH + 180, baseS, baseL), label: '+180°' },
          { hex: hslToHexStr(baseH + 270, baseS, baseL), label: '+270°' }
        ]
      }
    ];

    schemesContainer.innerHTML = '';

    schemes.forEach((scheme) => {
      const section = document.createElement('div');
      section.className = 'scheme-section';

      const title = document.createElement('h4');
      title.className = 'scheme-title';
      title.textContent = scheme.name;
      section.appendChild(title);

      const row = document.createElement('div');
      row.className = 'scheme-swatches';

      scheme.colors.forEach((color) => {
        const swatch = document.createElement('div');
        swatch.className = 'scheme-swatch';
        swatch.style.backgroundColor = color.hex;

        // Determine text color based on luminance
        const cRgb = Utils.hexToRgb(color.hex);
        const luminance = (0.299 * cRgb.r + 0.587 * cRgb.g + 0.114 * cRgb.b) / 255;
        swatch.style.color = luminance < 0.5 ? '#ffffff' : '#000000';

        swatch.innerHTML = `
          <span class="scheme-hex">${color.hex}</span>
          <span class="scheme-label">${color.label}</span>
        `;

        swatch.title = `Click to copy ${color.hex}`;
        swatch.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(color.hex).then(() => {
              Utils.showToast(`Copied: ${color.hex}`, 'success');
            });
          }
        });

        row.appendChild(swatch);
      });

      section.appendChild(row);
      schemesContainer.appendChild(section);
    });
  }

  // ── Control event listeners ──
  if (baseColorInput) {
    baseColorInput.addEventListener('input', generateSchemes);
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (baseColorInput) baseColorInput.value = '#4f46e5';
      generateSchemes();
      Utils.showToast('Color schemes reset to default', 'info');
    });
  }

  // ── Copy all schemes as text ──
  const copyAllBtn = document.getElementById('copyAllSchemes');
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      const hexes = schemesContainer ? schemesContainer.querySelectorAll('.scheme-hex') : [];
      const text = Array.from(hexes).map(el => el.textContent).join('\n');
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(() => {
          Utils.showToast('All colors copied to clipboard', 'success');
        });
      }
    });
  }

  // ── Initialize ──
  generateSchemes();
});
