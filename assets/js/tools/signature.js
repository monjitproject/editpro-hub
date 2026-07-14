/**
 * Signature Maker — Drawing canvas for mouse/touch signatures
 * Controls: range#penSize (1-10, default:3), color#penColor (#000000)
 * Clear button. Download as transparent PNG. No image upload needed.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const penSize = document.getElementById('penSize');
  const penColor = document.getElementById('penColor');

  /* Show workspace immediately (no image upload needed) */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* ── Initialize canvas ── */
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 300;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* Draw subtle guide line */
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();
  }

  clearCanvas();

  /* ── Drawing functions ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDraw(x, y) {
    drawing = true;
    lastX = x;
    lastY = y;
  }

  function drawTo(x, y) {
    if (!drawing) return;

    const size = penSize ? parseInt(penSize.value, 10) : 3;
    const color = penColor ? penColor.value : '#000000';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function endDraw() {
    drawing = false;
  }

  /* ── Mouse events ── */
  canvas.addEventListener('mousedown', e => {
    const pos = getCanvasCoords(e);
    startDraw(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const pos = getCanvasCoords(e);
    drawTo(pos.x, pos.y);
  });

  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  /* ── Touch events ── */
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    startDraw(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!drawing) return;
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    drawTo(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    endDraw();
  });

  /* ── Size label update ── */
  const sizeLabel = document.getElementById('penSize-value');
  if (penSize && sizeLabel) {
    penSize.addEventListener('input', () => {
      sizeLabel.textContent = penSize.value + 'px';
    });
  }

  /* ── Clear button ── */
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCanvas);
  }

  /* ── Download as transparent PNG ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    /* Check if anything was drawn (non-transparent pixels exist) */
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((val, i) => {
      return (i + 1) % 4 === 3 && val > 0; /* Check alpha channel */
    });
    if (!hasContent) {
      Utils.showToast('Draw a signature first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, 'signature', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (penSize) penSize.value = '3';
    if (penColor) penColor.value = '#000000';
    if (sizeLabel) sizeLabel.textContent = '3px';
    clearCanvas();
  });
});
