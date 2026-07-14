/**
 * Posterize Tool
 * Reduces the number of color levels or applies threshold for B&W conversion.
 * Controls:
 *   range#posterLevels (2 to 32, default 8) - number of color levels per channel
 *   toggle#thresholdMode - when enabled, converts to pure black & white
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const levelsSlider = document.getElementById('posterLevels');
  const thresholdToggle = document.getElementById('thresholdMode');
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
   * Apply posterization by reducing the number of color levels per channel.
   * Maps each channel value to one of N discrete levels.
   * @param {Uint8ClampedArray} data - pixel data to modify in-place
   * @param {number} levels - number of levels per channel (2-32)
   */
  function applyPosterize(data, levels) {
    // Calculate the step size: how many original values map to one output level
    const step = 255 / (levels - 1);
    // Build a lookup table for fast mapping
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round(Math.round(i / step) * step);
    }

    for (let i = 0; i < data.length; i += 4) {
      data[i]     = lut[data[i]];     // Red
      data[i + 1] = lut[data[i + 1]]; // Green
      data[i + 2] = lut[data[i + 2]]; // Blue
    }
  }

  /**
   * Apply threshold to convert image to pure black and white.
   * @param {Uint8ClampedArray} data - pixel data to modify in-place
   * @param {number} threshold - threshold value (0-255)
   */
  function applyThreshold(data, threshold) {
    for (let i = 0; i < data.length; i += 4) {
      // Calculate luminance
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const val = gray >= threshold ? 255 : 0;
      data[i]     = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  // ── Process image with posterize/threshold ──
  function processImage() {
    if (!originalImg) return;
    const levels = parseInt(levelsSlider.value, 10);
    const thresholdMode = thresholdToggle ? thresholdToggle.checked : false;

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (thresholdMode) {
      // In threshold mode, use the levels slider as threshold level
      // Map 2-32 to a 127-128 range for meaningful threshold
      const threshold = 128; // Middle threshold
      applyThreshold(imageData.data, threshold);
    } else {
      // Standard posterization
      applyPosterize(imageData.data, levels);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const debouncedProcess = Utils.debounce(processImage, 32);

  // ── Control event listeners ──
  if (levelsSlider) {
    levelsSlider.addEventListener('input', debouncedProcess);
  }
  if (thresholdToggle) {
    thresholdToggle.addEventListener('change', processImage);
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
      if (levelsSlider) levelsSlider.value = 8;
      if (thresholdToggle) thresholdToggle.checked = false;
      processImage();
      Utils.showToast('Posterize reset to default', 'info');
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
