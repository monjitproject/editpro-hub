/**
 * Palette Extractor Tool
 * Upload an image and extract a color palette using median-cut quantization.
 * Controls:
 *   number#paletteCount (default: 8)
 * Displays color swatches with hex values and percentages.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  let originalImg = null;
  let originalFilename = 'image';

  const paletteCountInput = document.getElementById('paletteCount');
  const paletteContainer = document.getElementById('paletteResults');

  // ── Upload zone setup ──
  const zone = document.getElementById('upload-zone');
  const fileInput = zone ? zone.querySelector('input[type="file"]') : null;

  function handleFile(file) {
    if (!Utils.validateImageFile(file, 10)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (zone) zone.style.display = 'none';
        const workspace = document.getElementById('tool-workspace');
        if (workspace) workspace.style.display = 'block';
        extractPalette();
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
  }
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
  }

  // ── Median Cut Algorithm ──
  function getPixelColors(imageData) {
    const data = imageData.data;
    const pixels = [];
    const step = 4; // sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a > 128) { // skip mostly transparent pixels
        pixels.push([r, g, b]);
      }
    }
    return pixels;
  }

  function medianCut(pixels, depth) {
    if (depth === 0 || pixels.length === 0) {
      if (pixels.length === 0) return [];
      // Average the colors in this bucket
      const avg = [0, 0, 0];
      for (const p of pixels) {
        avg[0] += p[0];
        avg[1] += p[1];
        avg[2] += p[2];
      }
      avg[0] = Math.round(avg[0] / pixels.length);
      avg[1] = Math.round(avg[1] / pixels.length);
      avg[2] = Math.round(avg[2] / pixels.length);
      return [{ color: avg, count: pixels.length }];
    }

    // Find the channel with the greatest range
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (const p of pixels) {
      if (p[0] < minR) minR = p[0];
      if (p[0] > maxR) maxR = p[0];
      if (p[1] < minG) minG = p[1];
      if (p[1] > maxG) maxG = p[1];
      if (p[2] < minB) minB = p[2];
      if (p[2] > maxB) maxB = p[2];
    }

    const rangeR = maxR - minR;
    const rangeG = maxG - minG;
    const rangeB = maxB - minB;

    let sortChannel;
    if (rangeR >= rangeG && rangeR >= rangeB) {
      sortChannel = 0;
    } else if (rangeG >= rangeR && rangeG >= rangeB) {
      sortChannel = 1;
    } else {
      sortChannel = 2;
    }

    pixels.sort((a, b) => a[sortChannel] - b[sortChannel]);

    const mid = Math.floor(pixels.length / 2);
    const left = medianCut(pixels.slice(0, mid), depth - 1);
    const right = medianCut(pixels.slice(mid), depth - 1);

    return left.concat(right);
  }

  function extractPalette() {
    if (!originalImg) return;

    const numColors = parseInt(paletteCountInput.value) || 8;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = getPixelColors(imageData);

    if (pixels.length === 0) {
      Utils.showToast('No valid pixels found in image', 'error');
      return;
    }

    // Calculate depth: 2^depth = numColors
    const depth = Math.ceil(Math.log2(numColors));
    let buckets = medianCut(pixels, depth);

    // Sort by frequency (most common first)
    buckets.sort((a, b) => b.count - a.count);

    // Limit to requested count
    buckets = buckets.slice(0, numColors);

    const totalPixels = pixels.length;

    renderPalette(buckets, totalPixels);
  }

  function renderPalette(buckets, totalPixels) {
    if (!paletteContainer) return;
    paletteContainer.innerHTML = '';

    buckets.forEach((bucket) => {
      const [r, g, b] = bucket.color;
      const hex = Utils.rgbToHex(r, g, b).toUpperCase();
      const percentage = ((bucket.count / totalPixels) * 100).toFixed(1);

      const swatch = document.createElement('div');
      swatch.className = 'palette-swatch';
      swatch.innerHTML = `
        <div class="swatch-color" style="background-color: ${hex}"></div>
        <div class="swatch-info">
          <span class="swatch-hex">${hex}</span>
          <span class="swatch-percent">${percentage}%</span>
          <span class="swatch-rgb">rgb(${r}, ${g}, ${b})</span>
        </div>
      `;

      // Click to copy hex
      swatch.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(hex).then(() => {
            Utils.showToast(`Copied: ${hex}`, 'success');
          });
        }
      });

      paletteContainer.appendChild(swatch);
    });
  }

  // ── Control event listeners ──
  if (paletteCountInput) {
    paletteCountInput.addEventListener('change', () => {
      if (originalImg) extractPalette();
    });
  }

  // ── Copy all as CSS ──
  const copyAllBtn = document.getElementById('copyAllBtn');
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      const swatches = paletteContainer ? paletteContainer.querySelectorAll('.swatch-hex') : [];
      const colors = Array.from(swatches).map(s => s.textContent).join(', ');
      if (navigator.clipboard && colors) {
        navigator.clipboard.writeText(colors).then(() => {
          Utils.showToast('Palette copied to clipboard', 'success');
        });
      }
    });
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      originalImg = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      if (paletteContainer) paletteContainer.innerHTML = '';
      if (zone) zone.style.display = '';
      const workspace = document.getElementById('tool-workspace');
      if (workspace) workspace.style.display = 'none';
      if (paletteCountInput) paletteCountInput.value = 8;
      Utils.showToast('Palette extractor reset', 'info');
    });
  }

  // ── Clipboard paste support ──
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        handleFile(blob);
        break;
      }
    }
  });
});
