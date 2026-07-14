/**
 * Border/Frame Adder — Add border around image
 * Controls: range#borderWidth (1-50, default:10), color#borderColor (#000000),
 *           select#borderStyle (Solid/Dashed/Dotted/Double)
 * For dashed/dotted, uses dashed lines on canvas.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const borderWidth = document.getElementById('borderWidth');
  const borderColor = document.getElementById('borderColor');
  const borderStyle = document.getElementById('borderStyle');

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
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /* ── Apply border ── */
  function processImage() {
    if (!originalImg) return;

    const width = borderWidth ? parseInt(borderWidth.value, 10) : 10;
    const color = borderColor ? borderColor.value : '#000000';
    const style = borderStyle ? borderStyle.value : 'solid';
    const imgW = originalImg.naturalWidth;
    const imgH = originalImg.naturalHeight;

    canvas.width = imgW + width * 2;
    canvas.height = imgH + width * 2;

    /* Clear with transparent background */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Draw image centered */
    ctx.drawImage(originalImg, width, width, imgW, imgH);

    /* Draw border */
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';

    const halfW = width / 2;

    switch (style) {
      case 'dashed':
        ctx.setLineDash([width * 2, width]);
        ctx.strokeRect(halfW, halfW, canvas.width - width, canvas.height - width);
        break;
      case 'dotted':
        ctx.setLineDash([width, width]);
        ctx.lineCap = 'round';
        ctx.strokeRect(halfW, halfW, canvas.width - width, canvas.height - width);
        break;
      case 'double':
        /* Outer line */
        ctx.strokeRect(halfW, halfW, canvas.width - width, canvas.height - width);
        /* Inner line */
        const innerOffset = width * 1.5;
        ctx.strokeRect(innerOffset, innerOffset, canvas.width - innerOffset * 2, canvas.height - innerOffset * 2);
        break;
      default: /* solid */
        ctx.strokeRect(halfW, halfW, canvas.width - width, canvas.height - width);
    }

    ctx.restore();
  }

  /* ── Live update ── */
  [borderWidth, borderColor, borderStyle].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        clearTimeout(window._borderTimer);
        window._borderTimer = setTimeout(processImage, 100);
      });
      el.addEventListener('change', processImage);
    }
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_bordered', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (borderWidth) borderWidth.value = '10';
    if (borderColor) borderColor.value = '#000000';
    if (borderStyle) borderStyle.value = 'solid';
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
