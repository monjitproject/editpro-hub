/**
 * File Reducer Tool
 * Reduces image file size by trying different quality levels to hit a target.
 * Controls: select#targetSize (100KB/250KB/500KB/1MB/2MB/Custom), select#reducerFormat (JPEG/WEBP/PNG)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const targetSizeSelect = document.getElementById('targetSize');
  const customTargetInput = document.getElementById('customTarget');
  const reducerFormat = document.getElementById('reducerFormat');
  const originalSizeInfo = document.getElementById('originalSize');
  const resultSizeInfo = document.getElementById('resultSize');
  const resultQuality = document.getElementById('resultQuality');
  const reduceBtn = document.getElementById('reduceBtn');
  let originalImg = null;
  let originalFilename = 'image';
  let originalFileSize = 0;

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
    originalFileSize = file.size;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');

    if (originalSizeInfo) originalSizeInfo.textContent = Utils.formatFileSize(originalFileSize);
    processImage();
  }

  function getTargetBytes() {
    const val = targetSizeSelect ? targetSizeSelect.value : '500KB';
    if (val === 'Custom') {
      return (customTargetInput ? parseInt(customTargetInput.value, 10) || 500 : 500) * 1024;
    }
    const map = {
      '100KB': 100 * 1024,
      '250KB': 250 * 1024,
      '500KB': 500 * 1024,
      '1MB': 1024 * 1024,
      '2MB': 2 * 1024 * 1024
    };
    return map[val] || 500 * 1024;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);
  }

  async function reduceToTarget() {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }

    const targetBytes = getTargetBytes();
    const format = reducerFormat ? reducerFormat.value : 'JPEG';
    const mime = getMimeType(format);

    // PNG is lossless, can't binary search quality for size reduction
    if (format === 'PNG') {
      Utils.showToast('PNG is lossless. Use JPEG or WEBP for size reduction.', 'warning');
      return;
    }

    Utils.showToast('Reducing file size...', 'info');

    // Binary search for optimal quality
    let low = 1;
    let high = 100;
    let bestQuality = 1;
    let bestBlob = null;

    // First check if already small enough at max quality
    let initialBlob = await Utils.canvasToBlob(canvas, mime, 1.0);
    if (initialBlob.size <= targetBytes) {
      bestBlob = initialBlob;
      bestQuality = 100;
    } else {
      // Binary search
      for (let i = 0; i < 10; i++) {
        const mid = Math.floor((low + high) / 2);
        const blob = await Utils.canvasToBlob(canvas, mime, mid / 100);
        if (blob.size <= targetBytes) {
          bestQuality = mid;
          bestBlob = blob;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // Get the final blob at best quality
      if (!bestBlob || bestBlob.size > targetBytes) {
        bestBlob = await Utils.canvasToBlob(canvas, mime, high / 100);
        bestQuality = Math.max(1, high);
      }
    }

    if (resultSizeInfo) resultSizeInfo.textContent = Utils.formatFileSize(bestBlob.size);
    if (resultQuality) resultQuality.textContent = `${bestQuality}%`;
    Utils.showToast(`Reduced to ${Utils.formatFileSize(bestBlob.size)} at ${bestQuality}% quality`, 'success');
  }

  if (targetSizeSelect) {
    targetSizeSelect.addEventListener('change', () => {
      if (customTargetInput) {
        customTargetInput.style.display = targetSizeSelect.value === 'Custom' ? '' : 'none';
      }
    });
  }
  if (reduceBtn) reduceBtn.addEventListener('click', reduceToTarget);

  document.getElementById('download-btn')?.addEventListener('click', async () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    const targetBytes = getTargetBytes();
    const format = reducerFormat ? reducerFormat.value : 'JPEG';
    const mime = getMimeType(format);

    if (format === 'PNG') {
      Utils.downloadCanvas(canvas, originalFilename, 'png');
      return;
    }

    // Binary search and download
    let low = 1, high = 100, bestBlob = null;
    let initialBlob = await Utils.canvasToBlob(canvas, mime, 1.0);
    if (initialBlob.size <= targetBytes) {
      bestBlob = initialBlob;
    } else {
      for (let i = 0; i < 10; i++) {
        const mid = Math.floor((low + high) / 2);
        const blob = await Utils.canvasToBlob(canvas, mime, mid / 100);
        if (blob.size <= targetBytes) {
          bestBlob = blob;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      if (!bestBlob) {
        bestBlob = await Utils.canvasToBlob(canvas, mime, high / 100);
      }
    }

    Utils.downloadFile(bestBlob, `${originalFilename}.${getExt(format)}`, mime);
    Utils.showToast('Reduced image downloaded', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    originalFileSize = 0;
    if (targetSizeSelect) targetSizeSelect.value = '500KB';
    if (customTargetInput) customTargetInput.style.display = 'none';
    if (reducerFormat) reducerFormat.value = 'JPEG';
    if (originalSizeInfo) originalSizeInfo.textContent = '';
    if (resultSizeInfo) resultSizeInfo.textContent = '';
    if (resultQuality) resultQuality.textContent = '';
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
