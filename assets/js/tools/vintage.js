/**
 * Vintage Tool
 * Applies vintage/retro color grading with multiple presets.
 * Controls:
 *   select#vintagePreset (0-3, four preset styles)
 *   range#vintageIntensity (0 to 100, default 70) - blend strength
 *
 * Presets:
 *   0 - Classic: warm tones, slight fade, lifted blacks
 *   1 - Faded: desaturated, lifted blacks, slight green tint
 *   2 - Cross Process: shifted colors, high contrast
 *   3 - Kodachrome: rich warm tones, deep shadows, boosted reds
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const presetSelect = document.getElementById('vintagePreset');
  const intensitySlider = document.getElementById('vintageIntensity');
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

  /**
   * Apply a vintage color grading preset to pixel data.
   * @param {Uint8ClampedArray} data - pixel data to modify in-place
   * @param {number} preset - preset index (0-3)
   */
  function applyPreset(data, preset) {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      switch (preset) {
        case 0: // Classic warm vintage
          // Warm shift + lifted blacks + slight fade
          r = Math.min(255, r * 1.1 + 15);
          g = Math.min(255, g * 1.0 + 10);
          b = Math.max(0, b * 0.85 + 10);
          // Lift blacks (raise minimum values)
          r = Math.max(30, r);
          g = Math.max(25, g);
          b = Math.max(20, b);
          break;

        case 1: // Faded / desaturated
          // Reduce saturation manually + lift blacks + green tint
          const lum1 = r * 0.299 + g * 0.587 + b * 0.114;
          r = Math.round(r * 0.6 + lum1 * 0.4 + 10);
          g = Math.round(g * 0.65 + lum1 * 0.35 + 12);
          b = Math.round(b * 0.55 + lum1 * 0.45 + 8);
          r = Math.max(35, Math.min(240, r));
          g = Math.max(40, Math.min(240, g));
          b = Math.max(30, Math.min(235, b));
          break;

        case 2: // Cross process
          // Shift channels: boost green in highlights, magenta in shadows
          r = Math.min(255, r * 1.2 + 20);
          g = Math.min(255, g * 1.05 + 30);
          b = Math.max(0, b * 0.7 + 40);
          // Increase contrast slightly
          r = Math.min(255, Math.max(0, (r - 128) * 1.2 + 128));
          g = Math.min(255, Math.max(0, (g - 128) * 1.1 + 128));
          b = Math.min(255, Math.max(0, (b - 128) * 1.15 + 128));
          break;

        case 3: // Kodachrome rich tones
          r = Math.min(255, r * 1.15 + 10);
          g = Math.max(0, g * 0.95);
          b = Math.max(0, b * 0.8);
          // Boost contrast
          r = Math.min(255, Math.max(0, (r - 128) * 1.25 + 128));
          g = Math.min(255, Math.max(0, (g - 128) * 1.1 + 128));
          b = Math.min(255, Math.max(0, (b - 128) * 1.05 + 128));
          break;
      }

      data[i]     = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }
  }

  // ── Process image with vintage effect ──
  function processImage() {
    if (!originalImg) return;
    const preset = parseInt(presetSelect.value, 10);
    const intensity = parseInt(intensitySlider.value, 10) / 100;

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (intensity > 0) {
      // Get original for blending
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Clone for vintage processing
      const vintageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
      );

      // Apply the selected preset
      applyPreset(vintageData.data, preset);

      // Blend based on intensity
      const output = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < output.data.length; i += 4) {
        output.data[i]     = Math.round(originalData.data[i]     * (1 - intensity) + vintageData.data[i]     * intensity);
        output.data[i + 1] = Math.round(originalData.data[i + 1] * (1 - intensity) + vintageData.data[i + 1] * intensity);
        output.data[i + 2] = Math.round(originalData.data[i + 2] * (1 - intensity) + vintageData.data[i + 2] * intensity);
      }
      ctx.putImageData(output, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 32);

  // ── Control event listeners ──
  if (presetSelect) {
    presetSelect.addEventListener('change', processImage);
  }
  if (intensitySlider) {
    intensitySlider.addEventListener('input', debouncedProcess);
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
      if (presetSelect) presetSelect.value = '0';
      if (intensitySlider) intensitySlider.value = 70;
      processImage();
      Utils.showToast('Vintage reset to default', 'info');
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
