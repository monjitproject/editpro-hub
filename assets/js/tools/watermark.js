/**
 * Watermark Adder — Place text watermark on image with opacity
 * Controls: text#watermarkText, range#watermarkOpacity (5-100, default:30),
 *           range#watermarkSize (12-120, default:36), select#watermarkPos
 * Positions: Center / Bottom Right / Bottom Left / Top Right / Top Left / Tiled
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const watermarkText = document.getElementById('watermarkText');
  const watermarkOpacity = document.getElementById('watermarkOpacity');
  const watermarkSize = document.getElementById('watermarkSize');
  const watermarkPos = document.getElementById('watermarkPos');

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
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /* ── Apply watermark ── */
  function processImage() {
    if (!originalImg) return;

    const text = watermarkText ? watermarkText.value.trim() : '© Watermark';
    const opacity = watermarkOpacity ? parseInt(watermarkOpacity.value, 10) / 100 : 0.3;
    const fontSize = watermarkSize ? parseInt(watermarkSize.value, 10) : 36;
    const position = watermarkPos ? watermarkPos.value : 'center';

    /* Draw original image */
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    /* Set watermark styles */
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textBaseline = 'middle';

    /* Add shadow for visibility */
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    if (position === 'tiled') {
      /* Tiled watermark across entire image */
      ctx.textAlign = 'center';
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      const gapX = textWidth + fontSize * 2;
      const gapY = textHeight * 3;
      const angle = -30 * Math.PI / 180;

      for (let y = -canvas.height; y < canvas.height * 2; y += gapY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += gapX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      /* Single position */
      const padding = fontSize;
      let x, y;
      ctx.textAlign = 'left';

      const metrics = ctx.measureText(text);
      const tw = metrics.width;

      switch (position) {
        case 'center':
          ctx.textAlign = 'center';
          x = canvas.width / 2;
          y = canvas.height / 2;
          break;
        case 'bottom-right':
          x = canvas.width - tw - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - tw - padding;
          y = padding + fontSize / 2;
          break;
        case 'top-left':
          x = padding;
          y = padding + fontSize / 2;
          break;
        default:
          ctx.textAlign = 'center';
          x = canvas.width / 2;
          y = canvas.height / 2;
      }

      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  /* ── Live update on control changes ── */
  [watermarkText, watermarkOpacity, watermarkSize, watermarkPos].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        clearTimeout(window._wmTimer);
        window._wmTimer = setTimeout(processImage, 100);
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
    Utils.downloadCanvas(canvas, originalFilename + '_watermarked', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (watermarkText) watermarkText.value = '';
    if (watermarkOpacity) watermarkOpacity.value = '30';
    if (watermarkSize) watermarkSize.value = '36';
    if (watermarkPos) watermarkPos.value = 'center';
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
