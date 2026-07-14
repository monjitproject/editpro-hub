/**
 * Saturation Tool
 * Adjusts the color saturation of an image.
 * Controls: range#saturation (-100 to 100, default 0)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const saturationSlider = document.getElementById('saturation');
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

  // ── Process image with saturation adjustment ──
  function processImage() {
    if (!originalImg) return;
    const saturation = parseInt(saturationSlider.value, 10);

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (saturation !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      Utils.adjustSaturation(imageData, saturation);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (saturationSlider) {
    saturationSlider.addEventListener('input', debouncedProcess);
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
      if (saturationSlider) saturationSlider.value = 0;
      processImage();
      Utils.showToast('Saturation reset to default', 'info');
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
