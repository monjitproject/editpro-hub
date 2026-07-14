/**
 * ID Photo Background Changer — Brush-based foreground/background marking
 * Controls: color#newBgColor (#ffffff), range#bgBrushSize (5-50, default:20),
 *           select#bgBrushMode (Foreground/Bg)
 * User marks keep/remove areas with brush, then new background color is applied.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const newBgColor = document.getElementById('newBgColor');
  const bgBrushSize = document.getElementById('bgBrushSize');
  const bgBrushMode = document.getElementById('bgBrushMode');

  let originalImg = null;
  let originalFilename = 'image';

  /* ── Mask canvas (green = foreground keep, red = background remove) ── */
  let maskCanvas = null;
  let maskCtx = null;

  /* ── Paint state ── */
  let painting = false;
  let lastPos = null;

  /* ── Undo history ── */
  const MAX_HISTORY = 30;
  let history = [];
  let historyIndex = -1;

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

    /* Create mask canvas - initially all neutral (128 = unmarked) */
    maskCanvas = Utils.createCanvas(canvas.width, canvas.height);
    maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = 'rgb(128,128,128)';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    history = [];
    historyIndex = -1;
    saveHistory();

    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    Utils.showToast('Mark foreground (green) and background (red), then Apply', 'info');
  }

  /* ── History helpers ── */
  function saveHistory() {
    if (!maskCanvas) return;
    history = history.slice(0, historyIndex + 1);
    history.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    maskCtx.putImageData(history[historyIndex], 0, 0);
    compositePreview();
  }

  /* ── Composite preview: show image with mask overlay ── */
  function compositePreview() {
    if (!originalImg || !maskCanvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    /* Draw semi-transparent mask overlay */
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const overlay = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const md = maskData.data;
    const od = overlay.data;

    for (let i = 0; i < md.length; i += 4) {
      const r = md[i];
      /* Green channel = foreground, Red channel = background */
      if (r > 128) {
        /* Foreground mark: slight green tint */
        od[i] = Math.min(255, od[i] + 30);
        od[i + 1] = Math.min(255, od[i + 1] + 60);
        od[i + 2] = Math.max(0, od[i + 2] - 20);
        od[i + 3] = Math.min(255, od[i + 3] + 40);
      } else if (r < 128) {
        /* Background mark: slight red tint */
        od[i] = Math.min(255, od[i] + 60);
        od[i + 1] = Math.max(0, od[i + 1] - 20);
        od[i + 2] = Math.max(0, od[i + 2] - 20);
        od[i + 3] = Math.min(255, od[i + 3] + 40);
      }
    }
    ctx.putImageData(overlay, 0, 0);
  }

  /* ── Brush painting ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function paintAt(x, y) {
    const size = bgBrushSize ? parseInt(bgBrushSize.value, 10) : 20;
    const isForeground = bgBrushMode ? bgBrushMode.value === 'foreground' : true;

    maskCtx.save();
    maskCtx.beginPath();
    maskCtx.arc(x, y, size / 2, 0, Math.PI * 2);

    if (isForeground) {
      /* Green = foreground/keep */
      maskCtx.fillStyle = 'rgb(255,0,0)';
      maskCtx.globalCompositeOperation = 'source-over';
    } else {
      /* Red = background/remove */
      maskCtx.fillStyle = 'rgb(0,0,0)';
      maskCtx.globalCompositeOperation = 'source-over';
    }

    maskCtx.fill();
    maskCtx.restore();
  }

  function paintLine(x0, y0, x1, y1) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const size = bgBrushSize ? parseInt(bgBrushSize.value, 10) : 20;
    const step = Math.max(1, size / 4);
    const steps = Math.ceil(dist / step);
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      paintAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  }

  /* ── Mouse events ── */
  canvas.addEventListener('mousedown', e => {
    if (!originalImg) return;
    painting = true;
    const pos = getCanvasCoords(e);
    lastPos = pos;
    paintAt(pos.x, pos.y);
    compositePreview();
  });

  canvas.addEventListener('mousemove', e => {
    if (!painting || !originalImg) return;
    const pos = getCanvasCoords(e);
    if (lastPos) paintLine(lastPos.x, lastPos.y, pos.x, pos.y);
    lastPos = pos;
    compositePreview();
  });

  canvas.addEventListener('mouseup', () => {
    if (painting) { painting = false; lastPos = null; saveHistory(); }
  });

  canvas.addEventListener('mouseleave', () => {
    if (painting) { painting = false; lastPos = null; saveHistory(); }
  });

  /* ── Touch events ── */
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (!originalImg) return;
    painting = true;
    const touch = e.touches[0];
    lastPos = getCanvasCoords(touch);
    paintAt(lastPos.x, lastPos.y);
    compositePreview();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!painting || !originalImg) return;
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    if (lastPos) paintLine(lastPos.x, lastPos.y, pos.x, pos.y);
    lastPos = pos;
    compositePreview();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if (painting) { painting = false; lastPos = null; saveHistory(); }
  });

  /* ── Apply background replacement ── */
  const applyBtn = document.getElementById('apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyBackground);
  }

  function applyBackground() {
    if (!originalImg || !maskCanvas) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }

    const bgColor = newBgColor ? newBgColor.value : '#ffffff';
    const bgRgb = Utils.hexToRgb(bgColor);

    /* Create result canvas */
    const resultCanvas = Utils.createCanvas(canvas.width, canvas.height);
    const resultCtx = resultCanvas.getContext('2d');

    /* Fill with new background color */
    resultCtx.fillStyle = bgColor;
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

    /* Create foreground mask from the brush marks */
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const md = maskData.data;

    /* Build alpha mask: white (255) = keep foreground, black (0) = replace with bg */
    const alphaCanvas = Utils.createCanvas(maskCanvas.width, maskCanvas.height);
    const alphaCtx = alphaCanvas.getContext('2d');
    const alphaData = alphaCtx.createImageData(maskCanvas.width, maskCanvas.height);
    const ad = alphaData.data;

    for (let i = 0; i < md.length; i += 4) {
      const r = md[i];
      /* Green-marked pixels (r > 128) are foreground */
      /* Red/Black-marked pixels (r < 128) are background */
      const alpha = r > 128 ? 255 : 0;
      ad[i] = alpha;
      ad[i + 1] = alpha;
      ad[i + 2] = alpha;
      ad[i + 3] = 255;
    }
    alphaCtx.putImageData(alphaData, 0, 0);

    /* Draw original image */
    resultCtx.save();
    resultCtx.drawImage(originalImg, 0, 0);

    /* Use destination-in with alpha mask to keep only foreground */
    resultCtx.globalCompositeOperation = 'destination-in';
    resultCtx.drawImage(alphaCanvas, 0, 0);
    resultCtx.restore();

    /* Draw result on preview canvas */
    canvas.width = resultCanvas.width;
    canvas.height = resultCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(resultCanvas, 0, 0);

    Utils.showToast('Background replaced!', 'success');
  }

  /* ── Brush size label ── */
  if (bgBrushSize) {
    bgBrushSize.addEventListener('input', () => {
      const label = document.getElementById('bgBrushSize-value');
      if (label) label.textContent = bgBrushSize.value + 'px';
    });
  }

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (!originalImg) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if (e.key === '[') {
      const v = Math.max(5, (parseInt(bgBrushSize?.value, 10) || 20) - 5);
      if (bgBrushSize) bgBrushSize.value = v;
      const label = document.getElementById('bgBrushSize-value');
      if (label) label.textContent = v + 'px';
    }
    if (e.key === ']') {
      const v = Math.min(50, (parseInt(bgBrushSize?.value, 10) || 20) + 5);
      if (bgBrushSize) bgBrushSize.value = v;
      const label = document.getElementById('bgBrushSize-value');
      if (label) label.textContent = v + 'px';
    }
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_bgchanged', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (newBgColor) newBgColor.value = '#ffffff';
    if (bgBrushSize) bgBrushSize.value = '20';
    if (bgBrushMode) bgBrushMode.value = 'foreground';
    const label = document.getElementById('bgBrushSize-value');
    if (label) label.textContent = '20px';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
    maskCanvas = null;
    history = [];
    historyIndex = -1;
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
