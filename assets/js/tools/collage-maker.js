/**
 * Collage Maker — Combine multiple photos into a collage
 * Controls: select#collageLayout (0-6), range#collageGap (0-20, default 8),
 *           color#collageBg (default #ffffff)
 * Layouts: 2 Side by Side, 2 Stacked, 3 (1L+2S), 4 Grid,
 *          4 (1L+3S), 6 Grid 2x3, 9 Grid 3x3
 * Allows adding multiple images; arranges in selected layout.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const layoutSelect = document.getElementById('collageLayout');
  const gapSlider = document.getElementById('collageGap');
  const gapValue = document.getElementById('collageGap-value');
  const bgInput = document.getElementById('collageBg');

  let loadedImages = []; // Array of HTMLImageElement
  let originalFilename = 'collage';

  /* ── Layout definitions: array of { x, y, w, h } as fractions of canvas ── */
  const LAYOUTS = [
    // 0: 2 Side by Side
    [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
    // 1: 2 Stacked
    [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ],
    // 2: 3 Photos (1 Large + 2 Small)
    [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    // 3: 4 Photos Grid
    [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    // 4: 4 Photos (1 Large + 3 Small)
    [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.3333 },
      { x: 0.5, y: 0.3333, w: 0.5, h: 0.3333 },
      { x: 0.5, y: 0.6667, w: 0.5, h: 0.3333 },
    ],
    // 5: 6 Photos Grid 2x3
    [
      { x: 0, y: 0, w: 0.5, h: 0.3333 },
      { x: 0.5, y: 0, w: 0.5, h: 0.3333 },
      { x: 0, y: 0.3333, w: 0.5, h: 0.3333 },
      { x: 0.5, y: 0.3333, w: 0.5, h: 0.3333 },
      { x: 0, y: 0.6667, w: 0.5, h: 0.3333 },
      { x: 0.5, y: 0.6667, w: 0.5, h: 0.3333 },
    ],
    // 6: 9 Photos Grid 3x3
    [
      { x: 0, y: 0, w: 0.3333, h: 0.3333 },
      { x: 0.3333, y: 0, w: 0.3333, h: 0.3333 },
      { x: 0.6667, y: 0, w: 0.3333, h: 0.3333 },
      { x: 0, y: 0.3333, w: 0.3333, h: 0.3333 },
      { x: 0.3333, y: 0.3333, w: 0.3333, h: 0.3333 },
      { x: 0.6667, y: 0.3333, w: 0.3333, h: 0.3333 },
      { x: 0, y: 0.6667, w: 0.3333, h: 0.3333 },
      { x: 0.3333, y: 0.6667, w: 0.3333, h: 0.3333 },
      { x: 0.6667, y: 0.6667, w: 0.3333, h: 0.3333 },
    ],
  ];

  /* ── Handle first file upload ── */
  function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    addImageToCollage(file);
  }

  function addImageToCollage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        loadedImages.push(img);
        if (loadedImages.length === 1) {
          zone.style.display = 'none';
          document.getElementById('tool-workspace').classList.add('active');
        }
        buildCollage();
        Utils.showToast(`Image ${loadedImages.length} added!`, 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.multiple = true;
      input.addEventListener('change', (e) => {
        Array.from(e.target.files).forEach((f) => addImageToCollage(f));
      });
    }
  }

  /* ── Build the collage on canvas ── */
  function buildCollage() {
    const layoutIdx = parseInt(layoutSelect?.value, 10) || 0;
    const layout = LAYOUTS[layoutIdx] || LAYOUTS[0];
    const gap = parseInt(gapSlider?.value, 10) || 8;
    const bgColor = bgInput?.value || '#ffffff';

    /* Canvas dimensions: use 1200x1200 as base */
    const W = 1200;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    /* Fill background */
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    /* Draw each slot */
    layout.forEach((slot, i) => {
      const sx = slot.x * W + gap;
      const sy = slot.y * H + gap;
      const sw = slot.w * W - gap * 2;
      const sh = slot.h * H - gap * 2;
      if (sw <= 0 || sh <= 0) return;

      /* Draw slot background */
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(sx, sy, sw, sh);

      if (i < loadedImages.length) {
        /* Cover-fit the image into the slot */
        drawImageCover(loadedImages[i], sx, sy, sw, sh);
      } else {
        /* Placeholder */
        ctx.fillStyle = '#bbb';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Photo ${i + 1}`, sx + sw / 2, sy + sh / 2);
      }
    });
  }

  /* ── Draw image using "cover" mode (fill slot, crop overflow) ── */
  function drawImageCover(img, x, y, w, h) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const slotRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > slotRatio) {
      /* Image is wider: crop sides */
      sh = h;
      sw = h * imgRatio;
      sx = x - (sw - w) / 2;
      sy = y;
    } else {
      /* Image is taller: crop top/bottom */
      sw = w;
      sh = w / imgRatio;
      sx = x;
      sy = y - (sh - h) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();
  }

  /* ── Control listeners ── */
  layoutSelect?.addEventListener('change', buildCollage);
  gapSlider?.addEventListener('input', Utils.debounce(() => {
    if (gapValue) gapValue.textContent = gapSlider.value + 'px';
    buildCollage();
  }, 50));
  bgInput?.addEventListener('input', Utils.debounce(buildCollage, 100));

  /* ── Add more images button (dynamic) ── */
  function addAddMoreButton() {
    const existing = document.getElementById('add-more-btn');
    if (existing) return;
    const btn = document.createElement('button');
    btn.id = 'add-more-btn';
    btn.className = 'btn btn-secondary';
    btn.textContent = '+ Add More Images';
    btn.style.marginTop = '8px';
    btn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.addEventListener('change', (e) => {
        Array.from(e.target.files).forEach((f) => addImageToCollage(f));
      });
      input.click();
    });
    const actions = document.querySelector('.tool-actions');
    if (actions) actions.parentNode.insertBefore(btn, actions);
  }
  addAddMoreButton();

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (loadedImages.length === 0) {
      Utils.showToast('Add images first', 'error');
      return;
    }
    buildCollage();
    Utils.downloadCanvas(canvas, originalFilename + '_collage', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    loadedImages = [];
    if (gapSlider) gapSlider.value = 8;
    if (gapValue) gapValue.textContent = '8px';
    if (layoutSelect) layoutSelect.value = '0';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
  });

  /* ── Clipboard paste ── */
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        addImageToCollage(item.getAsFile());
        break;
      }
    }
  });
});
