/**
 * 3D Tilt Preview Tool
 * Renders a tilted 3D version of the image on canvas using perspective projection.
 * Controls: range#tiltX (-30 to 30, default 10),
 *           range#tiltY (-30 to 30, default -10),
 *           range#tiltPerspective (100-2000, default 800)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const tiltXSlider = document.getElementById('tiltX');
  const tiltYSlider = document.getElementById('tiltY');
  const tiltPerspectiveSlider = document.getElementById('tiltPerspective');
  const tiltXValue = document.getElementById('tiltXValue');
  const tiltYValue = document.getElementById('tiltYValue');
  const tiltPerspectiveValue = document.getElementById('tiltPerspectiveValue');
  let originalImg = null;
  let originalFilename = 'image';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /**
   * Render a perspective-tilted version of the image onto the canvas.
   * Uses a point-based projection to simulate CSS perspective + rotateX/Y.
   */
  function processImage() {
    if (!originalImg) return;

    const tiltX = parseFloat(tiltXSlider.value); // rotation around X axis (vertical tilt)
    const tiltY = parseFloat(tiltYSlider.value); // rotation around Y axis (horizontal tilt)
    const perspective = parseFloat(tiltPerspectiveSlider.value);

    // Update displayed values
    if (tiltXValue) tiltXValue.textContent = tiltX + '°';
    if (tiltYValue) tiltYValue.textContent = tiltY + '°';
    if (tiltPerspectiveValue) tiltPerspectiveValue.textContent = perspective + 'px';

    if (tiltX === 0 && tiltY === 0) {
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
      ctx.drawImage(originalImg, 0, 0);
      return;
    }

    const origW = originalImg.naturalWidth;
    const origH = originalImg.naturalHeight;

    // Calculate expanded canvas to accommodate the tilt
    const radX = tiltX * Math.PI / 180;
    const radY = tiltY * Math.PI / 180;

    // Estimate how much the image will expand due to perspective tilt
    const expandFactor = 1 + Math.max(Math.abs(Math.sin(radX)), Math.abs(Math.sin(radY))) * 0.4;
    const newW = Math.round(origW * expandFactor);
    const newH = Math.round(origH * expandFactor);

    canvas.width = newW;
    canvas.height = newH;

    // Clear with dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, newW, newH);

    // Draw tilted image using manual perspective projection
    const cx = newW / 2;
    const cy = newH / 2;

    // Source corners (normalized -0.5 to 0.5)
    const srcCorners = [
      [-0.5, -0.5], // top-left
      [ 0.5, -0.5], // top-right
      [ 0.5,  0.5], // bottom-right
      [-0.5,  0.5]  // bottom-left
    ];

    // Project each corner using perspective transformation
    const dstCorners = srcCorners.map(([nx, ny]) => {
      // Apply rotateX (tilt around horizontal axis)
      let y3d = ny * origH;
      let z3d = y3d * Math.sin(radX);

      // Apply rotateY (tilt around vertical axis)
      let x3d = nx * origW;
      let z3dY = x3d * Math.sin(radY);
      let zTotal = z3d + z3dY;

      // Perspective projection
      const scale = perspective / (perspective + zTotal);
      const projX = cx + x3d * scale * Math.cos(radY);
      const projY = cy + y3d * scale * Math.cos(radX);

      return [projX, projY];
    });

    // Draw using bilinear mapping via many horizontal slices for accuracy
    const steps = Math.max(origH, 40);
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const tNext = (step + 1) / steps;

      // Interpolate left and right edges
      const leftTop = lerp2D(dstCorners[0], dstCorners[3], t);
      const rightTop = lerp2D(dstCorners[1], dstCorners[2], t);
      const leftBot = lerp2D(dstCorners[0], dstCorners[3], tNext);
      const rightBot = lerp2D(dstCorners[1], dstCorners[2], tNext);

      const srcY = t * origH;
      const srcH = origH / steps;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftTop[0], leftTop[1]);
      ctx.lineTo(rightTop[0], rightTop[1]);
      ctx.lineTo(rightBot[0], rightBot[1]);
      ctx.lineTo(leftBot[0], leftBot[1]);
      ctx.closePath();
      ctx.clip();

      // Calculate the transform matrix for this strip
      ctx.setTransform(
        (rightTop[0] - leftTop[0]) / origW, (rightBot[0] - leftBot[0]) / origW,
        (rightTop[1] - leftTop[1]) / origH, (rightBot[1] - leftBot[1]) / origH,
        leftTop[0], leftTop[1]
      );

      ctx.drawImage(
        originalImg,
        0, srcY, origW, srcH,
        0, 0, origW, srcH
      );
      ctx.restore();
    }
  }

  function lerp2D(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t
    ];
  }

  const debouncedProcess = Utils.debounce(processImage, 30);

  // Event listeners for controls
  if (tiltXSlider) tiltXSlider.addEventListener('input', debouncedProcess);
  if (tiltYSlider) tiltYSlider.addEventListener('input', debouncedProcess);
  if (tiltPerspectiveSlider) tiltPerspectiveSlider.addEventListener('input', debouncedProcess);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_tilt3d', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (tiltXSlider) tiltXSlider.value = '10';
      if (tiltYSlider) tiltYSlider.value = '-10';
      if (tiltPerspectiveSlider) tiltPerspectiveSlider.value = '800';
      if (tiltXValue) tiltXValue.textContent = '10°';
      if (tiltYValue) tiltYValue.textContent = '-10°';
      if (tiltPerspectiveValue) tiltPerspectiveValue.textContent = '800px';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('3D tilt reset', 'info');
    });
  }

  // Clipboard paste support
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile());
        break;
      }
    }
  });
});
