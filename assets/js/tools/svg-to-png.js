/**
 * SVG to PNG Converter
 * Renders SVG strings at chosen sizes and exports as PNG.
 * Controls: number#svgWidth (default:512), number#svgHeight (default:512), select#svgScale (1x/2x/3x/4x)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const svgTextarea = document.getElementById('svgInput');
  const renderBtn = document.getElementById('renderSvgBtn');
  const svgWidth = document.getElementById('svgWidth');
  const svgHeight = document.getElementById('svgHeight');
  const svgScale = document.getElementById('svgScale');
  const previewInfo = document.getElementById('previewInfo');
  let renderedCanvas = null;
  let originalFilename = 'svg-to-png';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      input.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
      });
    }
  }

  async function handleFile(file) {
    // Support .svg files
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      originalFilename = file.name.replace(/\.[^.]+$/, '');
      const text = await file.text();
      if (svgTextarea) svgTextarea.value = text;
      Utils.showToast('SVG loaded, click "Render" to convert', 'info');
      return;
    }
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
  }

  let originalImg = null;

  function renderSvg() {
    const svgText = svgTextarea ? svgTextarea.value.trim() : '';
    if (!svgText) {
      Utils.showToast('Please paste SVG markup', 'warning');
      return;
    }

    const width = svgWidth ? parseInt(svgWidth.value, 10) || 512 : 512;
    const height = svgHeight ? parseInt(svgHeight.value, 10) || 512 : 512;
    const scale = svgScale ? parseFloat(svgScale.value) || 1 : 1;
    const scaledW = Math.round(width * scale);
    const scaledH = Math.round(height * scale);

    // Create a blob URL from the SVG text
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    Utils.loadImage(url).then(img => {
      renderedCanvas = Utils.createCanvas(scaledW, scaledH);
      const rctx = renderedCanvas.getContext('2d');
      rctx.clearRect(0, 0, scaledW, scaledH);
      rctx.drawImage(img, 0, 0, scaledW, scaledH);
      URL.revokeObjectURL(url);

      // Show in preview
      canvas.width = scaledW;
      canvas.height = scaledH;
      ctx.clearRect(0, 0, scaledW, scaledH);
      ctx.drawImage(renderedCanvas, 0, 0);

      zone.style.display = 'none';
      document.getElementById('tool-workspace').classList.add('active');

      if (previewInfo) {
        previewInfo.textContent = `${scaledW} × ${scaledH} px (${scale}x scale)`;
      }
      Utils.showToast('SVG rendered successfully', 'success');
    }).catch(() => {
      URL.revokeObjectURL(url);
      Utils.showToast('Failed to render SVG. Check the markup.', 'error');
    });
  }

  if (renderBtn) renderBtn.addEventListener('click', renderSvg);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!renderedCanvas) {
      Utils.showToast('Please render an SVG first', 'warning');
      return;
    }
    const scale = svgScale ? parseFloat(svgScale.value) || 1 : 1;
    const suffix = scale > 1 ? `@${scale}x` : '';
    Utils.downloadCanvas(renderedCanvas, `${originalFilename}${suffix}`, 'png');
    Utils.showToast('PNG downloaded', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    renderedCanvas = null;
    originalImg = null;
    originalFilename = 'svg-to-png';
    if (svgTextarea) svgTextarea.value = '';
    if (svgWidth) svgWidth.value = '512';
    if (svgHeight) svgHeight.value = '512';
    if (svgScale) svgScale.value = '1';
    if (previewInfo) previewInfo.textContent = '';
    canvas.width = 0;
    canvas.height = 0;
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });
});
