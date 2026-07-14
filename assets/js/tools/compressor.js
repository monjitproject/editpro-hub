/**
 * Image Compressor Tool
 * Compresses images with quality and format controls.
 * Controls: range#compressQuality (1-100, default:80), select#compressFormat (JPEG/WEBP/PNG)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const qualitySlider = document.getElementById('compressQuality');
  const qualityValue = document.getElementById('qualityValue');
  const compressFormat = document.getElementById('compressFormat');
  const sizeEstimate = document.getElementById('sizeEstimate');
  const compressionRatio = document.getElementById('compressionRatio');
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
    const map = { JPEG: 'image/jpeg', WEBP: 'image/webp', PNG: 'image/png' };
    return map[format] || 'image/jpeg';
  }

  function getExt(format) {
    return format.toLowerCase();
  }

  async function processImage() {
    if (!originalImg) return;
    const format = compressFormat ? compressFormat.value : 'JPEG';
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.8;
    const mime = getMimeType(format);

    if (qualityValue) qualityValue.textContent = qualitySlider ? qualitySlider.value : 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    try {
      const blob = await Utils.canvasToBlob(canvas, mime, quality);
      if (sizeEstimate) sizeEstimate.textContent = Utils.formatFileSize(blob.size);
      if (compressionRatio && originalSize > 0) {
        const ratio = ((1 - blob.size / originalSize) * 100).toFixed(1);
        compressionRatio.textContent = `${ratio}% smaller`;
        compressionRatio.style.color = blob.size < originalSize ? 'var(--success, #22c55e)' : 'var(--warning, #f59e0b)';
      }
    } catch (err) {
      if (sizeEstimate) sizeEstimate.textContent = 'N/A';
    }
  }

  const debouncedProcess = Utils.debounce(processImage, 100);

  if (qualitySlider) qualitySlider.addEventListener('input', debouncedProcess);
  if (compressFormat) compressFormat.addEventListener('change', processImage);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    const format = compressFormat ? compressFormat.value : 'JPEG';
    const quality = qualitySlider ? parseInt(qualitySlider.value, 10) / 100 : 0.8;
    Utils.downloadCanvas(canvas, originalFilename, getExt(format), quality);
    Utils.showToast('Compressed image downloaded', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    originalSize = 0;
    if (qualitySlider) qualitySlider.value = 80;
    if (qualityValue) qualityValue.textContent = '80';
    if (compressFormat) compressFormat.value = 'JPEG';
    if (sizeEstimate) sizeEstimate.textContent = '';
    if (compressionRatio) compressionRatio.textContent = '';
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
