/**
 * Text on Image — Overlay text on uploaded image
 * Controls: select#fontFamily, range#fontSize (8-200, default:36),
 *           color#textColor, select#textAlign, text input for content
 * Click on image to set text position; default center.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const fontFamily = document.getElementById('fontFamily');
  const fontSize = document.getElementById('fontSize');
  const textColor = document.getElementById('textColor');
  const textAlign = document.getElementById('textAlign');
  const textInput = document.getElementById('textInput');
  const fontSizeValue = document.getElementById('fontSizeValue');

  let originalImg = null;
  let originalFilename = 'image';
  let textX = null;
  let textY = null;

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
    textX = null;
    textY = null;
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /* ── Click to set text position ── */
  canvas.addEventListener('click', (e) => {
    if (!originalImg) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    textX = (e.clientX - rect.left) * scaleX;
    textY = (e.clientY - rect.top) * scaleY;
    processImage();
  });

  /* ── Draw text on image ── */
  function processImage() {
    if (!originalImg) return;

    const text = textInput ? textInput.value : '';
    const font = fontFamily ? fontFamily.value : 'Arial';
    const size = fontSize ? parseInt(fontSize.value, 10) : 36;
    const color = textColor ? textColor.value : '#ffffff';
    const align = textAlign ? textAlign.value : 'center';

    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    if (!text) return;

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px "${font}", sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    // Shadow for readability
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = Math.max(2, size / 12);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const x = textX !== null ? textX : canvas.width / 2;
    const y = textY !== null ? textY : canvas.height / 2;

    // Handle multi-line text
    const lines = text.split('\n');
    const lineHeight = size * 1.3;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });

    ctx.restore();
  }

  /* ── Live update ── */
  [fontFamily, fontSize, textColor, textAlign, textInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (el === fontSize && fontSizeValue) {
        fontSizeValue.textContent = fontSize.value + 'px';
      }
      clearTimeout(window._toiTimer);
      window._toiTimer = setTimeout(processImage, 80);
    });
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_text', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (textInput) textInput.value = '';
    if (fontSize) fontSize.value = '36';
    if (fontSizeValue) fontSizeValue.textContent = '36px';
    if (fontFamily) fontFamily.value = 'Arial';
    if (textColor) textColor.value = '#ffffff';
    if (textAlign) textAlign.value = 'center';
    textX = null;
    textY = null;
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
