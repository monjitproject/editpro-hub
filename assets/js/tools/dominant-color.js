/**
 * Dominant Color Tool
 * Upload an image and extract the top N dominant colors.
 * Controls:
 *   number#dominantCount (default: 5)
 * Uses canvas pixel sampling and color frequency counting.
 * Displays dominant colors as swatches with hex and percentage.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  let originalImg = null;
  let originalFilename = 'image';

  const dominantCountInput = document.getElementById('dominantCount');
  const resultsContainer = document.getElementById('dominantResults');

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
        extractDominantColors();
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

  // ── Color quantization helpers ──
  // Reduce color precision to group similar colors
  function quantizeColor(r, g, b, factor) {
    return {
      r: Math.round(r / factor) * factor,
      g: Math.round(g / factor) * factor,
      b: Math.round(b / factor) * factor
    };
  }

  function extractDominantColors() {
    if (!originalImg) return;

    const numColors = parseInt(dominantCountInput.value) || 5;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const totalPixels = canvas.width * canvas.height;

    // Count color frequencies with quantization
    const colorMap = {};
    const step = 4; // sample every 4th pixel for performance
    let sampledCount = 0;

    for (let i = 0; i < data.length; i += 4 * step) {
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent pixels

      const q = quantizeColor(data[i], data[i + 1], data[i + 2], 16);
      const key = `${q.r},${q.g},${q.b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
      sampledCount++;
    }

    // Sort by frequency
    const sorted = Object.entries(colorMap)
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, count };
      })
      .sort((a, b) => b.count - a.count);

    // Take top N
    const topColors = sorted.slice(0, numColors);

    renderDominantColors(topColors, sampledCount);
  }

  function renderDominantColors(colors, totalSampled) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    colors.forEach((color) => {
      const hex = Utils.rgbToHex(color.r, color.g, color.b).toUpperCase();
      const percentage = ((color.count / totalSampled) * 100).toFixed(1);

      const swatch = document.createElement('div');
      swatch.className = 'dominant-swatch';
      swatch.innerHTML = `
        <div class="dominant-color-block" style="background-color: ${hex}"></div>
        <div class="dominant-info">
          <span class="dominant-hex">${hex}</span>
          <span class="dominant-percent">${percentage}%</span>
          <span class="dominant-rgb">rgb(${color.r}, ${color.g}, ${color.b})</span>
        </div>
      `;

      swatch.title = `Click to copy ${hex}`;
      swatch.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(hex).then(() => {
            Utils.showToast(`Copied: ${hex}`, 'success');
          });
        }
      });

      resultsContainer.appendChild(swatch);
    });

    // Show full-width color bar preview
    const bar = document.createElement('div');
    bar.className = 'dominant-color-bar';
    colors.forEach((color) => {
      const segment = document.createElement('div');
      const hex = Utils.rgbToHex(color.r, color.g, color.b);
      segment.style.backgroundColor = hex;
      segment.style.flex = `${color.count}`;
      bar.appendChild(segment);
    });
    resultsContainer.prepend(bar);
  }

  // ── Control event listeners ──
  if (dominantCountInput) {
    dominantCountInput.addEventListener('change', () => {
      if (originalImg) extractDominantColors();
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
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (zone) zone.style.display = '';
      const workspace = document.getElementById('tool-workspace');
      if (workspace) workspace.style.display = 'none';
      if (dominantCountInput) dominantCountInput.value = 5;
      Utils.showToast('Dominant color extractor reset', 'info');
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
