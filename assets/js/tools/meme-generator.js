/**
 * Meme Generator — Add top/bottom meme text to image
 * Controls: text#topText, text#bottomText, range#memeFontSize (16-120, default:48)
 * Classic meme style: white fill + thick black stroke, Impact font.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const topText = document.getElementById('topText');
  const bottomText = document.getElementById('bottomText');
  const memeFontSize = document.getElementById('memeFontSize');
  const fontSizeValue = document.getElementById('fontSizeValue');

  let originalImg = null;
  let originalFilename = 'meme';

  /* ── Upload ── */
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const fileInput = zone.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
      });
    }
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

  /* ── Draw meme text ── */
  function processImage() {
    if (!originalImg) return;

    const top = topText ? topText.value.trim() : '';
    const bottom = bottomText ? bottomText.value.trim() : '';
    const baseFontSize = memeFontSize ? parseInt(memeFontSize.value, 10) : 48;

    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    if (!top && !bottom) return;

    // Auto-calculate font size based on image width
    const autoFontSize = Math.max(baseFontSize, Math.floor(canvas.width / 12));

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    // Detect font availability, use Impact or fallback
    const font = 'Impact, Arial Black, sans-serif';
    ctx.font = `bold ${autoFontSize}px ${font}`;

    const strokeWidth = Math.max(3, Math.floor(autoFontSize / 15));
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const centerX = canvas.width / 2;
    const padding = autoFontSize * 0.3;
    const maxWidth = canvas.width - padding * 2;

    // Draw top text
    if (top) {
      const topLines = wrapText(ctx, top.toUpperCase(), maxWidth);
      const totalHeight = topLines.length * autoFontSize * 1.1;
      let y = padding;
      topLines.forEach(line => {
        // Stroke (outline)
        ctx.strokeText(line, centerX, y, maxWidth);
        // Fill
        ctx.fillStyle = '#ffffff';
        ctx.fillText(line, centerX, y, maxWidth);
        y += autoFontSize * 1.1;
      });
    }

    // Draw bottom text
    if (bottom) {
      ctx.textBaseline = 'bottom';
      const bottomLines = wrapText(ctx, bottom.toUpperCase(), maxWidth);
      const totalHeight = bottomLines.length * autoFontSize * 1.1;
      let y = canvas.height - padding;
      // Draw from bottom up
      for (let i = bottomLines.length - 1; i >= 0; i--) {
        ctx.strokeText(bottomLines[i], centerX, y, maxWidth);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bottomLines[i], centerX, y, maxWidth);
        y -= autoFontSize * 1.1;
      }
    }

    ctx.restore();
  }

  /* ── Word-wrap text to fit maxWidth ── */
  function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /* ── Live update ── */
  [topText, bottomText, memeFontSize].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (el === memeFontSize && fontSizeValue) {
        fontSizeValue.textContent = memeFontSize.value + 'px';
      }
      clearTimeout(window._memeTimer);
      window._memeTimer = setTimeout(processImage, 80);
    });
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_meme', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (topText) topText.value = '';
    if (bottomText) bottomText.value = '';
    if (memeFontSize) memeFontSize.value = '48';
    if (fontSizeValue) fontSizeValue.textContent = '48px';
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
