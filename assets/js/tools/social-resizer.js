/**
 * Social Media Resizer — Resize images for social media platforms
 * Controls: select#platform (0-8)
 * Platforms: Instagram Post (1080x1080), Instagram Story (1080x1920),
 *   Instagram Reel (1080x1920), Facebook Post (1200x630), Facebook Cover (820x312),
 *   Twitter Post (1200x675), LinkedIn Post (1200x627), Pinterest Pin (1000x1500),
 *   YouTube Thumbnail (1280x720)
 * Shows crop overlay matching target aspect ratio.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const platformSelect = document.getElementById('platform');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Platform dimensions ── */
  const PLATFORMS = [
    { name: 'Instagram Post',       w: 1080, h: 1080 },
    { name: 'Instagram Story',      w: 1080, h: 1920 },
    { name: 'Instagram Reel',       w: 1080, h: 1920 },
    { name: 'Facebook Post',        w: 1200, h: 630 },
    { name: 'Facebook Cover',       w: 820,  h: 312 },
    { name: 'Twitter Post',         w: 1200, h: 675 },
    { name: 'LinkedIn Post',        w: 1200, h: 627 },
    { name: 'Pinterest Pin',        w: 1000, h: 1500 },
    { name: 'YouTube Thumbnail',    w: 1280, h: 720 },
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

  /* ── Calculate crop area from selected platform aspect ratio ── */
  function updateCrop() {
    if (!originalImg) return;
    const plat = PLATFORMS[parseInt(platformSelect?.value, 10) || 0] || PLATFORMS[0];
    const targetRatio = plat.w / plat.h;
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
    /* Platform label */
    ctx.setLineDash([]);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const plat = PLATFORMS[parseInt(platformSelect?.value, 10) || 0] || PLATFORMS[0];
    const text = `${plat.name} (${plat.w}x${plat.h})`;
    const tm = ctx.measureText(text);
    ctx.fillRect(crop.x + 4, crop.y + 4, tm.width + 12, 22);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, crop.x + 10, crop.y + 20);
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

  /* ── Platform change ── */
  platformSelect?.addEventListener('change', () => {
    updateCrop();
    processImage();
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    const plat = PLATFORMS[parseInt(platformSelect?.value, 10) || 0] || PLATFORMS[0];
    const cropped = Utils.cropCanvas(canvas, crop.x, crop.y, crop.w, crop.h);
    const resized = Utils.resizeCanvas(cropped, plat.w, plat.h);
    const fname = originalFilename + '_' + plat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    Utils.downloadCanvas(resized, fname, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (platformSelect) platformSelect.value = '0';
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
