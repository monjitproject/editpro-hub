/**
 * Duotone Tool
 * Maps image luminance to a two-color gradient.
 * Controls:
 *   color#shadowColor   (default: #1a0533) - color for dark areas
 *   color#highlightColor (default: #ff6b35) - color for bright areas
 * Each pixel's luminance determines where it falls on the shadow-to-highlight gradient.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const shadowInput = document.getElementById('shadowColor');
  const highlightInput = document.getElementById('highlightColor');
  let originalImg = null;
  let originalFilename = 'image';

  // ── Upload zone setup ──
  const zone = document.getElementById('upload-zone');
  const fileInput = zone ? zone.querySelector('input[type="file"]') : null;

  function handleFile(file) {
    if (!Utils.validateImageFile(file, 10)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.width;
        canvas.height = img.height;
        processImage();
        if (zone) zone.style.display = 'none';
        const workspace = document.getElementById('tool-workspace');
        if (workspace) workspace.style.display = 'block';
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
  }
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
  }

  /** Parse hex color to {r, g, b} */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /** Linearly interpolate between two values */
  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  // ── Process image with duotone mapping ──
  function processImage() {
    if (!originalImg) return;

    const shadow = hexToRgb(shadowInput.value);
    const highlight = hexToRgb(highlightInput.value);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Calculate luminance using perceptual weights
      const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;

      // Map to duotone gradient
      data[i]     = lerp(shadow.r, highlight.r, luminance);
      data[i + 1] = lerp(shadow.g, highlight.g, luminance);
      data[i + 2] = lerp(shadow.b, highlight.b, luminance);
      // Alpha remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const debouncedProcess = Utils.debounce(processImage, 32);

  // ── Control event listeners ──
  if (shadowInput) {
    shadowInput.addEventListener('input', debouncedProcess);
  }
  if (highlightInput) {
    highlightInput.addEventListener('input', debouncedProcess);
  }

  // ── Download handler ──
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename, 'png');
    });
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (shadowInput) shadowInput.value = '#1a0533';
      if (highlightInput) highlightInput.value = '#ff6b35';
      processImage();
      Utils.showToast('Duotone reset to default', 'info');
    });
  }

  // ── Clipboard paste support ──
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        handleFile(blob);
        break;
      }
    }
  });
});
