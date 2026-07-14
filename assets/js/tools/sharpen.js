/**
 * Sharpen Tool
 * Applies sharpening via unsharp mask convolution.
 * Controls: range#sharpenAmount (0 to 10, default 0, step 0.5)
 * Technique: subtract a blurred version from the original to enhance edges.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const sharpenSlider = document.getElementById('sharpenAmount');
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
   * Apply unsharp mask: sharpen = original + amount * (original - blurred)
   * This enhances edges by boosting the difference between original and blurred.
   */
  function applySharpen(canvasEl, amount) {
    const w = canvasEl.width;
    const h = canvasEl.height;
    const ctxLocal = canvasEl.getContext('2d');

    // Get the original pixel data
    const originalData = ctxLocal.getImageData(0, 0, w, h);

    // Create a temporary canvas for blur
    const tempCanvas = Utils.createCanvas(w, h);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(originalData, 0, 0);

    // Apply a small blur to the temp canvas (radius proportional to sharpen amount)
    const blurRadius = Math.min(amount * 0.5, 3);
    if (blurRadius > 0) {
      Utils.applyBlur(tempCanvas, blurRadius);
    }

    // Get blurred pixel data
    const blurredData = tempCtx.getImageData(0, 0, w, h);

    // Unsharp mask: original + amount * (original - blurred)
    const output = ctxLocal.getImageData(0, 0, w, h);
    const amountScaled = amount * 2; // Scale for visible effect

    for (let i = 0; i < output.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const diff = output.data[i + c] - blurredData.data[i + c];
        output.data[i + c] = Math.min(255, Math.max(0,
          output.data[i + c] + diff * amountScaled
        ));
      }
    }

    ctxLocal.putImageData(output, 0, 0);
  }

  // ── Process image with sharpen ──
  function processImage() {
    if (!originalImg) return;
    const amount = parseFloat(sharpenSlider.value);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (amount > 0) {
      applySharpen(canvas, amount);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 48);

  // ── Control event listeners ──
  if (sharpenSlider) {
    sharpenSlider.addEventListener('input', debouncedProcess);
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
      if (sharpenSlider) sharpenSlider.value = 0;
      processImage();
      Utils.showToast('Sharpen reset to default', 'info');
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
