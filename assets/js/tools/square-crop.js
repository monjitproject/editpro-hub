/**
 * Square Crop Tool — Crop to a perfect 1:1 square
 * Controls: number#outputSize (default 512)
 * Center a square crop area; allow drag to reposition.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const outputSizeInput = document.getElementById('outputSize');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Crop area (in original-image coordinates) ── */
  let crop = { x: 0, y: 0, size: 0 };
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  /* ── Upload handling ── */
  function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        initCrop();
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

  /* ── Initialise crop: largest centred square that fits ── */
  function initCrop() {
    if (!originalImg) return;
    const size = Math.min(canvas.width, canvas.height);
    crop.size = size;
    crop.x = (canvas.width - size) / 2;
    crop.y = (canvas.height - size) / 2;
    if (outputSizeInput) outputSizeInput.value = size;
  }

  function clampCrop() {
    crop.size = Math.max(1, Math.min(crop.size, canvas.width, canvas.height));
    crop.x = Math.max(0, Math.min(crop.x, canvas.width - crop.size));
    crop.y = Math.max(0, Math.min(crop.y, canvas.height - crop.size));
  }

  /* ── Draw preview with overlay ── */
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
    ctx.fillRect(0, crop.y + crop.size, canvas.width, canvas.height - crop.y - crop.size);
    ctx.fillRect(0, crop.y, crop.x, crop.size);
    ctx.fillRect(crop.x + crop.size, crop.y, canvas.width - crop.x - crop.size, crop.size);
    /* Border */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.size, crop.size);
    /* Rule-of-thirds lines */
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    for (let i = 1; i <= 2; i++) {
      const off = (crop.size / 3) * i;
      ctx.beginPath();
      ctx.moveTo(crop.x + off, crop.y);
      ctx.lineTo(crop.x + off, crop.y + crop.size);
      ctx.moveTo(crop.x, crop.y + off);
      ctx.lineTo(crop.x + crop.size, crop.y + off);
      ctx.stroke();
    }
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
    if (pos.x >= crop.x && pos.x <= crop.x + crop.size &&
        pos.y >= crop.y && pos.y <= crop.y + crop.size) {
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

  /* ── Output size control changes the preview crop size ── */
  if (outputSizeInput) {
    outputSizeInput.addEventListener('input', Utils.debounce(() => {
      if (!originalImg) return;
      /* Interpret outputSize as the desired crop size relative to the image */
      const val = parseInt(outputSizeInput.value, 10);
      if (val > 0) {
        /* Use value as pixel size in the output; keep the preview crop centred */
        crop.size = Math.min(val, canvas.width, canvas.height);
        crop.x = (canvas.width - crop.size) / 2;
        crop.y = (canvas.height - crop.size) / 2;
        processImage();
      }
    }, 100));
  }

  /* ── Download: crop to square and resize to outputSize ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    const outSize = parseInt(outputSizeInput?.value, 10) || crop.size;
    const cropped = Utils.cropCanvas(canvas, crop.x, crop.y, crop.size, crop.size);
    const resized = Utils.resizeCanvas(cropped, outSize, outSize);
    Utils.downloadCanvas(resized, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
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
