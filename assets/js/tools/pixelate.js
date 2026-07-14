/**
 * Pixelate Tool
 * Creates a pixelated effect by downscaling and upscaling with nearest-neighbor.
 * Controls: range#pixelSize (1 to 50, default 10)
 * Lower pixelSize = more detail, higher = more pixelated.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const pixelSlider = document.getElementById('pixelSize');
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
   * Apply pixelation by downscaling to a small canvas then upscaling.
   * Uses nearest-neighbor interpolation for a blocky pixel look.
   */
  function applyPixelation(sourceCanvas, pixelSize) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    // Calculate reduced dimensions
    const smallW = Math.max(1, Math.ceil(w / pixelSize));
    const smallH = Math.max(1, Math.ceil(h / pixelSize));

    // Create a small canvas and draw the image at reduced size
    const smallCanvas = Utils.createCanvas(smallW, smallH);
    const smallCtx = smallCanvas.getContext('2d');
    // Use default (bilinear) for downscale to average colors
    smallCtx.drawImage(sourceCanvas, 0, 0, smallW, smallH);

    // Now upscale with nearest-neighbor using manual pixel copy
    const smallData = smallCtx.getImageData(0, 0, smallW, smallH);
    const outputCtx = sourceCanvas.getContext('2d');
    const outputData = outputCtx.createImageData(w, h);

    for (let sy = 0; sy < smallH; sy++) {
      for (let sx = 0; sx < smallW; sx++) {
        const srcIdx = (sy * smallW + sx) * 4;
        const r = smallData.data[srcIdx];
        const g = smallData.data[srcIdx + 1];
        const b = smallData.data[srcIdx + 2];
        const a = smallData.data[srcIdx + 3];

        // Fill the block of pixels
        const startX = sx * pixelSize;
        const startY = sy * pixelSize;
        const endX = Math.min(startX + pixelSize, w);
        const endY = Math.min(startY + pixelSize, h);

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * w + x) * 4;
            outputData.data[idx]     = r;
            outputData.data[idx + 1] = g;
            outputData.data[idx + 2] = b;
            outputData.data[idx + 3] = a;
          }
        }
      }
    }

    outputCtx.putImageData(outputData, 0, 0);
  }

  // ── Process image with pixelation ──
  function processImage() {
    if (!originalImg) return;
    const pixelSize = parseInt(pixelSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (pixelSize > 1) {
      applyPixelation(canvas, pixelSize);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 32);

  // ── Control event listeners ──
  if (pixelSlider) {
    pixelSlider.addEventListener('input', debouncedProcess);
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
      if (pixelSlider) pixelSlider.value = 10;
      processImage();
      Utils.showToast('Pixelation reset to default', 'info');
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
