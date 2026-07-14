/**
 * Rotator Tool
 * Quick rotations: 90 CW, 90 CCW, 180, 270 CW.
 * Controls: select#rotationAngle
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const rotationSelect = document.getElementById('rotationAngle');
  let originalImg = null;
  let originalFilename = 'image';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  function processImage() {
    if (!originalImg) return;
    const angle = parseInt(rotationSelect.value, 10);

    // Reset canvas to original dimensions
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    if (angle === 0) return;

    const rotated = Utils.rotateCanvas(canvas, angle);

    // For 90/270 rotations, swap width and height
    if (angle === 90 || angle === 270 || angle === -90) {
      canvas.width = originalImg.naturalHeight;
      canvas.height = originalImg.naturalWidth;
    } else {
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rotated, 0, 0);
  }

  // Event listeners for controls
  if (rotationSelect) {
    rotationSelect.addEventListener('change', processImage);
  }

  // Apply button (if present)
  const applyBtn = document.getElementById('apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', processImage);
  }

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_rotated', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (rotationSelect) rotationSelect.value = '0';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Rotation reset', 'info');
    });
  }

  // Clipboard paste support
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile());
        break;
      }
    }
  });
});
