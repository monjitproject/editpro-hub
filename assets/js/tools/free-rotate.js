/**
 * Free Rotate Tool
 * Rotate image by any arbitrary angle with background fill.
 * Controls: range#freeRotation (-180 to 180, default 0), color#rotationBg (default #ffffff)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const freeRotationSlider = document.getElementById('freeRotation');
  const rotationValue = document.getElementById('rotationValue');
  const bgColorPicker = document.getElementById('rotationBg');
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
    const angle = parseFloat(freeRotationSlider.value);
    const bgColor = bgColorPicker ? bgColorPicker.value : '#ffffff';

    // Update displayed value
    if (rotationValue) rotationValue.textContent = angle + '°';

    if (angle === 0) {
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
      ctx.drawImage(originalImg, 0, 0);
      return;
    }

    const rad = angle * Math.PI / 180;
    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;

    // Calculate the bounding box of the rotated image
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const newW = Math.round(origW * cos + origH * sin);
    const newH = Math.round(origW * sin + origH * cos);

    // Create output canvas with background color
    canvas.width = newW;
    canvas.height = newH;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, newW, newH);

    // Draw rotated image centered
    ctx.save();
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.drawImage(originalImg, -origW / 2, -origH / 2);
    ctx.restore();
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // Event listeners for controls
  if (freeRotationSlider) {
    freeRotationSlider.addEventListener('input', debouncedProcess);
  }
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', debouncedProcess);
  }

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_free_rotate', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (freeRotationSlider) freeRotationSlider.value = '0';
      if (rotationValue) rotationValue.textContent = '0°';
      if (bgColorPicker) bgColorPicker.value = '#ffffff';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Rotation reset', 'info');
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
