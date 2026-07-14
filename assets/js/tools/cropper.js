/**
 * Cropper Tool — Freeform image cropping
 * Supports numeric input (X, Y, W, H) and click-drag on canvas
 * to define crop area visually.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  let originalImg = null;
  let originalFilename = 'image';

  /* ── Crop state ── */
  let crop = { x: 0, y: 0, w: 100, h: 100 };
  let dragging = false;
  let dragStart = { x: 0, y: 0 };

  /* ── Control references ── */
  const cropX = document.getElementById('cropX');
  const cropY = document.getElementById('cropY');
  const cropW = document.getElementById('cropW');
  const cropH = document.getElementById('cropH');

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
        /* Initialise crop to full image */
        crop = { x: 0, y: 0, w: canvas.width, h: canvas.height };
        syncInputsFromCrop();
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

  /* ── Sync crop state -> numeric inputs ── */
  function syncInputsFromCrop() {
    if (cropX) cropX.value = Math.round(crop.x);
    if (cropY) cropY.value = Math.round(crop.y);
    if (cropW) cropW.value = Math.round(crop.w);
    if (cropH) cropH.value = Math.round(crop.h);
  }

  /* ── Sync numeric inputs -> crop state ── */
  function syncCropFromInputs() {
    crop.x = parseInt(cropX.value, 10) || 0;
    crop.y = parseInt(cropY.value, 10) || 0;
    crop.w = parseInt(cropW.value, 10) || 100;
    crop.h = parseInt(cropH.value, 10) || 100;
    /* Clamp within image bounds */
    clampCrop();
  }

  function clampCrop() {
    if (!originalImg) return;
    crop.x = Math.max(0, Math.min(crop.x, canvas.width - 1));
    crop.y = Math.max(0, Math.min(crop.y, canvas.height - 1));
    crop.w = Math.max(1, Math.min(crop.w, canvas.width - crop.x));
    crop.h = Math.max(1, Math.min(crop.h, canvas.height - crop.y));
  }

  /* ── Draw original + crop overlay ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    drawCropOverlay();
  }

  function drawCropOverlay() {
    /* Dim area outside crop */
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    /* Top strip */
    ctx.fillRect(0, 0, canvas.width, crop.y);
    /* Bottom strip */
    ctx.fillRect(0, crop.y + crop.h, canvas.width, canvas.height - crop.y - crop.h);
    /* Left strip */
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    /* Right strip */
    ctx.fillRect(crop.x + crop.w, crop.y, canvas.width - crop.x - crop.w, crop.h);
    /* Crop border */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    /* Corner handles */
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    const hs = 6;
    [
      [crop.x, crop.y],
      [crop.x + crop.w, crop.y],
      [crop.x, crop.y + crop.h],
      [crop.x + crop.w, crop.y + crop.h]
    ].forEach(([hx, hy]) => {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
    ctx.restore();
  }

  /* ── Canvas mouse interaction for drag-to-crop ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!originalImg) return;
    dragging = true;
    const pos = getCanvasCoords(e);
    dragStart = pos;
    crop.x = pos.x;
    crop.y = pos.y;
    crop.w = 0;
    crop.h = 0;
    syncInputsFromCrop();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!dragging || !originalImg) return;
    const pos = getCanvasCoords(e);
    crop.x = Math.max(0, Math.min(dragStart.x, pos.x));
    crop.y = Math.max(0, Math.min(dragStart.y, pos.y));
    crop.w = Math.abs(pos.x - dragStart.x);
    crop.h = Math.abs(pos.y - dragStart.y);
    /* Clamp to image */
    crop.w = Math.min(crop.w, canvas.width - crop.x);
    crop.h = Math.min(crop.h, canvas.height - crop.y);
    syncInputsFromCrop();
    processImage();
  });

  canvas.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { dragging = false; });

  /* ── Control listeners ── */
  const onInputChange = Utils.debounce(() => {
    syncCropFromInputs();
    processImage();
  }, 50);

  [cropX, cropY, cropW, cropH].forEach((el) => {
    if (el) el.addEventListener('input', onInputChange);
  });

  /* ── Download: crop and save ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    clampCrop();
    syncInputsFromCrop();
    const cropped = Utils.cropCanvas(canvas, crop.x, crop.y, crop.w, crop.h);
    Utils.downloadCanvas(cropped, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (originalImg) {
      crop = { x: 0, y: 0, w: canvas.width, h: canvas.height };
      syncInputsFromCrop();
      processImage();
      Utils.showToast('Crop reset to full image', 'info');
    }
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
