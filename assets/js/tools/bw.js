/**
 * Black & White Tool
 * Converts image to grayscale with user-controlled RGB channel weights.
 * Controls:
 *   range#redWeight   (0 to 100, default 30)
 *   range#greenWeight (0 to 100, default 59)
 *   range#blueWeight  (0 to 100, default 11)
 * The weights are normalized to sum to 100 for proper conversion.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const redWeightSlider = document.getElementById('redWeight');
  const greenWeightSlider = document.getElementById('greenWeight');
  const blueWeightSlider = document.getElementById('blueWeight');
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

  // ── Process image with weighted B&W conversion ──
  function processImage() {
    if (!originalImg) return;

    const redW = parseInt(redWeightSlider.value, 10);
    const greenW = parseInt(greenWeightSlider.value, 10);
    const blueW = parseInt(blueWeightSlider.value, 10);

    // Normalize weights so they sum to 1
    const totalWeight = redW + greenW + blueW;
    const rNorm = totalWeight > 0 ? redW / totalWeight : 0.299;
    const gNorm = totalWeight > 0 ? greenW / totalWeight : 0.587;
    const bNorm = totalWeight > 0 ? blueW / totalWeight : 0.114;

    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Weighted grayscale luminance
      const gray = Math.round(
        data[i] * rNorm +
        data[i + 1] * gNorm +
        data[i + 2] * bNorm
      );
      data[i]     = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const debouncedProcess = Utils.debounce(processImage, 16);

  // ── Control event listeners ──
  if (redWeightSlider) redWeightSlider.addEventListener('input', debouncedProcess);
  if (greenWeightSlider) greenWeightSlider.addEventListener('input', debouncedProcess);
  if (blueWeightSlider) blueWeightSlider.addEventListener('input', debouncedProcess);

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
      if (redWeightSlider) redWeightSlider.value = 30;
      if (greenWeightSlider) greenWeightSlider.value = 59;
      if (blueWeightSlider) blueWeightSlider.value = 11;
      processImage();
      Utils.showToast('Black & White weights reset to default', 'info');
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
