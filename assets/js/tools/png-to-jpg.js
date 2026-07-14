/**
 * PNG to JPG Converter
 * Converts PNG images to JPG with quality and background color controls.
 * Controls: range#jpgQuality (10-100, default:90), color#jpgBgColor (default:#ffffff)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const qualitySlider = document.getElementById('jpgQuality');
  const qualityValue = document.getElementById('qualityValue');
  const bgColor = document.getElementById('jpgBgColor');
  const sizeEstimate = document.getElementById('sizeEstimate');
  let originalImg = null;
  let originalFilename = 'image';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
      });
    }
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  async function processImage() {
    if (!originalImg) return;
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.9;
    const background = bgColor ? bgColor.value : '#ffffff';

    if (qualityValue) qualityValue.textContent = qualitySlider ? qualitySlider.value : 90;

    // Fill with background color first (handles transparency)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image on top
    ctx.drawImage(originalImg, 0, 0);

    // Estimate file size
    try {
      const blob = await Utils.canvasToBlob(canvas, 'image/jpeg', quality);
      if (sizeEstimate) sizeEstimate.textContent = Utils.formatFileSize(blob.size);
    } catch (err) {
      if (sizeEstimate) sizeEstimate.textContent = 'N/A';
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 100);

  if (qualitySlider) qualitySlider.addEventListener('input', debouncedProcess);
  if (bgColor) bgColor.addEventListener('input', debouncedProcess);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.9;
    Utils.downloadCanvas(canvas, originalFilename, 'jpg', quality);
    Utils.showToast('Downloaded as JPG', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    if (qualitySlider) qualitySlider.value = 90;
    if (qualityValue) qualityValue.textContent = '90';
    if (bgColor) bgColor.value = '#ffffff';
    if (sizeEstimate) sizeEstimate.textContent = '';
    canvas.width = 0;
    canvas.height = 0;
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });

  document.addEventListener('paste', e => {
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
