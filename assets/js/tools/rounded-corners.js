/**
 * Rounded Corners — Apply rounded corners to image using canvas clipping path
 * Controls: range#cornerRadius (0-200, default:20)
 * Exports as PNG with transparent rounded corners.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const cornerRadius = document.getElementById('cornerRadius');

  let originalImg = null;
  let originalFilename = 'image';

  /* ── Upload ── */
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /* ── Apply rounded corners ── */
  function processImage() {
    if (!originalImg) return;

    const radius = cornerRadius ? parseInt(cornerRadius.value, 10) : 20;
    const w = originalImg.naturalWidth;
    const h = originalImg.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    /* Clear canvas (transparent) */
    ctx.clearRect(0, 0, w, h);

    /* Draw rounded rectangle clipping path */
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, 0, 0, w, h, radius);
    ctx.closePath();
    ctx.clip();

    /* Draw image inside clipped area */
    ctx.drawImage(originalImg, 0, 0, w, h);
    ctx.restore();
  }

  /* ── Rounded rectangle path helper ── */
  function roundedRect(context, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
  }

  /* ── Live update ── */
  if (cornerRadius) {
    cornerRadius.addEventListener('input', () => {
      const label = document.getElementById('cornerRadius-value');
      if (label) label.textContent = cornerRadius.value + 'px';
      clearTimeout(window._rcTimer);
      window._rcTimer = setTimeout(processImage, 100);
    });
  }

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_rounded', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (cornerRadius) cornerRadius.value = '20';
    const label = document.getElementById('cornerRadius-value');
    if (label) label.textContent = '20px';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
  });

  /* ── Clipboard paste ── */
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
