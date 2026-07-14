/**
 * Circle Crop Tool — Crop image into a circle with transparent background
 * Controls: range#circleSize (10-100, default 80, unit %)
 * Exports as PNG with transparent corners.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const circleSizeSlider = document.getElementById('circleSize');
  const circleSizeValue = document.getElementById('circleSize-value');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Circle centre offset (for drag-to-reposition) ── */
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };

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
        offsetX = 0;
        offsetY = 0;
        processImage();
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

  /* ── Process: draw image with circle clip overlay ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const pct = parseInt(circleSizeSlider?.value, 10) / 100;
    const base = Math.min(canvas.width, canvas.height);
    const radius = (base * pct) / 2;
    const cx = canvas.width / 2 + offsetX;
    const cy = canvas.height / 2 + offsetY;

    /* Semi-transparent overlay outside circle */
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    /* Circle border */
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Slider events ── */
  function onSliderInput() {
    const val = circleSizeSlider?.value || 80;
    if (circleSizeValue) circleSizeValue.textContent = val + '%';
    processImage();
  }

  if (circleSizeSlider) {
    circleSizeSlider.addEventListener('input', Utils.debounce(onSliderInput, 16));
  }

  /* ── Canvas drag to reposition circle centre ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!originalImg) return;
    dragging = true;
    dragStart = getCanvasCoords(e);
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!dragging || !originalImg) return;
    const pos = getCanvasCoords(e);
    offsetX += pos.x - dragStart.x;
    offsetY += pos.y - dragStart.y;
    dragStart = pos;
    processImage();
  });

  canvas.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = ''; });
  canvas.addEventListener('mouseleave', () => { dragging = false; canvas.style.cursor = ''; });

  /* ── Download: apply circle mask to produce transparent PNG ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    const pct = parseInt(circleSizeSlider?.value, 10) / 100;
    const size = Math.min(canvas.width, canvas.height);
    const radius = (size * pct) / 2;
    const cx = canvas.width / 2 + offsetX;
    const cy = canvas.height / 2 + offsetY;

    const out = Utils.createCanvas(canvas.width, canvas.height);
    const outCtx = out.getContext('2d');
    /* Draw original image */
    outCtx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    /* Erase outside circle */
    outCtx.save();
    outCtx.globalCompositeOperation = 'destination-in';
    outCtx.beginPath();
    outCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    outCtx.fill();
    outCtx.restore();
    Utils.downloadCanvas(out, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (circleSizeSlider) circleSizeSlider.value = 80;
    if (circleSizeValue) circleSizeValue.textContent = '80%';
    offsetX = 0;
    offsetY = 0;
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
