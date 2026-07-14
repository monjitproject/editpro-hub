/**
 * Format Converter Tool
 * Converts images between PNG, JPEG, and WEBP formats.
 * Controls: select#outputFormat, range#conversionQuality (10-100, default:90)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const outputFormat = document.getElementById('outputFormat');
  const qualitySlider = document.getElementById('conversionQuality');
  const qualityValue = document.getElementById('qualityValue');
  const sizeEstimate = document.getElementById('sizeEstimate');
  let originalImg = null;
  let originalFilename = 'image';
  let originalSize = 0;

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
    originalSize = file.size;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  function getMimeType(format) {
    const map = { PNG: 'image/png', JPEG: 'image/jpeg', WEBP: 'image/webp' };
    return map[format] || 'image/png';
  }

  function getExt(format) {
    return format.toLowerCase();
  }

  async function processImage() {
    if (!originalImg) return;
    const format = outputFormat ? outputFormat.value : 'PNG';
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.9;
    const mime = getMimeType(format);

    if (qualityValue) qualityValue.textContent = qualitySlider ? qualitySlider.value : 90;

    // Re-draw the original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    // Estimate file size
    try {
      const blob = await Utils.canvasToBlob(canvas, mime, quality);
      if (sizeEstimate) {
        sizeEstimate.textContent = Utils.formatFileSize(blob.size);
      }
    } catch (err) {
      if (sizeEstimate) sizeEstimate.textContent = 'N/A';
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 100);

  if (outputFormat) outputFormat.addEventListener('change', processImage);
  if (qualitySlider) qualitySlider.addEventListener('input', debouncedProcess);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    const format = outputFormat ? outputFormat.value : 'PNG';
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.9;
    Utils.downloadCanvas(canvas, originalFilename, getExt(format), quality);
    Utils.showToast(`Downloaded as ${format}`, 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    originalSize = 0;
    if (outputFormat) outputFormat.value = 'PNG';
    if (qualitySlider) qualitySlider.value = 90;
    if (qualityValue) qualityValue.textContent = '90';
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
