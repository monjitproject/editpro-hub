/**
 * Auto Trim — Automatically crop whitespace/transparent borders
 * Controls: range#trimThreshold (0-50, default 10), select#trimMode (0=White, 1=Transparent, 2=Custom)
 * Scans pixel data to find content bounds, then crops.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const thresholdSlider = document.getElementById('trimThreshold');
  const thresholdValue = document.getElementById('trimThreshold-value');
  const modeSelect = document.getElementById('trimMode');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Upload ── */
  function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
        trimImage();
        zone.style.display = 'none';
        document.getElementById('tool-workspace').classList.add('active');
        Utils.showToast('Image loaded!', 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  /* ── Pixel matching helpers ── */
  function isTargetPixel(r, g, b, a, mode, threshold) {
    const t = threshold * 2.55; // percentage to 0-255 range
    switch (mode) {
      case 0: // White: pixel close to (255,255,255)
        return r >= (255 - t) && g >= (255 - t) && b >= (255 - t);
      case 1: // Transparent: alpha near 0
        return a <= threshold * 2.55;
      case 2: // Custom colour (use white as default — user can adapt)
        return r >= (255 - t) && g >= (255 - t) && b >= (255 - t);
      default:
        return r >= (255 - t) && g >= (255 - t) && b >= (255 - t);
    }
  }

  /* ── Scan image data and find content bounding box ── */
  function findContentBounds(imageData, mode, threshold) {
    const { width, height, data } = imageData;
    let top = height, bottom = 0, left = width, right = 0;
    let found = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (!isTargetPixel(r, g, b, a, mode, threshold)) {
          found = true;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    if (!found) return null;
    return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
  }

  /* ── Trim and redraw ── */
  function trimImage() {
    if (!originalImg) return;
    /* Draw original */
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    const mode = parseInt(modeSelect?.value, 10) || 0;
    const threshold = parseInt(thresholdSlider?.value, 10) || 10;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const bounds = findContentBounds(imageData, mode, threshold);

    if (!bounds || bounds.w <= 0 || bounds.h <= 0) {
      Utils.showToast('No content found to trim', 'warning');
      return;
    }

    /* Crop to content bounds */
    const cropped = Utils.cropCanvas(canvas, bounds.x, bounds.y, bounds.w, bounds.h);
    canvas.width = cropped.width;
    canvas.height = cropped.height;
    ctx.drawImage(cropped, 0, 0);
  }

  /* ── Threshold label ── */
  if (thresholdSlider) {
    thresholdSlider.addEventListener('input', () => {
      if (thresholdValue) thresholdValue.textContent = thresholdSlider.value + '%';
    });
  }

  /* ── Re-trim on control change ── */
  const debouncedTrim = Utils.debounce(() => {
    if (!originalImg) return;
    /* Reset to original first, then trim */
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    trimImage();
  }, 300);

  thresholdSlider?.addEventListener('input', debouncedTrim);
  modeSelect?.addEventListener('change', debouncedTrim);

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    Utils.downloadCanvas(canvas, originalFilename + '_trimmed', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (thresholdSlider) thresholdSlider.value = 10;
    if (thresholdValue) thresholdValue.textContent = '10%';
    if (modeSelect) modeSelect.value = '0';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
  });

  /* ── Clipboard paste ── */
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile());
        break;
      }
    }
  });
});
