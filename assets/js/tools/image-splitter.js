/**
 * Image Splitter — Split image into tiles for social media grid posts
 * Controls: number#splitCols (default 3), number#splitRows (default 3)
 * Similar to grid-cutter but focused on social media grid posts.
 * Shows numbered tile overlay; provides individual tile download buttons.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const colsInput = document.getElementById('splitCols');
  const rowsInput = document.getElementById('splitRows');
  let originalImg = null;
  let originalFilename = 'image';
  let tileCanvases = []; // flat array of canvas tiles, in reading order (left->right, top->bottom)

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

  /* ── Process: draw image + grid overlay + generate tiles ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const cols = Math.max(1, parseInt(colsInput?.value, 10) || 3);
    const rows = Math.max(1, parseInt(rowsInput?.value, 10) || 3);
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    /* Generate tiles */
    tileCanvases = [];
    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = Utils.cropCanvas(canvas, c * tileW, r * tileH, tileW, tileH);
        tileCanvases.push({ canvas: tile, row: r, col: c, index: idx });
        idx++;
      }
    }

    /* Draw grid overlay */
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(Math.round(c * tileW), 0);
      ctx.lineTo(Math.round(c * tileW), canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.round(r * tileH));
      ctx.lineTo(canvas.width, Math.round(r * tileH));
      ctx.stroke();
    }

    /* Numbered labels */
    ctx.setLineDash([]);
    const fontSize = Math.max(14, Math.min(28, tileW / 5));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    tileCanvases.forEach((tile) => {
      const tx = tile.col * tileW + tileW / 2;
      const ty = tile.row * tileH + tileH / 2;
      /* Background for label */
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(tx - 20, ty - 14, 40, 28);
      /* Number */
      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(tile.index), tx, ty);
    });
    ctx.restore();

    /* Build tile download section */
    buildTileSection();
  }

  /* ── Build clickable tile grid below canvas ── */
  function buildTileSection() {
    const old = document.getElementById('split-tiles-section');
    if (old) old.remove();

    const cols = Math.max(1, parseInt(colsInput?.value, 10) || 3);

    const section = document.createElement('div');
    section.id = 'split-tiles-section';
    section.style.cssText = 'margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;';

    tileCanvases.forEach((tile) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'text-align:center;';

      /* Thumbnail canvas */
      const thumb = document.createElement('canvas');
      thumb.width = 80;
      thumb.height = 80;
      const tCtx = thumb.getContext('2d');
      tCtx.drawImage(tile.canvas, 0, 0, 80, 80);
      thumb.style.cssText = 'width:80px;height:80px;border:1px solid var(--border);border-radius:4px;cursor:pointer;';
      thumb.title = `Tile ${tile.index} — click to download`;
      thumb.addEventListener('click', () => {
        Utils.downloadCanvas(tile.canvas, `${originalFilename}_split_${tile.index}`, 'png');
      });

      const label = document.createElement('div');
      label.textContent = `#${tile.index}`;
      label.style.cssText = 'font-size:11px;margin-top:2px;color:var(--text-muted);';

      wrap.appendChild(thumb);
      wrap.appendChild(label);
      section.appendChild(wrap);
    });

    const previewArea = document.getElementById('preview-area');
    if (previewArea) previewArea.parentNode.insertBefore(section, previewArea.nextSibling);
  }

  /* ── Input listeners ── */
  const reprocess = Utils.debounce(() => {
    if (originalImg) processImage();
  }, 200);
  colsInput?.addEventListener('input', reprocess);
  rowsInput?.addEventListener('input', reprocess);

  /* ── Download all tiles sequentially ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (tileCanvases.length === 0) {
      Utils.showToast('No tiles generated', 'error');
      return;
    }
    tileCanvases.forEach((tile, i) => {
      setTimeout(() => {
        Utils.downloadCanvas(tile.canvas, `${originalFilename}_split_${tile.index}`, 'png');
      }, i * 150);
    });
    Utils.showToast(`Downloading ${tileCanvases.length} tiles...`, 'success');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    const old = document.getElementById('split-tiles-section');
    if (old) old.remove();
    tileCanvases = [];
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
