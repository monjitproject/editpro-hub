/**
 * Grid Cutter — Slice image into a grid of equal tiles
 * Controls: number#gridCols (default 3), number#gridRows (default 3)
 * Shows grid overlay; generates tile canvases; provides download per tile.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const colsInput = document.getElementById('gridCols');
  const rowsInput = document.getElementById('gridRows');
  let originalImg = null;
  let originalFilename = 'image';
  let tileCanvases = []; // 2D array [row][col]

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

  /* ── Process: draw image + grid overlay, generate tiles ── */
  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    const cols = Math.max(1, parseInt(colsInput?.value, 10) || 3);
    const rows = Math.max(1, parseInt(rowsInput?.value, 10) || 3);
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    /* Generate tile canvases */
    tileCanvases = [];
    for (let r = 0; r < rows; r++) {
      tileCanvases[r] = [];
      for (let c = 0; c < cols; c++) {
        const tile = Utils.cropCanvas(canvas, c * tileW, r * tileH, tileW, tileH);
        tileCanvases[r][c] = tile;
      }
    }

    /* Draw grid overlay */
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    for (let c = 1; c < cols; c++) {
      const x = Math.round(c * tileW);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const y = Math.round(r * tileH);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    /* Tile numbers */
    ctx.setLineDash([]);
    ctx.font = `${Math.max(14, Math.min(24, tileW / 6))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = c * tileW + tileW / 2;
        const ty = r * tileH + tileH / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tx - 16, ty - 12, 32, 24);
        ctx.fillStyle = '#fff';
        ctx.fillText(String(idx++), tx, ty);
      }
    }
    ctx.restore();

    /* Create tile download section */
    buildTileSection();
  }

  /* ── Build a tile grid below canvas for individual downloads ── */
  function buildTileSection() {
    /* Remove old section if any */
    const old = document.getElementById('tiles-section');
    if (old) old.remove();

    const cols = Math.max(1, parseInt(colsInput?.value, 10) || 3);
    const rows = Math.max(1, parseInt(rowsInput?.value, 10) || 3);

    const section = document.createElement('div');
    section.id = 'tiles-section';
    section.style.cssText = 'margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;';

    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = tileCanvases[r]?.[c];
        if (!tile) continue;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'text-align:center;';
        const thumb = document.createElement('canvas');
        thumb.width = 80;
        thumb.height = 80;
        const tCtx = thumb.getContext('2d');
        tCtx.drawImage(tile, 0, 0, 80, 80);
        thumb.style.cssText = 'width:80px;height:80px;border:1px solid var(--border);border-radius:4px;cursor:pointer;';
        thumb.title = `Tile ${idx} — click to download`;
        thumb.addEventListener('click', () => {
          Utils.downloadCanvas(tile, `${originalFilename}_tile_${idx}`, 'png');
        });
        const label = document.createElement('div');
        label.textContent = `#${idx}`;
        label.style.cssText = 'font-size:11px;margin-top:2px;color:var(--text-muted);';
        wrap.appendChild(thumb);
        wrap.appendChild(label);
        section.appendChild(wrap);
        idx++;
      }
    }

    /* Insert after preview area */
    const previewArea = document.getElementById('preview-area');
    if (previewArea) previewArea.parentNode.insertBefore(section, previewArea.nextSibling);
  }

  /* ── Input listeners ── */
  const reprocess = Utils.debounce(() => {
    if (originalImg) processImage();
  }, 200);
  colsInput?.addEventListener('input', reprocess);
  rowsInput?.addEventListener('input', reprocess);

  /* ── Download all tiles individually ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (tileCanvases.length === 0) {
      Utils.showToast('No tiles generated', 'error');
      return;
    }
    let idx = 1;
    tileCanvases.forEach((row) => {
      row.forEach((tile) => {
        setTimeout(() => {
          Utils.downloadCanvas(tile, `${originalFilename}_tile_${idx}`, 'png');
        }, idx * 150);
        idx++;
      });
    });
    Utils.showToast(`Downloading ${idx - 1} tiles...`, 'success');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    const old = document.getElementById('tiles-section');
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
