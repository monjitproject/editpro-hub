/**
 * Pixel to Unit Converter
 * No image upload. Converter tool.
 * Controls: number#pxValue (100), number#converterDpi (96)
 * Convert pixels to inches, cm, mm, points, picas at the given DPI.
 * Show all conversions in a clear table. Allow entering in any unit
 * and converting back to pixels.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const pxValueInput = document.getElementById('pxValue');
  const dpiInput = document.getElementById('converterDpi');

  /* Hide upload zone, show workspace immediately */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* Initial canvas */
  canvas.width = 400;
  canvas.height = 300;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#999';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter a pixel value and DPI to convert', 200, 150);

  /* Conversion constants (based on DPI) */
  function pxToInches(px, dpi) { return px / dpi; }
  function pxToCm(px, dpi) { return (px / dpi) * 2.54; }
  function pxToMm(px, dpi) { return (px / dpi) * 25.4; }
  function pxToPoints(px, dpi) { return (px / dpi) * 72; }
  function pxToPicas(px, dpi) { return (px / dpi) * 6; }

  function inchesToPx(inches, dpi) { return Math.round(inches * dpi); }
  function cmToPx(cm, dpi) { return Math.round((cm / 2.54) * dpi); }
  function mmToPx(mm, dpi) { return Math.round((mm / 25.4) * dpi); }
  function pointsToPx(pt, dpi) { return Math.round((pt / 72) * dpi); }
  function picasToPx(pc, dpi) { return Math.round((pc / 6) * dpi); }

  function formatNum(n) {
    if (Math.abs(n) >= 1000) return n.toFixed(1);
    if (Math.abs(n) >= 100) return n.toFixed(2);
    if (Math.abs(n) >= 10) return n.toFixed(3);
    return n.toFixed(4);
  }

  function calculate() {
    const px = parseFloat(pxValueInput.value) || 0;
    const dpi = parseFloat(dpiInput.value) || 96;

    if (px <= 0) {
      renderResults(null);
      return;
    }

    const inches = pxToInches(px, dpi);
    const cm = pxToCm(px, dpi);
    const mm = pxToMm(px, dpi);
    const points = pxToPoints(px, dpi);
    const picas = pxToPicas(px, dpi);

    renderResults({ px, dpi, inches, cm, mm, points, picas });
  }

  function renderResults(data) {
    const resultsContainer = document.getElementById('converter-results');
    if (!resultsContainer) return;

    if (!data) {
      resultsContainer.innerHTML = `
        <div style="text-align:center;padding:var(--space-6);color:var(--text-muted);">
          <p>Enter a pixel value greater than 0 to see conversions.</p>
        </div>`;
      drawVisual(null);
      return;
    }

    let html = `
      <div style="text-align:center;margin-bottom:var(--space-4);">
        <div style="font-size:1.5em;font-weight:700;color:var(--accent, #6366f1);">${data.px} px</div>
        <div style="font-size:var(--text-sm);color:var(--text-muted);">at ${data.dpi} DPI</div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);margin-bottom:var(--space-4);">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:8px 12px;background:var(--bg-secondary);">Unit</th>
            <th style="text-align:right;padding:8px 12px;background:var(--bg-secondary);">Value</th>
            <th style="text-align:left;padding:8px 12px;background:var(--bg-secondary);">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border);background:var(--bg-secondary);">
            <td style="padding:8px 12px;font-weight:600;">Pixels</td>
            <td style="text-align:right;padding:8px 12px;font-weight:700;">${data.px}</td>
            <td style="padding:8px 12px;color:var(--text-muted);">Input value</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">Inches</td>
            <td style="text-align:right;padding:8px 12px;">${formatNum(data.inches)} in</td>
            <td style="padding:8px 12px;color:var(--text-muted);">1 inch = ${data.dpi} px at ${data.dpi} DPI</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">Centimeters</td>
            <td style="text-align:right;padding:8px 12px;">${formatNum(data.cm)} cm</td>
            <td style="padding:8px 12px;color:var(--text-muted);">1 cm = ${(data.dpi / 2.54).toFixed(1)} px at ${data.dpi} DPI</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">Millimeters</td>
            <td style="text-align:right;padding:8px 12px;">${formatNum(data.mm)} mm</td>
            <td style="padding:8px 12px;color:var(--text-muted);">1 mm = ${(data.dpi / 25.4).toFixed(2)} px at ${data.dpi} DPI</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">Points</td>
            <td style="text-align:right;padding:8px 12px;">${formatNum(data.points)} pt</td>
            <td style="padding:8px 12px;color:var(--text-muted);">1 pt = 1/72 inch</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:8px 12px;font-weight:600;">Picas</td>
            <td style="text-align:right;padding:8px 12px;">${formatNum(data.picas)} pc</td>
            <td style="padding:8px 12px;color:var(--text-muted);">1 pica = 12 pt = 1/6 inch</td>
          </tr>
        </tbody>
      </table>

      <h4 style="margin:var(--space-3) 0 var(--space-2);">Reverse Conversion (Any Unit to Pixels)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:var(--space-3);">`;

    const reverseConversions = [
      { unit: 'Inches', value: formatNum(data.inches) + ' in', px: data.px },
      { unit: 'Centimeters', value: formatNum(data.cm) + ' cm', px: data.px },
      { unit: 'Millimeters', value: formatNum(data.mm) + ' mm', px: data.px },
      { unit: 'Points', value: formatNum(data.points) + ' pt', px: data.px },
      { unit: 'Picas', value: formatNum(data.picas) + ' pc', px: data.px }
    ];

    for (const conv of reverseConversions) {
      html += `<div style="padding:8px;border:1px solid var(--border);border-radius:6px;text-align:center;">
        <div style="font-size:var(--text-xs);color:var(--text-muted);">${conv.unit}</div>
        <div style="font-weight:600;">${conv.value}</div>
        <div style="font-size:var(--text-xs);color:var(--accent, #6366f1);">= ${conv.px} px</div>
      </div>`;
    }

    html += `</div>

      <h4 style="margin:var(--space-3) 0 var(--space-2);">Common DPI Presets</h4>
      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:6px 12px;background:var(--bg-secondary);">DPI</th>
            <th style="text-align:left;padding:6px 12px;background:var(--bg-secondary);">Use Case</th>
            <th style="text-align:right;padding:6px 12px;background:var(--bg-secondary);">${data.px} px =</th>
          </tr>
        </thead>
        <tbody>`;

    const presets = [
      { dpi: 72, label: 'Standard web / macOS' },
      { dpi: 96, label: 'Standard web (Windows)' },
      { dpi: 150, label: 'Draft print' },
      { dpi: 300, label: 'Standard print (photos)' },
      { dpi: 600, label: 'High-quality print' },
      { dpi: 1200, label: 'Professional print / offset' }
    ];

    for (const preset of presets) {
      const inchesVal = pxToInches(data.px, preset.dpi);
      const cmVal = pxToCm(data.px, preset.dpi);
      html += `<tr style="border-bottom:1px solid var(--border);${preset.dpi === data.dpi ? 'background:var(--bg-secondary);font-weight:600;' : ''}">
        <td style="padding:5px 12px;">${preset.dpi} DPI</td>
        <td style="padding:5px 12px;color:var(--text-secondary);">${preset.label}</td>
        <td style="text-align:right;padding:5px 12px;">${formatNum(inchesVal)} in / ${formatNum(cmVal)} cm</td>
      </tr>`;
    }

    html += '</tbody></table>';

    resultsContainer.innerHTML = html;

    /* Draw visual */
    drawVisual(data);
  }

  function drawVisual(data) {
    if (!data) {
      canvas.width = 400;
      canvas.height = 300;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter a pixel value and DPI to convert', 200, 150);
      return;
    }

    const maxBarWidth = 340;
    const barHeight = 40;

    canvas.width = 400;
    canvas.height = 200;

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Draw pixel bar */
    const barWidth = Math.min(maxBarWidth, Math.max(20, (data.px / 2000) * maxBarWidth));

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fillRect(30, 30, maxBarWidth, barHeight);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, maxBarWidth, barHeight);

    ctx.fillStyle = '#6366f1';
    ctx.fillRect(30, 30, barWidth, barHeight);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.px + ' px', 30 + barWidth / 2, 56);

    /* Labels */
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'left';
    ctx.fillText(`= ${formatNum(data.inches)} inches`, 30, 100);
    ctx.fillText(`= ${formatNum(data.cm)} cm`, 30, 120);
    ctx.fillText(`= ${formatNum(data.mm)} mm`, 220, 100);
    ctx.fillText(`= ${formatNum(data.points)} points`, 220, 120);

    /* DPI indicator */
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.fillText(`at ${data.dpi} DPI`, canvas.width / 2, 160);
  }

  /* ---- Event Listeners ---- */
  const debouncedCalc = Utils.debounce ? Utils.debounce(calculate, 200) : calculate;

  if (pxValueInput) pxValueInput.addEventListener('input', debouncedCalc);
  if (dpiInput) dpiInput.addEventListener('input', debouncedCalc);

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const px = parseFloat(pxValueInput.value) || 0;
    const dpi = parseFloat(dpiInput.value) || 96;
    if (px <= 0) {
      Utils.showToast('Enter a pixel value first', 'warning');
      return;
    }

    let text = `Pixel Conversion Report\n`;
    text += `========================\n`;
    text += `Input: ${px} pixels at ${dpi} DPI\n\n`;
    text += `Conversions:\n`;
    text += `  Inches:  ${formatNum(pxToInches(px, dpi))} in\n`;
    text += `  CM:      ${formatNum(pxToCm(px, dpi))} cm\n`;
    text += `  MM:      ${formatNum(pxToMm(px, dpi))} mm\n`;
    text += `  Points:  ${formatNum(pxToPoints(px, dpi))} pt\n`;
    text += `  Picas:   ${formatNum(pxToPicas(px, dpi))} pc\n\n`;
    text += `Common DPI presets:\n`;
    [72, 96, 150, 300, 600, 1200].forEach(d => {
      text += `  ${d} DPI: ${formatNum(pxToInches(px, d))} in / ${formatNum(pxToCm(px, d))} cm\n`;
    });

    Utils.downloadFile(text, 'pixel-conversion.txt', 'text/plain');
    Utils.showToast('Conversion report downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (pxValueInput) pxValueInput.value = 100;
    if (dpiInput) dpiInput.value = 96;
    const resultsContainer = document.getElementById('converter-results');
    if (resultsContainer) resultsContainer.innerHTML = '';
    canvas.width = 400;
    canvas.height = 300;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter a pixel value and DPI to convert', 200, 150);
    Utils.showToast('Tool reset', 'info');
  });

  /* Run initial calculation */
  calculate();
});
