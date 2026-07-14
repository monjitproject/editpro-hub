/**
 * Photo Grid Layout — Arrange multiple images in grid patterns
 * Controls: select#gridLayout (5 options), range#gridSpacing (0-30, default:8),
 *           color#gridBgColor (#ffffff)
 * Accepts multiple images, arranges in selected layout pattern.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const gridLayout = document.getElementById('gridLayout');
  const gridSpacing = document.getElementById('gridSpacing');
  const gridBgColor = document.getElementById('gridBgColor');

  let loadedImages = [];
  let originalFilename = 'grid';

  /* ── Layout configurations ── */
  /* Each layout: array of {x, y, w, h} as fractions of canvas (0-1) */
  const LAYOUTS = {
    '2x1': { cols: 2, rows: 1, slots: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 }
    ]},
    '2x2': { cols: 2, rows: 2, slots: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ]},
    '3x2': { cols: 3, rows: 2, slots: [
      { x: 0, y: 0, w: 0.3333, h: 0.5 },
      { x: 0.3333, y: 0, w: 0.3333, h: 0.5 },
      { x: 0.6666, y: 0, w: 0.3334, h: 0.5 },
      { x: 0, y: 0.5, w: 0.3333, h: 0.5 },
      { x: 0.3333, y: 0.5, w: 0.3333, h: 0.5 },
      { x: 0.6666, y: 0.5, w: 0.3334, h: 0.5 }
    ]},
    '1+2': { cols: 2, rows: 2, slots: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ]},
    'featured': { cols: 3, rows: 3, slots: [
      { x: 0, y: 0, w: 0.6666, h: 0.6666 },
      { x: 0.6666, y: 0, w: 0.3334, h: 0.3333 },
      { x: 0.6666, y: 0.3333, w: 0.3334, h: 0.3333 },
      { x: 0, y: 0.6666, w: 0.3333, h: 0.3334 },
      { x: 0.3333, y: 0.6666, w: 0.3333, h: 0.3334 },
      { x: 0.6666, y: 0.6666, w: 0.3334, h: 0.3334 }
    ]}
  };

  /* ── Multi-file upload ── */
  if (zone) {
    Utils.setupDragDrop(zone, handleFiles);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.multiple = true;
      input.addEventListener('change', e => {
        if (e.target.files.length > 0) handleFiles(Array.from(e.target.files));
      });
    }
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      Utils.showToast('Please select valid image files', 'error');
      return;
    }

    /* Load all images */
    loadedImages = [];
    for (const file of validFiles) {
      try {
        const img = await Utils.loadImage(file);
        loadedImages.push(img);
      } catch (e) {
        /* Skip failed images */
      }
    }

    if (loadedImages.length === 0) {
      Utils.showToast('Failed to load images', 'error');
      return;
    }

    originalFilename = validFiles[0].name.replace(/\.[^.]+$/, '') + '_grid';
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    buildGrid();
  }

  /* ── Build grid layout ── */
  function buildGrid() {
    if (loadedImages.length === 0) return;

    const layoutKey = gridLayout ? gridLayout.value : '2x2';
    const spacing = gridSpacing ? parseInt(gridSpacing.value, 10) : 8;
    const bgColor = gridBgColor ? gridBgColor.value : '#ffffff';

    const layout = LAYOUTS[layoutKey] || LAYOUTS['2x2'];
    const slotCount = layout.slots.length;

    /* Determine canvas size based on first image */
    const firstImg = loadedImages[0];
    const aspectRatio = firstImg.naturalWidth / firstImg.naturalHeight;

    /* Make grid roughly 1200px wide */
    const totalW = 1200;
    const totalH = Math.round(totalW / aspectRatio);

    canvas.width = totalW;
    canvas.height = totalH;

    /* Fill background */
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    /* Draw images into slots */
    layout.slots.forEach((slot, i) => {
      if (i >= loadedImages.length) return;

      const img = loadedImages[i];
      const x = slot.x * totalW + spacing;
      const y = slot.y * totalH + spacing;
      const w = slot.w * totalW - spacing * 2;
      const h = slot.h * totalH - spacing * 2;

      if (w <= 0 || h <= 0) return;

      /* Cover-fit the image into the slot */
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const slotAspect = w / h;
      let sx, sy, sw, sh;

      if (imgAspect > slotAspect) {
        /* Image is wider: crop sides */
        sh = img.naturalHeight;
        sw = sh * slotAspect;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        /* Image is taller: crop top/bottom */
        sw = img.naturalWidth;
        sh = sw / slotAspect;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    });

    /* Fill unused slots with gray */
    for (let i = loadedImages.length; i < slotCount; i++) {
      const slot = layout.slots[i];
      const x = slot.x * totalW + spacing;
      const y = slot.y * totalH + spacing;
      const w = slot.w * totalW - spacing * 2;
      const h = slot.h * totalH - spacing * 2;
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty slot', x + w / 2, y + h / 2);
    }
  }

  /* ── Live update on control changes ── */
  [gridLayout, gridSpacing, gridBgColor].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        clearTimeout(window._gridTimer);
        window._gridTimer = setTimeout(buildGrid, 150);
      });
      el.addEventListener('change', buildGrid);
    }
  });

  /* ── Add more images button ── */
  const addMoreBtn = document.getElementById('add-images-btn');
  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.addEventListener('change', async e => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            try {
              const img = await Utils.loadImage(file);
              loadedImages.push(img);
            } catch (err) { /* skip */ }
          }
        }
        if (loadedImages.length > 0) buildGrid();
      });
      fileInput.click();
    });
  }

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (loadedImages.length === 0) {
      Utils.showToast('Add images first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (gridLayout) gridLayout.value = '2x2';
    if (gridSpacing) gridSpacing.value = '8';
    if (gridBgColor) gridBgColor.value = '#ffffff';
    loadedImages = [];
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
  });

  /* ── Clipboard paste ── */
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFiles([item.getAsFile()]);
        break;
      }
    }
  });
});
