/**
 * Aspect Ratio Calculator
 * No image upload. Calculator tool.
 * Controls: number#ratioWidth (1920), number#ratioHeight (1080)
 * Calculate GCD and show simplified aspect ratio (e.g., 16:9).
 * Show common aspect ratio names. Allow entering a ratio and computing
 * dimensions at various widths/heights. Show a table of equivalent sizes.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const widthInput = document.getElementById('ratioWidth');
  const heightInput = document.getElementById('ratioHeight');

  /* Hide upload zone, show workspace immediately */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* Common aspect ratio names */
  const COMMON_RATIOS = {
    '1:1': 'Square',
    '4:3': 'Standard (TV/Monitor)',
    '3:2': '35mm Film / DSLR',
    '16:9': 'Widescreen (HD/TV)',
    '21:9': 'Ultra-wide (Cinematic)',
    '2:1': 'Univisium',
    '3:4': 'Portrait Standard',
    '4:5': 'Portrait (Instagram)',
    '5:4': 'Large Format',
    '9:16': 'Vertical Video / Stories',
    '9:21': 'Tall Portrait',
    '2:3': '4x6 Print',
    '5:7': '5x7 Print',
    '8:10': '8x10 Print',
    '1:2': 'Half',
    '3:1': 'Panorama (Stereographic)',
    '4:1': 'Super Panorama'
  };

  /* GCD helper */
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  /* Initial canvas */
  canvas.width = 400;
  canvas.height = 300;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#999';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter dimensions to calculate aspect ratio', 200, 150);

  function calculate() {
    const w = parseInt(widthInput.value, 10) || 0;
    const h = parseInt(heightInput.value, 10) || 0;

    if (w <= 0 || h <= 0) {
      renderResults(null);
      return;
    }

    const g = gcd(w, h);
    const ratioW = w / g;
    const ratioH = h / g;
    const ratioStr = ratioW + ':' + ratioH;
    const decimalRatio = (w / h).toFixed(4);
    const name = COMMON_RATIOS[ratioStr] || null;

    /* Find closest common ratio */
    let closestName = null;
    let closestDiff = Infinity;
    for (const [key, val] of Object.entries(COMMON_RATIOS)) {
      const [cw, ch] = key.split(':').map(Number);
      const diff = Math.abs(w / h - cw / ch);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestName = val;
      }
    }

    renderResults({
      width: w,
      height: h,
      ratioW,
      ratioH,
      ratioStr,
      decimalRatio,
      name,
      closestName,
      closestDiff
    });
  }

  function renderResults(data) {
    const resultsContainer = document.getElementById('ratio-results');
    if (!resultsContainer) return;

    if (!data) {
      resultsContainer.innerHTML = `
        <div style="text-align:center;padding:var(--space-6);color:var(--text-muted);">
          <p>Enter valid width and height to calculate the aspect ratio.</p>
        </div>`;
      drawPlaceholder();
      return;
    }

    let html = `
      <div style="text-align:center;margin-bottom:var(--space-4);">
        <div style="font-size:2em;font-weight:700;color:var(--accent, #6366f1);">${data.ratioStr}</div>
        ${data.name ? `<div style="font-size:var(--text-lg);color:var(--text-secondary);margin-top:4px;">${data.name}</div>` : ''}
        <div style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">
          Decimal: ${data.decimalRatio} | Original: ${data.width} x ${data.height}
        </div>
        ${data.closestName && !data.name ? `<div style="font-size:var(--text-sm);color:var(--text-muted);">Closest match: ${data.closestName}</div>` : ''}
      </div>

      <h4 style="margin-bottom:var(--space-2);">Equivalent Sizes at Various Widths</h4>
      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);margin-bottom:var(--space-4);">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:6px 12px;background:var(--bg-secondary);">Width</th>
            <th style="text-align:right;padding:6px 12px;background:var(--bg-secondary);">Height</th>
            <th style="text-align:right;padding:6px 12px;background:var(--bg-secondary);">Megapixels</th>
          </tr>
        </thead>
        <tbody>`;

    /* Generate equivalent sizes for common widths */
    const targetWidths = [
      320, 480, 640, 720, 800, 1024, 1280, 1366,
      1600, 1920, 2048, 2560, 3200, 3840, 4096, 5120
    ];

    for (const tw of targetWidths) {
      const th = Math.round(tw * data.ratioH / data.ratioW);
      const mp = (tw * th / 1000000).toFixed(2);
      const isOriginal = tw === data.width;
      html += `<tr style="border-bottom:1px solid var(--border);${isOriginal ? 'background:var(--bg-secondary);font-weight:600;' : ''}">
        <td style="padding:5px 12px;">${tw} px${isOriginal ? ' *' : ''}</td>
        <td style="text-align:right;padding:5px 12px;">${th} px</td>
        <td style="text-align:right;padding:5px 12px;">${mp} MP</td>
      </tr>`;
    }

    html += `</tbody></table>
      <p style="font-size:var(--text-xs);color:var(--text-muted);">* = Your entered dimensions</p>

      <h4 style="margin:var(--space-3) 0 var(--space-2);">Common Aspect Ratios</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;">`;

    for (const [ratio, name] of Object.entries(COMMON_RATIOS)) {
      const isMatch = ratio === data.ratioStr;
      html += `<div style="padding:6px 10px;border:1px solid ${isMatch ? 'var(--accent, #6366f1)' : 'var(--border)'};border-radius:6px;font-size:var(--text-sm);${isMatch ? 'background:var(--accent, #6366f1);color:white;' : ''}">
        <strong>${ratio}</strong> ${name}
      </div>`;
    }

    html += '</div>';

    resultsContainer.innerHTML = html;

    /* Draw visual on canvas */
    drawVisual(data.ratioW, data.ratioH, data.width, data.height);
  }

  function drawVisual(ratioW, ratioH, w, h) {
    const maxDim = 260;
    const scale = Math.min(maxDim / ratioW, maxDim / ratioH, 1);
    const drawW = Math.round(ratioW * scale);
    const drawH = Math.round(ratioH * scale);

    canvas.width = maxDim + 60;
    canvas.height = maxDim + 60;

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - drawW) / 2;
    const offsetY = (canvas.height - drawH) / 2;

    /* Draw ratio rectangle */
    ctx.strokeStyle = '#6366f1';
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, drawW, drawH);
    ctx.fillRect(offsetX, offsetY, drawW, drawH);

    /* Draw the ratio text in center */
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ratioW + ':' + ratioH, offsetX + drawW / 2, offsetY + drawH / 2);
    ctx.textBaseline = 'alphabetic';

    /* Width label */
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(w + ' px', offsetX + drawW / 2, offsetY + drawH + 18);

    /* Height label */
    ctx.save();
    ctx.translate(offsetX - 14, offsetY + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(h + ' px', 0, 0);
    ctx.restore();
  }

  function drawPlaceholder() {
    canvas.width = 400;
    canvas.height = 300;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter dimensions to calculate aspect ratio', 200, 150);
  }

  /* ---- Event Listeners ---- */
  const debouncedCalc = Utils.debounce ? Utils.debounce(calculate, 200) : calculate;

  if (widthInput) widthInput.addEventListener('input', debouncedCalc);
  if (heightInput) heightInput.addEventListener('input', debouncedCalc);

  /* ---- Download (export ratio data as text) ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const w = parseInt(widthInput.value, 10) || 0;
    const h = parseInt(heightInput.value, 10) || 0;
    if (w <= 0 || h <= 0) {
      Utils.showToast('Enter valid dimensions first', 'warning');
      return;
    }

    const g = gcd(w, h);
    const ratioW = w / g;
    const ratioH = h / g;

    let text = `Aspect Ratio Report\n`;
    text += `===================\n`;
    text += `Dimensions: ${w} x ${h}\n`;
    text += `Aspect Ratio: ${ratioW}:${ratioH}\n`;
    text += `Decimal: ${(w / h).toFixed(4)}\n\n`;
    text += `Equivalent Sizes:\n`;
    text += `${'Width'.padEnd(10)} | ${'Height'.padEnd(10)} | Megapixels\n`;
    text += `${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(12)}\n`;

    [320, 480, 640, 720, 800, 1024, 1280, 1366, 1600, 1920, 2048, 2560, 3200, 3840, 4096].forEach(tw => {
      const th = Math.round(tw * ratioH / ratioW);
      text += `${String(tw).padEnd(10)} | ${String(th).padEnd(10)} | ${(tw * th / 1000000).toFixed(2)} MP\n`;
    });

    Utils.downloadFile(text, 'aspect-ratio-report.txt', 'text/plain');
    Utils.showToast('Report downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (widthInput) widthInput.value = 1920;
    if (heightInput) heightInput.value = 1080;
    const resultsContainer = document.getElementById('ratio-results');
    if (resultsContainer) resultsContainer.innerHTML = '';
    drawPlaceholder();
    Utils.showToast('Tool reset', 'info');
  });

  /* Run initial calculation */
  calculate();
});
