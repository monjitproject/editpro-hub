/**
 * Warmth Tool
 * Adjusts color temperature by shifting the red/blue balance.
 * Controls: range#warmth (-100 to 100, default 0)
 * Positive values = warmer (more red/yellow), negative = cooler (more blue).
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const warmthSlider = document.getElementById('warmth');
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
   * Apply warmth adjustment by shifting color temperature.
   * Warmer: boost red, reduce blue
   * Cooler: boost blue, reduce red
   */
  function applyWarmth(data, warmth) {
    // Scale factor: max adjustment per channel
    const maxShift = 40;

    for (let i = 0; i < data.length; i += 4) {
      if (warmth > 0) {
        // Warmer: add red/orange, subtract blue
        const factor = (warmth / 100) * maxShift;
        data[i]     = Math.min(255, data[i] + factor);          // Red up
        data[i + 1] = Math.min(255, data[i + 1] + factor * 0.3); // Slight green
        data[i + 2] = Math.max(0, data[i + 2] - factor * 0.6);   // Blue down
      } else {
        // Cooler: add blue, reduce red
        const factor = (-warmth / 100) * maxShift;
        data[i]     = Math.max(0, data[i] - factor * 0.6);       // Red down
        data[i + 1] = Math.max(0, data[i + 1] - factor * 0.2);  // Slight green down
        data[i + 2] = Math.min(255, data[i + 2] + factor);       // Blue up
      }
    }
  }

  // ── Process image with warmth adjustment ──
  function processImage() {
    if (!originalImg) return;
    const warmth = parseInt(warmthSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (warmth !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyWarmth(imageData.data, warmth);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (warmthSlider) {
    warmthSlider.addEventListener('input', debouncedProcess);
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
      if (warmthSlider) warmthSlider.value = 0;
      processImage();
      Utils.showToast('Warmth reset to default', 'info');
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
