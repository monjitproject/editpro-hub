/**
 * Background Eraser — Manual brush-based background removal
 * Controls: range#brushSize (1-100, default 20), select#eraseMode (0=Erase, 1=Restore)
 * Paints on a mask canvas; supports undo via history array.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const brushSlider = document.getElementById('brushSize');
  const brushValue = document.getElementById('brushSize-value');
  const modeSelect = document.getElementById('eraseMode');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Mask canvas (same size as image) — alpha channel controls visibility ── */
  let maskCanvas = null;
  let maskCtx = null;

  /* ── Painting state ── */
  let painting = false;
  let lastPos = null;

  /* ── Undo history (array of ImageData snapshots of the mask) ── */
  const MAX_HISTORY = 30;
  let history = [];
  let historyIndex = -1;

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
        ctx.drawImage(originalImg, 0, 0);
        /* Create mask: fully opaque (255) initially */
        maskCanvas = Utils.createCanvas(canvas.width, canvas.height);
        maskCtx = maskCanvas.getContext('2d');
        maskCtx.fillStyle = 'rgba(0,0,0,1)';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        history = [];
        historyIndex = -1;
        saveHistory();
        zone.style.display = 'none';
        document.getElementById('tool-workspace').classList.add('active');
        Utils.showToast('Image loaded! Paint to erase.', 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  /* ── History helpers ── */
  function saveHistory() {
    if (!maskCanvas) return;
    /* Remove future states if we branched */
    history = history.slice(0, historyIndex + 1);
    history.push(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    maskCtx.putImageData(history[historyIndex], 0, 0);
    compositeAndDraw();
  }

  /* ── Composite original image with mask and draw to preview canvas ── */
  function compositeAndDraw() {
    if (!originalImg || !maskCanvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* Draw checkerboard to show transparency */
    drawCheckerboard(ctx, canvas.width, canvas.height);
    /* Draw original */
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    /* Apply mask: use destination-in to keep only where mask is opaque */
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  }

  /* ── Checkerboard pattern ── */
  function drawCheckerboard(context, w, h) {
    const size = 10;
    context.save();
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        context.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ccc' : '#fff';
        context.fillRect(x, y, size, size);
      }
    }
    context.restore();
  }

  /* ── Brush stroke on mask ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function paintAt(x, y) {
    const size = parseInt(brushSlider?.value, 10) || 20;
    const isErase = !modeSelect || parseInt(modeSelect.value, 10) === 0;
    maskCtx.save();
    maskCtx.globalCompositeOperation = isErase ? 'destination-out' : 'source-over';
    maskCtx.beginPath();
    maskCtx.arc(x, y, size / 2, 0, Math.PI * 2);
    maskCtx.fillStyle = isErase ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,1)';
    maskCtx.fill();
    maskCtx.restore();
  }

  function paintLine(x0, y0, x1, y1) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const size = parseInt(brushSlider?.value, 10) || 20;
    const step = Math.max(1, size / 4);
    const steps = Math.ceil(dist / step);
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      paintAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!originalImg) return;
    painting = true;
    const pos = getCanvasCoords(e);
    lastPos = pos;
    paintAt(pos.x, pos.y);
    compositeAndDraw();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!painting || !originalImg) return;
    const pos = getCanvasCoords(e);
    if (lastPos) {
      paintLine(lastPos.x, lastPos.y, pos.x, pos.y);
    }
    lastPos = pos;
    compositeAndDraw();
  });

  canvas.addEventListener('mouseup', () => {
    if (painting) {
      painting = false;
      lastPos = null;
      saveHistory();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (painting) {
      painting = false;
      lastPos = null;
      saveHistory();
    }
  });

  /* ── Touch support ── */
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!originalImg) return;
    painting = true;
    const touch = e.touches[0];
    lastPos = getCanvasCoords(touch);
    paintAt(lastPos.x, lastPos.y);
    compositeAndDraw();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!painting || !originalImg) return;
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    if (lastPos) paintLine(lastPos.x, lastPos.y, pos.x, pos.y);
    lastPos = pos;
    compositeAndDraw();
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    if (painting) { painting = false; lastPos = null; saveHistory(); }
  });

  /* ── Brush size label ── */
  if (brushSlider) {
    brushSlider.addEventListener('input', () => {
      if (brushValue) brushValue.textContent = brushSlider.value + 'px';
    });
  }

  /* ── Keyboard shortcuts: Ctrl+Z for undo, [ and ] for brush size ── */
  document.addEventListener('keydown', (e) => {
    if (!originalImg) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if (e.key === '[') {
      const v = Math.max(1, (parseInt(brushSlider?.value, 10) || 20) - 5);
      if (brushSlider) brushSlider.value = v;
      if (brushValue) brushValue.textContent = v + 'px';
    }
    if (e.key === ']') {
      const v = Math.min(100, (parseInt(brushSlider?.value, 10) || 20) + 5);
      if (brushSlider) brushSlider.value = v;
      if (brushValue) brushValue.textContent = v + 'px';
    }
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    compositeAndDraw();
    Utils.downloadCanvas(canvas, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (brushSlider) brushSlider.value = 20;
    if (brushValue) brushValue.textContent = '20px';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
    maskCanvas = null;
    history = [];
    historyIndex = -1;
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
