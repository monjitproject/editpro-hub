/**
 * Compare Slider
 * Upload two images (before/after) and compare them with an interactive slider.
 * Uses mousedown/mousemove/mouseup events. Draws both images on canvas
 * and clips at the divider position. Shows "Before" and "After" labels.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');
  let beforeImg = null;
  let afterImg = null;
  let sliderPosition = 0.5; /* 0 to 1, 0.5 = middle */
  let isDragging = false;
  let currentStep = 'before'; /* 'before' or 'after' */
  let canvasW = 800;
  let canvasH = 500;

  /* ---- Upload Zone ---- */
  if (zone) {
    Utils.setupDragDrop(zone, handleFirstFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.addEventListener('change', e => {
        if (e.target.files[0]) handleFirstFile(e.target.files[0]);
      });
    }
  }

  function handleFirstFile(file) {
    if (!Utils.validateImageFile(file)) return;
    Utils.loadImage(file).then(img => {
      beforeImg = img;
      currentStep = 'after';
      Utils.showToast('Before image loaded. Now upload the "After" image.', 'info');

      /* Show the upload zone again for second image */
      const zoneTitle = zone.querySelector('h3');
      if (zoneTitle) zoneTitle.textContent = 'Drop your "After" image here or click to upload';

      /* Also set up a second file input listener */
      const input = zone.querySelector('input[type="file"]');
      if (input) {
        input.value = '';
        input.onchange = e => {
          if (e.target.files[0]) handleSecondFile(e.target.files[0]);
        };
      }
    });
  }

  function handleSecondFile(file) {
    if (!Utils.validateImageFile(file)) return;
    Utils.loadImage(file).then(img => {
      afterImg = img;
      initComparison();
    });
  }

  function initComparison() {
    if (!beforeImg || !afterImg) return;

    zone.style.display = 'none';
    if (workspace) workspace.classList.add('active');

    /* Use the larger dimensions */
    canvasW = Math.max(beforeImg.naturalWidth, afterImg.naturalWidth);
    canvasH = Math.max(beforeImg.naturalHeight, afterImg.naturalHeight);

    /* Cap to reasonable display size */
    const maxDisplay = 900;
    if (canvasW > maxDisplay) {
      const ratio = maxDisplay / canvasW;
      canvasW = maxDisplay;
      canvasH = Math.round(canvasH * ratio);
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    sliderPosition = 0.5;
    drawComparison();
    setupSliderEvents();
  }

  function drawComparison() {
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    /* Draw the "after" image (full) */
    ctx.drawImage(afterImg, 0, 0, canvasW, canvasH);

    /* Draw the "before" image, clipped to the left of the slider */
    const dividerX = Math.round(canvasW * sliderPosition);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, dividerX, canvasH);
    ctx.clip();
    ctx.drawImage(beforeImg, 0, 0, canvasW, canvasH);
    ctx.restore();

    /* Draw divider line */
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(dividerX, 0);
    ctx.lineTo(dividerX, canvasH);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Draw handle circle */
    const handleY = canvasH / 2;
    const handleR = 16;

    ctx.beginPath();
    ctx.arc(dividerX, handleY, handleR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* Draw arrows on handle */
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    /* Left arrow */
    ctx.beginPath();
    ctx.moveTo(dividerX - 4, handleY);
    ctx.lineTo(dividerX - 8, handleY);
    ctx.moveTo(dividerX - 6, handleY - 3);
    ctx.lineTo(dividerX - 8, handleY);
    ctx.lineTo(dividerX - 6, handleY + 3);
    ctx.stroke();
    /* Right arrow */
    ctx.beginPath();
    ctx.moveTo(dividerX + 4, handleY);
    ctx.lineTo(dividerX + 8, handleY);
    ctx.moveTo(dividerX + 6, handleY - 3);
    ctx.lineTo(dividerX + 8, handleY);
    ctx.lineTo(dividerX + 6, handleY + 3);
    ctx.stroke();

    /* Draw labels */
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    /* "Before" label on the left */
    if (dividerX > 60) {
      const labelX = Math.max(50, dividerX - 50);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      roundRectFill(ctx, labelX - 35, 16, 70, 28, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Before', labelX, 35);
    }

    /* "After" label on the right */
    if (canvasW - dividerX > 60) {
      const labelX = Math.min(canvasW - 50, dividerX + 50);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      roundRectFill(ctx, labelX - 30, 16, 60, 28, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('After', labelX, 35);
    }
  }

  function roundRectFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function setupSliderEvents() {
    function getCanvasX(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      let clientX;
      if (e.touches) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }
      return (clientX - rect.left) * scaleX;
    }

    function onPointerDown(e) {
      isDragging = true;
      const x = getCanvasX(e);
      sliderPosition = Math.max(0, Math.min(1, x / canvasW));
      drawComparison();
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const x = getCanvasX(e);
      sliderPosition = Math.max(0, Math.min(1, x / canvasW));
      drawComparison();
      e.preventDefault();
    }

    function onPointerUp() {
      isDragging = false;
    }

    /* Remove old listeners by replacing the canvas */
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);

    /* Re-reference canvas and context */
    const newCtx = newCanvas.getContext('2d');

    /* Update the module-level references via a closure-friendly approach */
    /* We reassign the event listeners on the new canvas element */
    newCanvas.addEventListener('mousedown', onPointerDown);
    newCanvas.addEventListener('mousemove', onPointerMove);
    newCanvas.addEventListener('mouseup', onPointerUp);
    newCanvas.addEventListener('mouseleave', onPointerUp);
    newCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
    newCanvas.addEventListener('touchmove', onPointerMove, { passive: false });
    newCanvas.addEventListener('touchend', onPointerUp);

    /* Redraw on the new canvas */
    redrawOnCanvas(newCanvas, newCtx);
  }

  function redrawOnCanvas(cvs, c) {
    c.clearRect(0, 0, canvasW, canvasH);
    cvs.width = canvasW;
    cvs.height = canvasH;

    c.drawImage(afterImg, 0, 0, canvasW, canvasH);

    const dividerX = Math.round(canvasW * sliderPosition);

    c.save();
    c.beginPath();
    c.rect(0, 0, dividerX, canvasH);
    c.clip();
    c.drawImage(beforeImg, 0, 0, canvasW, canvasH);
    c.restore();

    c.strokeStyle = '#ffffff';
    c.lineWidth = 2;
    c.shadowColor = 'rgba(0,0,0,0.5)';
    c.shadowBlur = 4;
    c.beginPath();
    c.moveTo(dividerX, 0);
    c.lineTo(dividerX, canvasH);
    c.stroke();
    c.shadowBlur = 0;

    const handleY = canvasH / 2;
    const handleR = 16;

    c.beginPath();
    c.arc(dividerX, handleY, handleR, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.2)';
    c.lineWidth = 1;
    c.stroke();

    c.strokeStyle = '#333333';
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(dividerX - 4, handleY);
    c.lineTo(dividerX - 8, handleY);
    c.moveTo(dividerX - 6, handleY - 3);
    c.lineTo(dividerX - 8, handleY);
    c.lineTo(dividerX - 6, handleY + 3);
    c.stroke();
    c.beginPath();
    c.moveTo(dividerX + 4, handleY);
    c.lineTo(dividerX + 8, handleY);
    c.moveTo(dividerX + 6, handleY - 3);
    c.lineTo(dividerX + 8, handleY);
    c.lineTo(dividerX + 6, handleY + 3);
    c.stroke();

    c.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    c.textAlign = 'center';

    if (dividerX > 60) {
      const labelX = Math.max(50, dividerX - 50);
      c.fillStyle = 'rgba(0,0,0,0.6)';
      roundRectFillCtx(c, labelX - 35, 16, 70, 28, 4);
      c.fillStyle = '#ffffff';
      c.fillText('Before', labelX, 35);
    }
    if (canvasW - dividerX > 60) {
      const labelX = Math.min(canvasW - 50, dividerX + 50);
      c.fillStyle = 'rgba(0,0,0,0.6)';
      roundRectFillCtx(c, labelX - 30, 16, 60, 28, 4);
      c.fillStyle = '#ffffff';
      c.fillText('After', labelX, 35);
    }
  }

  function roundRectFillCtx(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  }

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!beforeImg || !afterImg) {
      Utils.showToast('Please upload both images first', 'warning');
      return;
    }
    Utils.downloadCanvas(canvas, 'comparison', 'png');
    Utils.showToast('Comparison downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    beforeImg = null;
    afterImg = null;
    sliderPosition = 0.5;
    currentStep = 'before';
    canvas.width = 0;
    canvas.height = 0;
    zone.style.display = '';
    const zoneTitle = zone.querySelector('h3');
    if (zoneTitle) zoneTitle.textContent = 'Drop your image here or click to upload';
    if (workspace) workspace.classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });

  /* ---- Clipboard paste ---- */
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (currentStep === 'before') {
          handleFirstFile(blob);
        } else {
          handleSecondFile(blob);
        }
        break;
      }
    }
  });
});
