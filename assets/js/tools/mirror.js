/**
 * Mirror Tool
 * Creates a mirrored reflection of the image with configurable type, opacity, and gap.
 * Controls: select#mirrorType (Horizontal/Vertical),
 *           range#mirrorOpacity (10-100, default 50),
 *           range#mirrorGap (0-50, default 4)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const mirrorTypeSelect = document.getElementById('mirrorType');
  const mirrorOpacitySlider = document.getElementById('mirrorOpacity');
  const mirrorGapSlider = document.getElementById('mirrorGap');
  const opacityValue = document.getElementById('opacityValue');
  const gapValue = document.getElementById('gapValue');
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

    const mirrorType = mirrorTypeSelect ? mirrorTypeSelect.value : 'horizontal';
    const opacity = parseInt(mirrorOpacitySlider.value, 10) / 100;
    const gap = parseInt(mirrorGapSlider.value, 10);

    // Update displayed values
    if (opacityValue) opacityValue.textContent = Math.round(opacity * 100) + '%';
    if (gapValue) gapValue.textContent = gap + 'px';

    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;

    if (mirrorType === 'horizontal') {
      // Mirror left-to-right: double width
      const newW = origW * 2 + gap;
      canvas.width = newW;
      canvas.height = origH;

      // Draw original on the left
      ctx.globalAlpha = 1;
      ctx.drawImage(originalImg, 0, 0);

      // Draw mirrored copy on the right with opacity
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(origW * 2 + gap, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(originalImg, 0, 0, origW, origH);
      ctx.restore();
      ctx.globalAlpha = 1;

    } else {
      // Mirror top-to-bottom: double height
      const newH = origH * 2 + gap;
      canvas.width = origW;
      canvas.height = newH;

      // Draw original on top
      ctx.globalAlpha = 1;
      ctx.drawImage(originalImg, 0, 0);

      // Draw mirrored copy on bottom with opacity
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(0, origH * 2 + gap);
      ctx.scale(1, -1);
      ctx.drawImage(originalImg, 0, 0, origW, origH);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 30);

  // Event listeners for controls
  if (mirrorTypeSelect) mirrorTypeSelect.addEventListener('change', processImage);
  if (mirrorOpacitySlider) mirrorOpacitySlider.addEventListener('input', debouncedProcess);
  if (mirrorGapSlider) mirrorGapSlider.addEventListener('input', debouncedProcess);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_mirror', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (mirrorTypeSelect) mirrorTypeSelect.value = 'horizontal';
      if (mirrorOpacitySlider) mirrorOpacitySlider.value = '50';
      if (mirrorGapSlider) mirrorGapSlider.value = '4';
      if (opacityValue) opacityValue.textContent = '50%';
      if (gapValue) gapValue.textContent = '4px';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Mirror reset', 'info');
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
