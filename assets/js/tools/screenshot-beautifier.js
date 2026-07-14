/**
 * Screenshot Beautifier
 * Add professional device frames, shadows, and backgrounds to screenshots.
 * Controls: select#frameStyle (macOS/Windows/Generic Browser/None),
 *   range#shadowIntensity (0-100, default:50), color#frameBg (#e2e8f0)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');
  const frameStyleSelect = document.getElementById('frameStyle');
  const shadowSlider = document.getElementById('shadowIntensity');
  const shadowValue = document.getElementById('shadowIntensity-value');
  const frameBgInput = document.getElementById('frameBg');
  let originalImg = null;
  let originalFilename = 'screenshot';

  /* ---- Upload ---- */
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
    originalImg = await Utils.loadImage(file);
    zone.style.display = 'none';
    if (workspace) workspace.classList.add('active');
    processImage();
  }

  function getFrameStyle() {
    if (!frameStyleSelect) return 'macOS';
    const val = frameStyleSelect.value;
    /* HTML uses "0","1","2","3" for macOS, Windows, Generic Browser, None */
    const styles = ['macOS', 'Windows', 'Generic Browser', 'None'];
    return styles[parseInt(val, 10)] || 'macOS';
  }

  function processImage() {
    if (!originalImg) return;

    const style = getFrameStyle();
    const shadowIntensity = shadowSlider ? parseInt(shadowSlider.value, 10) / 100 : 0.5;
    const bgColor = frameBgInput ? frameBgInput.value : '#e2e8f0';

    if (shadowValue && shadowSlider) {
      shadowValue.textContent = shadowSlider.value + '%';
    }

    const imgW = originalImg.naturalWidth;
    const imgH = originalImg.naturalHeight;

    /* Frame dimensions */
    const titleBarHeight = style === 'None' ? 0 : 36;
    const frameRadius = style === 'macOS' ? 10 : (style === 'Windows' ? 0 : 8);
    const framePadding = style === 'None' ? 0 : 0;
    const shadowSpread = Math.round(shadowIntensity * 40);

    /* Total canvas size with shadow space */
    const padding = shadowSpread + 20;
    const totalW = imgW + padding * 2;
    const totalH = imgH + titleBarHeight + padding * 2;

    canvas.width = totalW;
    canvas.height = totalH;

    /* Background */
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    /* Draw shadow */
    if (shadowIntensity > 0 && style !== 'None') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,' + (shadowIntensity * 0.6).toFixed(2) + ')';
      ctx.shadowBlur = shadowSpread;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(shadowSpread * 0.3);
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, padding, padding + titleBarHeight, imgW, imgH, frameRadius);
      ctx.fill();
      ctx.restore();
    }

    /* Draw frame background */
    if (style !== 'None') {
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, padding, padding + titleBarHeight, imgW, imgH, frameRadius);
      ctx.fill();

      /* Draw title bar */
      drawTitleBar(ctx, style, padding, padding, imgW, titleBarHeight, frameRadius);
    }

    /* Draw the screenshot image */
    ctx.save();
    if (style !== 'None') {
      ctx.beginPath();
      roundRect(ctx, padding, padding + titleBarHeight, imgW, imgH, 0);
      ctx.clip();
    }
    ctx.drawImage(originalImg, padding, padding + titleBarHeight, imgW, imgH);
    ctx.restore();
  }

  function drawTitleBar(ctx, style, x, y, width, height, radius) {
    if (style === 'macOS') {
      /* macOS-style title bar with traffic lights */
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
      ctx.fill();

      /* Subtle bottom border */
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();

      /* Traffic light dots */
      const dotY = y + height / 2;
      const dotR = 6;
      const dotSpacing = 20;
      const dotStartX = x + 16;

      /* Close (red) */
      ctx.beginPath();
      ctx.arc(dotStartX, dotY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = '#ff5f57';
      ctx.fill();
      ctx.strokeStyle = '#e0443e';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      /* Minimize (yellow) */
      ctx.beginPath();
      ctx.arc(dotStartX + dotSpacing, dotY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = '#febc2e';
      ctx.fill();
      ctx.strokeStyle = '#d4a028';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      /* Maximize (green) */
      ctx.beginPath();
      ctx.arc(dotStartX + dotSpacing * 2, dotY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = '#28c840';
      ctx.fill();
      ctx.strokeStyle = '#1fa834';
      ctx.lineWidth = 0.5;
      ctx.stroke();

    } else if (style === 'Windows') {
      /* Windows-style unified bar */
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(x, y, width, height);

      /* Bottom border */
      ctx.strokeStyle = '#c0c0c0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();

      /* Window controls (right side) */
      const controlSize = height;
      const controlY = y;

      /* Close button (red on hover, gray default) */
      ctx.fillStyle = '#888';
      ctx.fillRect(x + width - controlSize, controlY, controlSize, controlSize);
      /* Close X */
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + width - controlSize + 12, controlY + 12);
      ctx.lineTo(x + width - 12, controlY + controlSize - 12);
      ctx.moveTo(x + width - 12, controlY + 12);
      ctx.lineTo(x + width - controlSize + 12, controlY + controlSize - 12);
      ctx.stroke();

      /* Maximize button */
      ctx.fillStyle = '#888';
      ctx.fillRect(x + width - controlSize * 2, controlY, controlSize, controlSize);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + width - controlSize * 2 + 11, controlY + 11, 14, 14);

      /* Minimize button */
      ctx.fillStyle = '#888';
      ctx.fillRect(x + width - controlSize * 3, controlY, controlSize, controlSize);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + width - controlSize * 3 + 11, controlY + controlSize / 2);
      ctx.lineTo(x + width - controlSize * 3 + controlSize - 11, controlY + controlSize / 2);
      ctx.stroke();

    } else if (style === 'Generic Browser') {
      /* Generic browser bar */
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
      ctx.fill();

      /* Bottom border */
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();

      /* Fake URL bar */
      const urlBarH = 20;
      const urlBarY = y + (height - urlBarH) / 2;
      const urlBarX = x + 70;
      const urlBarW = width - 140;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(urlBarX, urlBarY, urlBarW, urlBarH, 4);
      ctx.fill();
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(urlBarX, urlBarY, urlBarW, urlBarH, 4);
      ctx.stroke();

      /* URL bar text */
      ctx.fillStyle = '#999';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('https://example.com', urlBarX + 8, urlBarY + 14);

      /* Three dots (menu) */
      const dotStartX = x + 14;
      const dotY2 = y + height / 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(dotStartX, dotY2 - 6 + i * 6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#666';
        ctx.fill();
      }
    }
  }

  /* Helper: draw a rounded rectangle path */
  function roundRect(ctx, x, y, w, h, r) {
    if (r === 0) {
      ctx.fillRect(x, y, w, h);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /* ---- Control Events ---- */
  const debouncedProcess = Utils.debounce ? Utils.debounce(processImage, 100) : processImage;
  if (frameStyleSelect) frameStyleSelect.addEventListener('change', processImage);
  if (shadowSlider) shadowSlider.addEventListener('input', debouncedProcess);
  if (frameBgInput) frameBgInput.addEventListener('input', debouncedProcess);

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload a screenshot first', 'warning');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename, 'png');
    Utils.showToast('Beautified screenshot downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'screenshot';
    canvas.width = 0;
    canvas.height = 0;
    if (frameStyleSelect) frameStyleSelect.value = '0';
    if (shadowSlider) shadowSlider.value = 50;
    if (shadowValue) shadowValue.textContent = '50%';
    if (frameBgInput) frameBgInput.value = '#e2e8f0';
    zone.style.display = '';
    if (workspace) workspace.classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });

  /* ---- Clipboard paste ---- */
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
