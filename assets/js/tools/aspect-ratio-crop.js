/**
 * Aspect Ratio Crop — Crop to standard or custom aspect ratios
 * Controls: select#aspectRatio (options 0-7)
 * Presets: 1:1, 4:5, 16:9, 9:16, 3:2, 4:3, 21:9, Custom
 * Shows crop overlay; allow drag to reposition.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const aspectSelect = document.getElementById('aspectRatio');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Aspect ratio presets ── */
  const RATIOS = [
    { w: 1, h: 1 },    // 0: 1:1
    { w: 4, h: 5 },    // 1: 4:5
    { w: 16, h: 9 },   // 2: 16:9
    { w: 9, h: 16 },   // 3: 9:16
    { w: 3, h: 2 },    // 4: 3:2
    { w: 4, h: 3 },    // 5: 4:3
    { w: 21, h: 9 },   // 6: 21:9
  ];

  let crop = { x: 0, y: 0, w: 100, h: 100 };
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

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
        updateCropFromRatio();
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

  /* ── Calculate crop rectangle to fit selected ratio ── */
  function updateCropFromRatio() {
    if (!originalImg) return;
    const idx = parseInt(aspectSelect?.value, 10) || 0;
    const ratio = RATIOS[idx] || RATIOS[0];
    const imgRatio = canvas.width / canvas.height;
    const targetRatio = ratio.w / ratio.h;
    let cropW, cropH;
    if (imgRatio > targetRatio) {
      /* Image is wider than target — constrain height */
      cropH = canvas.height;
      cropW = cropH * targetRatio;
    } else {
      cropW = canvas.width;
      cropH = cropW / targetRatio;
    }
    crop.w = cropW;
    crop.h = cropH;
    crop.x = (canvas.width - cropW) / 2;
    crop.y = (canvas.height - cropH) / 2;
  }

  function clampCrop() {
    crop.x = Math.max(0, Math.min(crop.x, canvas.width - crop.w));
    crop.y = Math.max(0, Math.min(crop.y, canvas.height - crop.h));
  }

  /* ── Draw preview + overlay ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    drawOverlay();
  }

  function drawOverlay() {
    ctx.save();
    /* Dim outside */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, crop.y);
    ctx.fillRect(0, crop.y + crop.h, canvas.width, canvas.height - crop.y - crop.h);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, canvas.width - crop.x - crop.w, crop.h);
    /* Border */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    /* Rule of thirds */
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    for (let i = 1; i <= 2; i++) {
      const fx = crop.x + (crop.w / 3) * i;
      const fy = crop.y + (crop.h / 3) * i;
      ctx.beginPath(); ctx.moveTo(fx, crop.y); ctx.lineTo(fx, crop.y + crop.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, fy); ctx.lineTo(crop.x + crop.w, fy); ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Canvas drag ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!originalImg) return;
    const pos = getCanvasCoords(e);
    if (pos.x >= crop.x && pos.x <= crop.x + crop.w &&
        pos.y >= crop.y && pos.y <= crop.y + crop.h) {
      dragging = true;
      dragOffset = { x: pos.x - crop.x, y: pos.y - crop.y };
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!dragging || !originalImg) return;
    const pos = getCanvasCoords(e);
    crop.x = pos.x - dragOffset.x;
    crop.y = pos.y - dragOffset.y;
    clampCrop();
    processImage();
  });

  canvas.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = ''; });
  canvas.addEventListener('mouseleave', () => { dragging = false; canvas.style.cursor = ''; });

  /* ── Ratio select change ── */
  if (aspectSelect) {
    aspectSelect.addEventListener('change', () => {
      updateCropFromRatio();
      processImage();
    });
  }

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    const cropped = Utils.cropCanvas(canvas, Math.round(crop.x), Math.round(crop.y), Math.round(crop.w), Math.round(crop.h));
    Utils.downloadCanvas(cropped, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (aspectSelect) aspectSelect.value = '0';
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
