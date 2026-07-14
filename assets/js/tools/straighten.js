/**
 * Straighten Tool
 * Image straightener: rotates by small angle, optionally auto-crops empty corners.
 * Controls: range#straightenAngle (-45 to 45, default 0, step 0.1),
 *           toggle#autoCrop
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const straightenSlider = document.getElementById('straightenAngle');
  const straightenValue = document.getElementById('straightenValue');
  const autoCropToggle = document.getElementById('autoCrop');
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
    const angle = parseFloat(straightenSlider.value);
    const autoCrop = autoCropToggle ? autoCropToggle.checked : false;

    // Update displayed value
    if (straightenValue) straightenValue.textContent = angle.toFixed(1) + '°';

    // Start with original
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    if (angle === 0) return;

    // Rotate to straighten
    const rotated = Utils.rotateCanvas(canvas, angle);
    canvas.width = rotated.width;
    canvas.height = rotated.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rotated, 0, 0);

    // Auto-crop: trim transparent/empty corners caused by rotation
    if (autoCrop) {
      const cropped = autoCropCorners(canvas, angle);
      if (cropped) {
        canvas.width = cropped.width;
        canvas.height = cropped.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(cropped, 0, 0);
      }
    }
  }

  /**
   * Auto-crop by finding the largest inscribed rectangle after rotation.
   * This removes the transparent corner triangles created by rotating.
   */
  function autoCropCorners(sourceCanvas, angle) {
    const rad = Math.abs(angle) * Math.PI / 180;
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    // For small angles, calculate the crop rectangle that avoids transparent corners
    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;

    // Calculate inscribed rectangle dimensions
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    // The inscribed rectangle within the rotated image that corresponds to the original
    const inscribedW = Math.round(Math.min(
      (w - h * sin / cos) * cos,
      origW
    ));
    const inscribedH = Math.round(Math.min(
      (h - w * sin / cos) * cos,
      origH
    ));

    if (inscribedW <= 0 || inscribedH <= 0) return null;

    const cropX = Math.round((w - inscribedW) / 2);
    const cropY = Math.round((h - inscribedH) / 2);

    if (inscribedW <= 0 || inscribedH <= 0 || cropX < 0 || cropY < 0) return null;

    return Utils.cropCanvas(sourceCanvas, cropX, cropY, inscribedW, inscribedH);
  }

  const debouncedProcess = Utils.debounce(processImage, 30);

  // Event listeners for controls
  if (straightenSlider) straightenSlider.addEventListener('input', debouncedProcess);
  if (autoCropToggle) autoCropToggle.addEventListener('change', processImage);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_straightened', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (straightenSlider) straightenSlider.value = '0';
      if (straightenValue) straightenValue.textContent = '0.0°';
      if (autoCropToggle) autoCropToggle.checked = false;
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Straighten reset', 'info');
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
