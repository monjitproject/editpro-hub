/**
 * File Size Calculator
 * No image upload needed. Pure calculator.
 * Controls: number#calcWidth (1920), number#calcHeight (1080),
 *   select#calcFormat (PNG/JPEG/WEBP), range#calcQuality (10-100, default:85)
 * Calculates estimated file sizes for each format.
 * Shows raw pixel count, channels, estimated sizes in KB/MB.
 * Display in a table for quick comparison.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const widthInput = document.getElementById('calcWidth');
  const heightInput = document.getElementById('calcHeight');
  const formatSelect = document.getElementById('calcFormat');
  const qualitySlider = document.getElementById('calcQuality');
  const qualityValue = document.getElementById('calcQuality-value');

  /* Hide upload zone, show workspace immediately */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* Initial canvas placeholder */
  canvas.width = 400;
  canvas.height = 300;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#999';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter dimensions and click Calculate', 200, 150);

  function calculate() {
    const w = parseInt(widthInput.value, 10) || 0;
    const h = parseInt(heightInput.value, 10) || 0;
    const quality = parseInt(qualitySlider.value, 10) / 100;
    const formatVal = formatSelect.value;
    /* HTML options use "0","1","2" for PNG, JPEG, WEBP */

    if (qualityValue) qualityValue.textContent = qualitySlider.value + '%';

    if (w <= 0 || h <= 0) {
      renderResults(null);
      return;
    }

    const pixels = w * h;
    const channels = 4; /* RGBA */
    const rawBytes = pixels * channels;

    /* Estimate sizes per format */
    const pngSize = estimatePNG(w, h);
    const jpegSize = estimateJPEG(w, h, quality);
    const webpSize = estimateWEBP(w, h, quality);

    renderResults({
      width: w,
      height: h,
      pixels,
      channels,
      rawBytes,
      png: pngSize,
      jpeg: jpegSize,
      webp: webpSize
    });
  }

  function estimatePNG(w, h) {
    /* PNG is lossless but uses zlib deflate.
       Rough estimate: raw RGBA * compression ratio (typically 0.3-0.6 for photos, 0.1-0.2 for graphics) */
    const rawBytes = w * h * 4;
    /* Conservative average compression ratio */
    const avgRatio = 0.45;
    return Math.round(rawBytes * avgRatio);
  }

  function estimateJPEG(w, h, quality) {
    /* JPEG uses lossy DCT compression.
       Rough estimate based on quality factor.
       At quality 1.0 -> ~0.5 of raw, at 0.5 -> ~0.08, at 0.1 -> ~0.02 */
    const rawBytes = w * h * 3; /* JPEG doesn't have alpha */
    /* Empirical curve: size scales roughly as quality^1.5 * baseRatio */
    const baseRatio = 0.15;
    const size = rawBytes * baseRatio * Math.pow(quality, 1.5);
    return Math.max(Math.round(size), 100);
  }

  function estimateWEBP(w, h, quality) {
    /* WEBP lossy is roughly 25-35% smaller than JPEG at same quality */
    const rawBytes = w * h * 3;
    const baseRatio = 0.10;
    const size = rawBytes * baseRatio * Math.pow(quality, 1.5);
    return Math.max(Math.round(size), 80);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function renderResults(data) {
    const resultsContainer = document.getElementById('calc-results');
    if (!resultsContainer) return;

    if (!data) {
      resultsContainer.innerHTML = `
        <div style="text-align:center;padding:var(--space-6);color:var(--text-muted);">
          <p>Enter valid width and height to see estimated file sizes.</p>
        </div>`;
      return;
    }

    /* Draw visual representation on canvas */
    drawVisual(data.width, data.height);

    /* Build results table */
    let html = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--space-3);margin-bottom:var(--space-4);">
        <div class="stat-card" style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
          <div style="font-size:var(--text-sm);color:var(--text-muted);">Pixels</div>
          <div style="font-size:1.3em;font-weight:700;">${data.pixels.toLocaleString()}</div>
        </div>
        <div class="stat-card" style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
          <div style="font-size:var(--text-sm);color:var(--text-muted);">Dimensions</div>
          <div style="font-size:1.3em;font-weight:700;">${data.width} x ${data.height}</div>
        </div>
        <div class="stat-card" style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
          <div style="font-size:var(--text-sm);color:var(--text-muted);">Raw (RGBA)</div>
          <div style="font-size:1.3em;font-weight:700;">${formatSize(data.rawBytes)}</div>
        </div>
        <div class="stat-card" style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
          <div style="font-size:var(--text-sm);color:var(--text-muted);">Channels</div>
          <div style="font-size:1.3em;font-weight:700;">${data.channels} (RGBA)</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:8px 12px;background:var(--bg-secondary);">Format</th>
            <th style="text-align:right;padding:8px 12px;background:var(--bg-secondary);">Estimated Size</th>
            <th style="text-align:right;padding:8px 12px;background:var(--bg-secondary);">vs Raw</th>
            <th style="text-align:right;padding:8px 12px;background:var(--bg-secondary);">Compression</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">PNG (lossless)</td>
            <td style="text-align:right;padding:8px 12px;font-weight:600;">${formatSize(data.png)}</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${(data.png / data.rawBytes * 100).toFixed(1)}%</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${((1 - data.png / data.rawBytes) * 100).toFixed(1)}% smaller</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">JPEG (lossy)</td>
            <td style="text-align:right;padding:8px 12px;font-weight:600;">${formatSize(data.jpeg)}</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${(data.jpeg / data.rawBytes * 100).toFixed(1)}%</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${((1 - data.jpeg / data.rawBytes) * 100).toFixed(1)}% smaller</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">WEBP (lossy)</td>
            <td style="text-align:right;padding:8px 12px;font-weight:600;">${formatSize(data.webp)}</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${(data.webp / data.rawBytes * 100).toFixed(1)}%</td>
            <td style="text-align:right;padding:8px 12px;color:var(--text-secondary);">${((1 - data.webp / data.rawBytes) * 100).toFixed(1)}% smaller</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top:var(--space-3);font-size:var(--text-xs);color:var(--text-muted);">
        Note: Estimates are based on typical compression ratios. Actual file sizes vary depending on image content (photos vs. graphics),
        color distribution, and specific encoder implementation. Quality: ${Math.round(data.png ? 100 : parseInt(qualitySlider.value, 10))}% for lossy formats.
      </p>`;

    resultsContainer.innerHTML = html;
  }

  function drawVisual(w, h) {
    /* Draw a scaled visual representation */
    const maxDim = 300;
    const scale = Math.min(maxDim / w, maxDim / h, 1);
    const drawW = Math.round(w * scale);
    const drawH = Math.round(h * scale);

    canvas.width = maxDim + 40;
    canvas.height = maxDim + 60;

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - drawW) / 2;
    const offsetY = (canvas.height - drawH) / 2 + 10;

    /* Draw dimension rectangle */
    ctx.strokeStyle = 'var(--accent, #6366f1)';
    ctx.strokeStyle = '#6366f1';
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, drawW, drawH);
    ctx.fillRect(offsetX, offsetY, drawW, drawH);

    /* Draw crosshatch pattern */
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 0.5;
    const step = 20;
    for (let x = offsetX; x < offsetX + drawW; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + drawH);
      ctx.stroke();
    }
    for (let y = offsetY; y < offsetY + drawH; y += step) {
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + drawW, y);
      ctx.stroke();
    }

    /* Width label */
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(w + ' px', offsetX + drawW / 2, offsetY + drawH + 18);

    /* Height label */
    ctx.save();
    ctx.translate(offsetX - 12, offsetY + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(h + ' px', 0, 0);
    ctx.restore();
  }

  /* ---- Event Listeners ---- */
  const debouncedCalc = Utils.debounce ? Utils.debounce(calculate, 200) : calculate;

  if (widthInput) widthInput.addEventListener('input', debouncedCalc);
  if (heightInput) heightInput.addEventListener('input', debouncedCalc);
  if (formatSelect) formatSelect.addEventListener('change', calculate);
  if (qualitySlider) qualitySlider.addEventListener('input', () => {
    if (qualityValue) qualityValue.textContent = qualitySlider.value + '%';
    debouncedCalc();
  });

  /* ---- Download (export the estimation table as a text file) ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const w = parseInt(widthInput.value, 10) || 0;
    const h = parseInt(heightInput.value, 10) || 0;
    const quality = parseInt(qualitySlider.value, 10);

    if (w <= 0 || h <= 0) {
      Utils.showToast('Enter valid dimensions first', 'warning');
      return;
    }

    const pixels = w * h;
    const rawBytes = pixels * 4;
    const pngSize = estimatePNG(w, h);
    const jpegSize = estimateJPEG(w, h, quality / 100);
    const webpSize = estimateWEBP(w, h, quality / 100);

    let text = `File Size Estimation\n`;
    text += `====================\n`;
    text += `Dimensions: ${w} x ${h}\n`;
    text += `Total Pixels: ${pixels.toLocaleString()}\n`;
    text += `Raw (RGBA): ${formatSize(rawBytes)}\n`;
    text += `Quality: ${quality}%\n\n`;
    text += `Format      | Estimated Size | vs Raw\n`;
    text += `------------|---------------|--------\n`;
    text += `PNG         | ${formatSize(pngSize).padEnd(14)} | ${(pngSize / rawBytes * 100).toFixed(1)}%\n`;
    text += `JPEG        | ${formatSize(jpegSize).padEnd(14)} | ${(jpegSize / rawBytes * 100).toFixed(1)}%\n`;
    text += `WEBP        | ${formatSize(webpSize).padEnd(14)} | ${(webpSize / rawBytes * 100).toFixed(1)}%\n`;

    Utils.downloadFile(text, 'file-size-estimation.txt', 'text/plain');
    Utils.showToast('Estimation report downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (widthInput) widthInput.value = 1920;
    if (heightInput) heightInput.value = 1080;
    if (formatSelect) formatSelect.value = '0';
    if (qualitySlider) qualitySlider.value = 85;
    if (qualityValue) qualityValue.textContent = '85%';
    const resultsContainer = document.getElementById('calc-results');
    if (resultsContainer) resultsContainer.innerHTML = '';
    canvas.width = 400;
    canvas.height = 300;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter dimensions and click Calculate', 200, 150);
    Utils.showToast('Tool reset', 'info');
  });

  /* Run initial calculation */
  calculate();
});
