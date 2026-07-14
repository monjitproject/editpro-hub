/**
 * Banner/Cover Photo Resizer — Resize banners with safe zone guides
 * Controls: select#bannerType (0-5)
 * Types: YouTube Channel Art (2560x1440), YouTube Thumbnail (1280x720),
 *   Facebook Cover (820x312), Twitter Header (1500x500),
 *   LinkedIn Cover (1584x396), Twitch Banner (1200x480)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const bannerSelect = document.getElementById('bannerType');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Banner type dimensions and safe zones ── */
  const BANNERS = [
    { name: 'YouTube Channel Art', w: 2560, h: 1440, safe: { x: 423, y: 400, w: 1714, h: 640 } },
    { name: 'YouTube Thumbnail',   w: 1280, h: 720,  safe: null },
    { name: 'Facebook Cover',      w: 820,  h: 312,  safe: { x: 170, y: 28, w: 480, h: 256 } },
    { name: 'Twitter Header',      w: 1500, h: 500,  safe: { x: 300, y: 100, w: 900, h: 300 } },
    { name: 'LinkedIn Cover',      w: 1584, h: 396,  safe: { x: 396, y: 48, w: 792, h: 300 } },
    { name: 'Twitch Banner',       w: 1200, h: 480,  safe: { x: 200, y: 60, w: 800, h: 360 } },
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

  function updateCrop() {
    if (!originalImg) return;
    const banner = BANNERS[parseInt(bannerSelect?.value, 10) || 0] || BANNERS[0];
    const targetRatio = banner.w / banner.h;
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

  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    drawOverlay();
  }

  function drawOverlay() {
    const banner = BANNERS[parseInt(bannerSelect?.value, 10) || 0] || BANNERS[0];
    ctx.save();
    /* Dim outside crop */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, crop.y);
    ctx.fillRect(0, crop.y + crop.h, canvas.width, canvas.height - crop.y - crop.h);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, canvas.width - crop.x - crop.w, crop.h);
    /* Crop border */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    /* Safe zone guide (mapped to crop coordinates) */
    if (banner.safe) {
      const scaleX = crop.w / banner.w;
      const scaleY = crop.h / banner.h;
      const sx = crop.x + banner.safe.x * scaleX;
      const sy = crop.y + banner.safe.y * scaleY;
      const sw = banner.safe.w * scaleX;
      const sh = banner.safe.h * scaleY;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, sw, sh);
      /* Label */
      ctx.setLineDash([]);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
      ctx.fillText('Safe Zone', sx + 4, sy - 4);
    }

    /* Banner type label */
    ctx.setLineDash([]);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const text = `${banner.name} (${banner.w}x${banner.h})`;
    const tm = ctx.measureText(text);
    ctx.fillRect(crop.x + 4, crop.y + 4, tm.width + 12, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, crop.x + 10, crop.y + 18);
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

  bannerSelect?.addEventListener('change', () => { updateCrop(); processImage(); });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    const banner = BANNERS[parseInt(bannerSelect?.value, 10) || 0] || BANNERS[0];
    const cropped = Utils.cropCanvas(canvas, crop.x, crop.y, crop.w, crop.h);
    const resized = Utils.resizeCanvas(cropped, banner.w, banner.h);
    const fname = originalFilename + '_' + banner.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    Utils.downloadCanvas(resized, fname, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (bannerSelect) bannerSelect.value = '0';
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
