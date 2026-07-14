/**
 * Color Balance Tool
 * Independently adjusts the red, green, and blue channels of the image.
 * Controls:
 *   range#redChannel   (-100 to 100, default 0)
 *   range#greenChannel (-100 to 100, default 0)
 *   range#blueChannel  (-100 to 100, default 0)
 * Positive values boost the channel, negative values reduce it.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const redSlider = document.getElementById('redChannel');
  const greenSlider = document.getElementById('greenChannel');
  const blueSlider = document.getElementById('blueChannel');
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

  // ── Process image with color balance adjustments ──
  function processImage() {
    if (!originalImg) return;

    const redAdj = parseInt(redSlider.value, 10);
    const greenAdj = parseInt(greenSlider.value, 10);
    const blueAdj = parseInt(blueSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    // Skip processing if all adjustments are zero
    if (redAdj === 0 && greenAdj === 0 && blueAdj === 0) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert slider values (-100 to 100) to a multiplier offset
    // Each unit adds/subtracts up to 2.55 per channel level
    const rFactor = redAdj * 2.55;
    const gFactor = greenAdj * 2.55;
    const bFactor = blueAdj * 2.55;

    for (let i = 0; i < data.length; i += 4) {
      data[i]     = Math.min(255, Math.max(0, data[i]     + rFactor)); // Red
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + gFactor)); // Green
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bFactor)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (redSlider) redSlider.addEventListener('input', debouncedProcess);
  if (greenSlider) greenSlider.addEventListener('input', debouncedProcess);
  if (blueSlider) blueSlider.addEventListener('input', debouncedProcess);

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
      if (redSlider) redSlider.value = 0;
      if (greenSlider) greenSlider.value = 0;
      if (blueSlider) blueSlider.value = 0;
      processImage();
      Utils.showToast('Color balance reset to default', 'info');
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
