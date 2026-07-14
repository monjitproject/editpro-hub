/**
 * Bulk Image Resizer — Resize multiple images at once
 * Controls: number#bulkWidth (default 800), number#bulkHeight (default 600),
 *           checkbox#bulkLockAspect
 * Accepts multiple files; process all; individual download buttons.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const bulkWidthInput = document.getElementById('bulkWidth');
  const bulkHeightInput = document.getElementById('bulkHeight');
  const lockAspectCheck = document.getElementById('bulkLockAspect');
  let originalFilename = 'image';
  let bulkImages = []; // { name, img, resultCanvas }

  /* ── Accept multiple files via zone click (override input) ── */
  function handleFiles(files) {
    if (!files || files.length === 0) return;
    bulkImages = [];
    let loadCount = 0;
    const total = Math.min(files.length, 20);
    for (let i = 0; i < total; i++) {
      const file = files[i];
      if (!Utils.validateImageFile(file)) continue;
      const fname = file.name.replace(/\.[^.]+$/, '');
      const reader = new FileReader();
      reader.onload = (e) => {
        Utils.loadImage(e.target.result).then((img) => {
          bulkImages.push({ name: fname, img, resultCanvas: null });
          loadCount++;
          if (loadCount === total) {
            processAll();
            zone.style.display = 'none';
            document.getElementById('tool-workspace').classList.add('active');
            showTileGrid();
            Utils.showToast(`${bulkImages.length} images loaded!`, 'success');
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFile(file) {
    /* Single file fallback — wrapped as array */
    handleFiles([file]);
  }

  if (zone) {
    /* Override drag-drop to handle multiple files */
    zone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); zone.classList.remove('dragover'); });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.multiple = true;
      input.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFiles(e.target.files); });
    }
  }

  /* ── Resize all images ── */
  function processAll() {
    const w = parseInt(bulkWidthInput?.value, 10) || 800;
    const h = parseInt(bulkHeightInput?.value, 10) || 600;
    bulkImages.forEach((item) => {
      const srcCanvas = Utils.imageToCanvas(item.img);
      item.resultCanvas = Utils.resizeCanvas(srcCanvas, w, h);
    });
  }

  /* ── Show tiled preview on the main canvas ── */
  function showTileGrid() {
    if (bulkImages.length === 0) return;
    const cols = Math.ceil(Math.sqrt(bulkImages.length));
    const rows = Math.ceil(bulkImages.length / cols);
    const thumbSize = 200;
    canvas.width = cols * thumbSize;
    canvas.height = rows * thumbSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bulkImages.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = col * thumbSize;
      const ty = row * thumbSize;
      if (item.resultCanvas) {
        ctx.drawImage(item.resultCanvas, tx + 4, ty + 4, thumbSize - 8, thumbSize - 8);
      }
      /* Label */
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(tx + 4, ty + thumbSize - 28, thumbSize - 8, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.fillText(item.name, tx + 8, ty + thumbSize - 10);
    });
  }

  /* ── Aspect lock ── */
  if (bulkWidthInput && bulkHeightInput) {
    let lockRatio = null;
    bulkWidthInput.addEventListener('input', () => {
      if (lockAspectCheck?.checked && lockRatio) {
        bulkHeightInput.value = Math.round(parseInt(bulkWidthInput.value, 10) / lockRatio);
      }
    });
    bulkHeightInput.addEventListener('input', () => {
      if (lockAspectCheck?.checked && lockRatio) {
        bulkWidthInput.value = Math.round(parseInt(bulkHeightInput.value, 10) * lockRatio);
      }
    });
    lockAspectCheck?.addEventListener('change', () => {
      if (lockAspectCheck.checked && bulkImages.length > 0) {
        const first = bulkImages[0].img;
        lockRatio = first.naturalWidth / first.naturalHeight;
      }
    });
  }

  /* ── Dimension changes reprocess ── */
  const reprocessAll = Utils.debounce(() => {
    if (bulkImages.length > 0) {
      processAll();
      showTileGrid();
    }
  }, 200);
  bulkWidthInput?.addEventListener('input', reprocessAll);
  bulkHeightInput?.addEventListener('input', reprocessAll);

  /* ── Download: each image individually ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (bulkImages.length === 0) {
      Utils.showToast('No images loaded', 'error');
      return;
    }
    bulkImages.forEach((item, i) => {
      if (item.resultCanvas) {
        setTimeout(() => {
          Utils.downloadCanvas(item.resultCanvas, item.name || ('image_' + (i + 1)), 'png');
        }, i * 200);
      }
    });
    Utils.showToast(`Downloading ${bulkImages.length} images...`, 'success');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    bulkImages = [];
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
  });

  /* ── Clipboard paste (single image) ── */
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
