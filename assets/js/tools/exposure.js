/**
 * Exposure Tool
 * Adjusts the exposure with a more natural tone curve than simple brightness.
 * Controls: range#exposure (-100 to 100, default 0)
 * Uses a power curve to simulate photographic exposure stops.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const exposureSlider = document.getElementById('exposure');
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
   * Apply exposure adjustment using a power curve.
   * This simulates photographic exposure: each stop doubles/halves the light.
   * The slider maps -100..100 to exposure stops of roughly -2..+2.
   */
  function applyExposure(data, value) {
    // Map -100..100 to an exposure factor
    // value > 0: multiply by 2^(value/50) for brightening
    // value < 0: multiply by 2^(value/50) for darkening
    const stops = value / 50; // Maps 100 to 2 stops
    const factor = Math.pow(2, stops);

    for (let i = 0; i < data.length; i += 4) {
      // Apply to each channel with natural rolloff
      data[i]     = Math.min(255, Math.max(0, data[i]     * factor));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
    }
  }

  // ── Process image with exposure adjustment ──
  function processImage() {
    if (!originalImg) return;
    const exposure = parseInt(exposureSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (exposure !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyExposure(imageData.data, exposure);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (exposureSlider) {
    exposureSlider.addEventListener('input', debouncedProcess);
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
      if (exposureSlider) exposureSlider.value = 0;
      processImage();
      Utils.showToast('Exposure reset to default', 'info');
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
