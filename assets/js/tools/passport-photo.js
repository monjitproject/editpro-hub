/**
 * Passport Photo Maker — Crop to passport dimensions with solid background
 * Controls: select#country (0-5: US, UK, India, Canada, Australia, EU),
 *           color#bgColor (default #ffffff)
 * Crops to passport aspect ratio, adds solid background colour.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const countrySelect = document.getElementById('country');
  const bgColorInput = document.getElementById('bgColor');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Country passport specs (width:height ratio) ── */
  const SPECS = [
    { name: 'US (2x2")',    ratio: 1,     dpmm: 300 / 25.4 }, // 1:1, ~12 dpmm
    { name: 'UK (35x45mm)', ratio: 35 / 45, dpmm: 300 / 25.4 },
    { name: 'India (35x45mm)', ratio: 35 / 45, dpmm: 300 / 25.4 },
    { name: 'Canada (50x70mm)', ratio: 50 / 70, dpmm: 300 / 25.4 },
    { name: 'Australia (35x45mm)', ratio: 35 / 45, dpmm: 300 / 25.4 },
    { name: 'EU (35x45mm)', ratio: 35 / 45, dpmm: 300 / 25.4 },
  ];

  let crop = { x: 0, y: 0, w: 0, h: 0 };
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
        updateCrop();
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

  /* ── Calculate crop area from selected country ratio ── */
  function updateCrop() {
    if (!originalImg) return;
    const spec = SPECS[parseInt(countrySelect?.value, 10) || 0] || SPECS[0];
    const targetRatio = spec.ratio; // w/h
    const imgRatio = canvas.width / canvas.height;
    let cw, ch;
    if (imgRatio > targetRatio) {
      ch = canvas.height;
      cw = ch * targetRatio;
    } else {
      cw = canvas.width;
      ch = cw / targetRatio;
    }
    crop.w = cw;
    crop.h = ch;
    crop.x = (canvas.width - cw) / 2;
    crop.y = (canvas.height - ch) / 2;
  }

  function clampCrop() {
    crop.x = Math.max(0, Math.min(crop.x, canvas.width - crop.w));
    crop.y = Math.max(0, Math.min(crop.y, canvas.height - crop.h));
  }

  /* ── Draw preview with overlay ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    /* Dim outside crop */
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, crop.y);
    ctx.fillRect(0, crop.y + crop.h, canvas.width, canvas.height - crop.y - crop.h);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, canvas.width - crop.x - crop.w, crop.h);

    /* Passport outline */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    /* Face-centre guide (horizontal line at ~37% from top for headroom) */
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
    ctx.lineWidth = 1;
    const guideY = crop.y + crop.h * 0.37;
    ctx.beginPath();
    ctx.moveTo(crop.x, guideY);
    ctx.lineTo(crop.x + crop.w, guideY);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Canvas drag to reposition ── */
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

  /* ── Country change ── */
  countrySelect?.addEventListener('change', () => {
    updateCrop();
    processImage();
  });

  /* ── Download: crop + add background colour ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    const spec = SPECS[parseInt(countrySelect?.value, 10) || 0] || SPECS[0];
    /* Output at passport-spec resolution */
    const outW = Math.round(spec.ratio * 600);  // e.g. 600px height equivalent
    const outH = Math.round(outW / spec.ratio);
    const cropped = Utils.cropCanvas(canvas, crop.x, crop.y, crop.w, crop.h);
    const resized = Utils.resizeCanvas(cropped, outW, outH);
    /* Composite on background colour */
    const out = Utils.createCanvas(outW, outH);
    const outCtx = out.getContext('2d');
    outCtx.fillStyle = bgColorInput?.value || '#ffffff';
    outCtx.fillRect(0, 0, outW, outH);
    outCtx.drawImage(resized, 0, 0, outW, outH);
    Utils.downloadCanvas(out, originalFilename + '_passport', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (countrySelect) countrySelect.value = '0';
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
