/**
 * Canvas Padding Tool
 * Adds padding around the image with configurable per-side values and color.
 * Controls: number#padTop (default 20), number#padRight (default 20),
 *           number#padBottom (default 20), number#padLeft (default 20),
 *           color#padColor (default #ffffff)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const padTop = document.getElementById('padTop');
  const padRight = document.getElementById('padRight');
  const padBottom = document.getElementById('padBottom');
  const padLeft = document.getElementById('padLeft');
  const padColor = document.getElementById('padColor');
  let originalImg = null;
  let originalFilename = 'image';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  function getPaddingValues() {
    return {
      top: parseInt(padTop.value, 10) || 0,
      right: parseInt(padRight.value, 10) || 0,
      bottom: parseInt(padBottom.value, 10) || 0,
      left: parseInt(padLeft.value, 10) || 0
    };
  }

  function processImage() {
    if (!originalImg) return;
    const p = getPaddingValues();
    const color = padColor ? padColor.value : '#ffffff';

    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;
    const newW = origW + p.left + p.right;
    const newH = origH + p.top + p.bottom;

    if (newW <= 0 || newH <= 0) return;

    canvas.width = newW;
    canvas.height = newH;

    // Fill with padding color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, newW, newH);

    // Draw original image at the offset position
    ctx.drawImage(originalImg, p.left, p.top);
  }

  const debouncedProcess = Utils.debounce(processImage, 50);

  // Event listeners for all controls
  [padTop, padRight, padBottom, padLeft].forEach(el => {
    if (el) el.addEventListener('input', debouncedProcess);
  });
  if (padColor) padColor.addEventListener('input', debouncedProcess);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_padded', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (padTop) padTop.value = '20';
      if (padRight) padRight.value = '20';
      if (padBottom) padBottom.value = '20';
      if (padLeft) padLeft.value = '20';
      if (padColor) padColor.value = '#ffffff';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Padding reset', 'info');
    });
  }

  // Clipboard paste support
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile());
        break;
      }
    }
  });
});
