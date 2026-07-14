/**
 * Perspective / Skew Tool
 * Applies skew/perspective transform using canvas 2D transforms.
 * Controls: range#skewX (-45 to 45, default 0), range#skewY (-45 to 45, default 0)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const skewXSlider = document.getElementById('skewX');
  const skewYSlider = document.getElementById('skewY');
  const skewXValue = document.getElementById('skewXValue');
  const skewYValue = document.getElementById('skewYValue');
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

  function processImage() {
    if (!originalImg) return;
    const skewX = parseFloat(skewXSlider.value);
    const skewY = parseFloat(skewYSlider.value);

    // Update displayed values
    if (skewXValue) skewXValue.textContent = skewX + '°';
    if (skewYValue) skewYValue.textContent = skewY + '°';

    if (skewX === 0 && skewY === 0) {
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
      ctx.drawImage(originalImg, 0, 0);
      return;
    }

    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;

    // Calculate expanded canvas size to accommodate the skew
    const radX = skewX * Math.PI / 180;
    const radY = skewY * Math.PI / 180;
    const extraW = Math.round(Math.abs(Math.tan(radX)) * origH);
    const extraH = Math.round(Math.abs(Math.tan(radY)) * origW);
    const newW = origW + extraW;
    const newH = origH + extraH;

    canvas.width = newW;
    canvas.height = newH;
    ctx.clearRect(0, 0, newW, newH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newW, newH);

    // Apply skew transform
    ctx.save();
    ctx.translate(extraW / 2, extraH / 2);

    // Use setTransform for a proper skew (shear) effect
    // skewX: shifts top edge right, bottom edge left
    // skewY: shifts left edge down, right edge up
    const tanX = Math.tan(radX);
    const tanY = Math.tan(radY);
    ctx.setTransform(
      1, tanY,    // a, c (horizontal skew)
      tanX, 1,    // b, d (vertical skew)
      extraW / 2, extraH / 2  // e, f (translation)
    );

    ctx.drawImage(originalImg, 0, 0, origW, origH);
    ctx.restore();
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // Event listeners for controls
  if (skewXSlider) skewXSlider.addEventListener('input', debouncedProcess);
  if (skewYSlider) skewYSlider.addEventListener('input', debouncedProcess);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_perspective', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (skewXSlider) skewXSlider.value = '0';
      if (skewYSlider) skewYSlider.value = '0';
      if (skewXValue) skewXValue.textContent = '0°';
      if (skewYValue) skewYValue.textContent = '0°';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Perspective reset', 'info');
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
