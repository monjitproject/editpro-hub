/**
 * Color Converter Tool
 * Interactive color converter — change one format and all others update.
 * Controls:
 *   input#inputColor  (color input, default: #4f46e5)
 *   input#hexInput    (text, hex value)
 *   input#rgbInput    (text, rgb value)
 *   input#hslInput    (text, hsl value)
 * Shows a live color preview swatch.
 */
document.addEventListener('DOMContentLoaded', () => {
  const inputColor = document.getElementById('inputColor');
  const hexInput = document.getElementById('hexInput');
  const rgbInput = document.getElementById('rgbInput');
  const hslInput = document.getElementById('hslInput');
  const previewSwatch = document.getElementById('colorSwatch');
  let isUpdating = false;

  function updateFromHex(hex) {
    if (isUpdating) return;
    isUpdating = true;

    // Validate hex
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      isUpdating = false;
      return;
    }
    hex = '#' + hex;

    const rgb = Utils.hexToRgb(hex);
    const hsl = Utils.rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (inputColor) inputColor.value = hex;
    if (hexInput) hexInput.value = hex.toUpperCase();
    if (rgbInput) rgbInput.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    if (hslInput) hslInput.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    if (previewSwatch) previewSwatch.style.backgroundColor = hex;

    isUpdating = false;
  }

  function updateFromRgb(r, g, b) {
    if (isUpdating) return;
    isUpdating = true;

    r = Math.max(0, Math.min(255, parseInt(r) || 0));
    g = Math.max(0, Math.min(255, parseInt(g) || 0));
    b = Math.max(0, Math.min(255, parseInt(b) || 0));

    const hex = Utils.rgbToHex(r, g, b);
    const hsl = Utils.rgbToHsl(r, g, b);

    if (inputColor) inputColor.value = hex;
    if (hexInput) hexInput.value = hex.toUpperCase();
    if (rgbInput) rgbInput.value = `${r}, ${g}, ${b}`;
    if (hslInput) hslInput.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    if (previewSwatch) previewSwatch.style.backgroundColor = hex;

    isUpdating = false;
  }

  function updateFromHsl(h, s, l) {
    if (isUpdating) return;
    isUpdating = true;

    h = Math.max(0, Math.min(360, parseInt(h) || 0));
    s = Math.max(0, Math.min(100, parseInt(s) || 0));
    l = Math.max(0, Math.min(100, parseInt(l) || 0));

    const rgb = Utils.hslToRgb(h, s, l);
    const hex = Utils.rgbToHex(rgb.r, rgb.g, rgb.b);

    if (inputColor) inputColor.value = hex;
    if (hexInput) hexInput.value = hex.toUpperCase();
    if (rgbInput) rgbInput.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    if (hslInput) hslInput.value = `${h}, ${s}%, ${l}%`;
    if (previewSwatch) previewSwatch.style.backgroundColor = hex;

    isUpdating = false;
  }

  // ── Event listeners ──
  if (inputColor) {
    inputColor.addEventListener('input', (e) => {
      updateFromHex(e.target.value);
    });
  }

  if (hexInput) {
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      updateFromHex(val);
    });
  }

  if (rgbInput) {
    rgbInput.addEventListener('input', (e) => {
      const parts = e.target.value.split(/[,\s]+/).map(s => s.replace(/[^\d-]/g, '')).filter(Boolean);
      if (parts.length === 3) {
        updateFromRgb(parts[0], parts[1], parts[2]);
      }
    });
  }

  if (hslInput) {
    hslInput.addEventListener('input', (e) => {
      const parts = e.target.value.split(/[,\s]+/).map(s => s.replace(/[^\d-]/g, '')).filter(Boolean);
      if (parts.length === 3) {
        updateFromHsl(parts[0], parts[1], parts[2]);
      }
    });
  }

  // ── Copy buttons ──
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const el = document.getElementById(targetId);
      if (el) {
        const text = el.value || el.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            Utils.showToast(`Copied: ${text}`, 'success');
          });
        } else {
          Utils.showToast(`Value: ${text}`, 'info');
        }
      }
    });
  });

  // ── Initialize ──
  const initialHex = inputColor ? inputColor.value : '#4f46e5';
  updateFromHex(initialHex);
});
