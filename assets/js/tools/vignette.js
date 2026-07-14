/**
 * Vignette Tool
 * Adds a dark-to-transparent radial gradient overlay from the edges inward.
 * Controls:
 *   range#vignetteStrength (0 to 100, default 50) - opacity of the vignette
 *   range#vignetteRadius  (10 to 100, default 60) - size of the clear center area
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const strengthSlider = document.getElementById('vignetteStrength');
  const radiusSlider = document.getElementById('vignetteRadius');
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
   * Draw a radial vignette overlay on the canvas.
   * @param {CanvasRenderingContext2D} ctx - canvas context
   * @param {number} w - canvas width
   * @param {number} h - canvas height
   * @param {number} strength - vignette opacity (0-1)
   * @param {number} radiusPercent - size of clear area as percentage (10-100)
   */
  function drawVignette(ctx, w, h, strength, radiusPercent) {
    if (strength === 0) return;

    const centerX = w / 2;
    const centerY = h / 2;

    // Calculate the radius for the gradient based on image diagonal and radius percentage
    const diagonal = Math.sqrt(centerX * centerX + centerY * centerY);
    const innerRadius = (radiusPercent / 100) * diagonal * 0.5;
    const outerRadius = diagonal;

    // Create a radial gradient from transparent center to dark edge
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${strength * 0.3})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${strength * 0.8})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Process image with vignette ──
  function processImage() {
    if (!originalImg) return;
    const strength = parseInt(strengthSlider.value, 10) / 100;
    const radius = parseInt(radiusSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (strength > 0) {
      drawVignette(ctx, canvas.width, canvas.height, strength, radius);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (strengthSlider) {
    strengthSlider.addEventListener('input', debouncedProcess);
  }
  if (radiusSlider) {
    radiusSlider.addEventListener('input', debouncedProcess);
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
      if (strengthSlider) strengthSlider.value = 50;
      if (radiusSlider) radiusSlider.value = 60;
      processImage();
      Utils.showToast('Vignette reset to default', 'info');
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
