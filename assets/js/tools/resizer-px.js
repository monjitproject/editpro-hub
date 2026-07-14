/**
 * Resizer (Pixels) — Resize image to exact pixel dimensions
 * Controls: number#newWidth (default 800), number#newHeight (default 600),
 *           checkbox#lockAspect
 * When locked, changing width auto-updates height proportionally and vice versa.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const newWidthInput = document.getElementById('newWidth');
  const newHeightInput = document.getElementById('newHeight');
  const lockAspectCheck = document.getElementById('lockAspect');
  let originalImg = null;
  let originalFilename = 'image';
  let aspectRatio = 1; // width / height

  /* ── Upload ── */
  function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        aspectRatio = canvas.width / canvas.height;
        /* Set initial control values to current dimensions */
        if (newWidthInput) newWidthInput.value = canvas.width;
        if (newHeightInput) newHeightInput.value = canvas.height;
        ctx.drawImage(originalImg, 0, 0);
        zone.style.display = 'none';
        document.getElementById('tool-workspace').classList.add('active');
        Utils.showToast('Image loaded!', 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  /* ── Keep aspect ratio in sync ── */
  if (newWidthInput) {
    newWidthInput.addEventListener('input', () => {
      if (lockAspectCheck?.checked && originalImg) {
        const w = parseInt(newWidthInput.value, 10) || 0;
        newHeightInput.value = Math.round(w / aspectRatio);
      }
    });
  }

  if (newHeightInput) {
    newHeightInput.addEventListener('input', () => {
      if (lockAspectCheck?.checked && originalImg) {
        const h = parseInt(newHeightInput.value, 10) || 0;
        newWidthInput.value = Math.round(h * aspectRatio);
      }
    });
  }

  /* ── Draw preview at original (controls are for download dimensions) ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
  }

  /* ── Download at specified dimensions ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    const w = parseInt(newWidthInput?.value, 10) || canvas.width;
    const h = parseInt(newHeightInput?.value, 10) || canvas.height;
    if (w <= 0 || h <= 0) {
      Utils.showToast('Invalid dimensions', 'error');
      return;
    }
    const resized = Utils.resizeCanvas(Utils.imageToCanvas(originalImg), w, h);
    Utils.downloadCanvas(resized, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (originalImg) {
      if (newWidthInput) newWidthInput.value = canvas.width;
      if (newHeightInput) newHeightInput.value = canvas.height;
      processImage();
    }
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
  });

  /* ── Clipboard paste ── */
  document.addEventListener('paste', (e) => {
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
