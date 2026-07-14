/**
 * Color Picker (Image) Tool
 * Upload an image and click on it to pick a color.
 * Shows a magnified preview around the cursor, displays HEX/RGB/HSL values,
 * supports click-to-copy, and maintains a color history (last 10).
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  let originalImg = null;
  let originalFilename = 'image';
  let colorHistory = [];
  let magnifierSize = 9; // must be odd — number of pixels sampled around cursor
  let zoomLevel = 8;

  // ── Upload zone setup ──
  const zone = document.getElementById('upload-zone');
  const fileInput = zone ? zone.querySelector('input[type="file"]') : null;

  // ── DOM references for color display ──
  const hexVal = document.getElementById('hexValue');
  const rgbVal = document.getElementById('rgbValue');
  const hslVal = document.getElementById('hslValue');
  const previewSwatch = document.getElementById('colorSwatch');
  const historyContainer = document.getElementById('colorHistory');
  const magnifierCanvas = document.getElementById('magnifier-canvas');
  const magnifierCtx = magnifierCanvas ? magnifierCanvas.getContext('2d') : null;

  function handleFile(file) {
    if (!Utils.validateImageFile(file, 10)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (zone) zone.style.display = 'none';
        const workspace = document.getElementById('tool-workspace');
        if (workspace) workspace.style.display = 'block';
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
  }
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
  }

  // ── Color picking on canvas click / move ──
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  }

  function pickColor(x, y) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return null;
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const r = imageData[0];
    const g = imageData[1];
    const b = imageData[2];
    const hex = Utils.rgbToHex(r, g, b);
    const hsl = Utils.rgbToHsl(r, g, b);

    return { r, g, b, hex, hsl };
  }

  function updateColorDisplay(color) {
    if (!color) return;

    if (previewSwatch) {
      previewSwatch.style.backgroundColor = color.hex;
    }
    if (hexVal) hexVal.textContent = color.hex.toUpperCase();
    if (rgbVal) rgbVal.textContent = `${color.r}, ${color.g}, ${color.b}`;
    if (hslVal) hslVal.textContent = `${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%`;
  }

  function drawMagnifier(x, y) {
    if (!magnifierCanvas || !magnifierCtx) return;

    const half = Math.floor(magnifierSize / 2);
    const srcX = Math.max(0, Math.min(x - half, canvas.width - magnifierSize));
    const srcY = Math.max(0, Math.min(y - half, canvas.height - magnifierSize));

    const mW = magnifierCanvas.width;
    const mH = magnifierCanvas.height;
    magnifierCtx.clearRect(0, 0, mW, mH);

    // Draw zoomed pixels
    magnifierCtx.imageSmoothingEnabled = false;
    magnifierCtx.drawImage(
      canvas,
      srcX, srcY, magnifierSize, magnifierSize,
      0, 0, mW, mH
    );

    // Draw grid lines
    const cellSize = mW / magnifierSize;
    magnifierCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    magnifierCtx.lineWidth = 0.5;
    for (let i = 0; i <= magnifierSize; i++) {
      const pos = i * cellSize;
      magnifierCtx.beginPath();
      magnifierCtx.moveTo(pos, 0);
      magnifierCtx.lineTo(pos, mH);
      magnifierCtx.stroke();
      magnifierCtx.beginPath();
      magnifierCtx.moveTo(0, pos);
      magnifierCtx.lineTo(mW, pos);
      magnifierCtx.stroke();
    }

    // Draw border
    magnifierCtx.strokeStyle = '#fff';
    magnifierCtx.lineWidth = 2;
    magnifierCtx.strokeRect(0, 0, mW, mH);

    // Highlight center pixel
    const centerIdx = Math.floor(magnifierSize / 2);
    const cs = centerIdx * cellSize;
    magnifierCtx.strokeStyle = '#ff0';
    magnifierCtx.lineWidth = 2;
    magnifierCtx.strokeRect(cs, cs, cellSize, cellSize);
  }

  function addToHistory(color) {
    // Avoid duplicate consecutive entries
    if (colorHistory.length > 0 && colorHistory[0].hex === color.hex) return;

    colorHistory.unshift({ hex: color.hex, r: color.r, g: color.g, b: color.b });
    if (colorHistory.length > 10) colorHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    if (!historyContainer) return;
    historyContainer.innerHTML = '';
    colorHistory.forEach((c) => {
      const swatch = document.createElement('div');
      swatch.className = 'history-swatch';
      swatch.style.backgroundColor = c.hex;
      swatch.title = c.hex.toUpperCase();
      swatch.addEventListener('click', () => {
        copyToClipboard(c.hex.toUpperCase());
      });
      historyContainer.appendChild(swatch);
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        Utils.showToast(`Copied: ${text}`, 'success');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      Utils.showToast(`Copied: ${text}`, 'success');
    } catch (e) {
      Utils.showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  // ── Canvas event listeners ──
  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCanvasCoords(e);
    const color = pickColor(x, y);
    if (color) {
      updateColorDisplay(color);
      drawMagnifier(x, y);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (magnifierCtx && magnifierCanvas) {
      magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
    }
  });

  canvas.addEventListener('click', (e) => {
    const { x, y } = getCanvasCoords(e);
    const color = pickColor(x, y);
    if (color) {
      addToHistory(color);
      copyToClipboard(color.hex.toUpperCase());
    }
  });

  // ── Copy buttons for individual values ──
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const el = document.getElementById(targetId);
      if (el) {
        copyToClipboard(el.textContent);
      }
    });
  });

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      originalImg = null;
      colorHistory = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      if (zone) zone.style.display = '';
      const workspace = document.getElementById('tool-workspace');
      if (workspace) workspace.style.display = 'none';
      if (previewSwatch) previewSwatch.style.backgroundColor = 'transparent';
      if (hexVal) hexVal.textContent = '--';
      if (rgbVal) rgbVal.textContent = '--';
      if (hslVal) hslVal.textContent = '--';
      renderHistory();
      Utils.showToast('Color picker reset', 'info');
    });
  }

  // ── Clipboard paste support ──
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        handleFile(blob);
        break;
      }
    }
  });
});
