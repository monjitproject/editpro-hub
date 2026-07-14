/**
 * Sepia Tool
 * Applies a sepia tone effect with adjustable intensity.
 * Controls: range#sepiaIntensity (0 to 100, default 100)
 * Blends between original and fully sepia-toned image.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const sepiaSlider = document.getElementById('sepiaIntensity');
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

  // ── Process image with sepia effect ──
  function processImage() {
    if (!originalImg) return;
    const intensity = parseInt(sepiaSlider.value, 10) / 100;

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    if (intensity < 1) {
      // Store the original pixel data for blending
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sepiaData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
      );

      // Apply sepia to the copy
      Utils.toSepia(sepiaData);

      // Blend original and sepia based on intensity
      const output = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < output.data.length; i += 4) {
        output.data[i]     = Math.round(originalData.data[i]     * (1 - intensity) + sepiaData.data[i]     * intensity);
        output.data[i + 1] = Math.round(originalData.data[i + 1] * (1 - intensity) + sepiaData.data[i + 1] * intensity);
        output.data[i + 2] = Math.round(originalData.data[i + 2] * (1 - intensity) + sepiaData.data[i + 2] * intensity);
      }
      ctx.putImageData(output, 0, 0);
    } else {
      // Full sepia
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      Utils.toSepia(imageData);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (sepiaSlider) {
    sepiaSlider.addEventListener('input', debouncedProcess);
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
      if (sepiaSlider) sepiaSlider.value = 100;
      processImage();
      Utils.showToast('Sepia reset to default', 'info');
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
