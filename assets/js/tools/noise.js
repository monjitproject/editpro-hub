/**
 * Noise Reduction Tool
 * Smooths image noise using a box blur (mean filter).
 * Controls: range#noiseReduction (0 to 10, default 0, step 0.5)
 * Higher values apply stronger smoothing by using larger kernel sizes.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const noiseSlider = document.getElementById('noiseReduction');
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
   * Apply box blur (mean filter) for noise reduction.
   * @param {ImageData} imageData - image data to blur in-place
   * @param {number} radius - blur kernel radius (1-5 pixels)
   */
  function applyBoxBlur(imageData, radius) {
    const w = imageData.width;
    const h = imageData.height;
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;
    const kernelSize = radius * 2 + 1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rSum = 0, gSum = 0, bSum = 0;
        let count = 0;

        // Sum pixels in the kernel neighborhood
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(w - 1, Math.max(0, x + kx));
            const py = Math.min(h - 1, Math.max(0, y + ky));
            const idx = (py * w + px) * 4;

            rSum += src[idx];
            gSum += src[idx + 1];
            bSum += src[idx + 2];
            count++;
          }
        }

        // Set the averaged pixel
        const dstIdx = (y * w + x) * 4;
        dst[dstIdx]     = Math.round(rSum / count);
        dst[dstIdx + 1] = Math.round(gSum / count);
        dst[dstIdx + 2] = Math.round(bSum / count);
        // Alpha unchanged
      }
    }
  }

  // ── Process image with noise reduction ──
  function processImage() {
    if (!originalImg) return;
    const reduction = parseInt(noiseSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (reduction > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyBoxBlur(imageData, reduction);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 48);

  // ── Control event listeners ──
  if (noiseSlider) {
    noiseSlider.addEventListener('input', debouncedProcess);
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
      if (noiseSlider) noiseSlider.value = 0;
      processImage();
      Utils.showToast('Noise reduction reset to default', 'info');
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
