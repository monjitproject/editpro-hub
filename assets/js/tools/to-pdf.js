/**
 * To PDF Tool
 * Converts an image into a downloadable PDF-like page (via print or image download).
 * Controls: select#pdfPageSize (A4/Letter/Legal/Fit to Image), select#pdfOrientation (Auto/Portrait/Landscape)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const pdfPageSize = document.getElementById('pdfPageSize');
  const pdfOrientation = document.getElementById('pdfOrientation');
  const pageInfo = document.getElementById('pageInfo');
  let originalImg = null;
  let originalFilename = 'image';

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
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  function getDimensions(size, orientation) {
    const sizes = {
      A4: { w: 595, h: 842 },
      Letter: { w: 612, h: 792 },
      Legal: { w: 612, h: 1008 },
      'Fit to Image': null
    };

    if (size === 'Fit to Image' && originalImg) {
      return { w: originalImg.naturalWidth, h: originalImg.naturalHeight };
    }

    let dims = sizes[size] || sizes.A4;

    // Handle orientation
    if (orientation === 'Portrait') {
      return { w: Math.min(dims.w, dims.h), h: Math.max(dims.w, dims.h) };
    } else if (orientation === 'Landscape') {
      return { w: Math.max(dims.w, dims.h), h: Math.min(dims.w, dims.h) };
    }
    // Auto: match image orientation if possible
    if (originalImg) {
      if (originalImg.naturalWidth >= originalImg.naturalHeight) {
        return { w: Math.max(dims.w, dims.h), h: Math.min(dims.w, dims.h) };
      }
    }
    return dims;
  }

  function processImage() {
    if (!originalImg) return;

    const sizeVal = pdfPageSize ? pdfPageSize.value : 'A4';
    const orientVal = pdfOrientation ? pdfOrientation.value : 'Auto';
    const dims = getDimensions(sizeVal, orientVal);

    canvas.width = dims.w;
    canvas.height = dims.h;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dims.w, dims.h);

    // Fit the image within the page dimensions
    const imgW = originalImg.naturalWidth;
    const imgH = originalImg.naturalHeight;
    const scale = Math.min(dims.w / imgW, dims.h / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (dims.w - drawW) / 2;
    const drawY = (dims.h - drawH) / 2;

    ctx.drawImage(originalImg, drawX, drawY, drawW, drawH);

    if (pageInfo) {
      pageInfo.textContent = `${dims.w} × ${dims.h} pt — ${sizeVal} ${orientVal}`;
    }
  }

  if (pdfPageSize) pdfPageSize.addEventListener('change', processImage);
  if (pdfOrientation) pdfOrientation.addEventListener('change', processImage);

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }

    // Create an HTML page that opens a print dialog for PDF saving
    const imgDataUrl = canvas.toDataURL('image/png');
    const sizeVal = pdfPageSize ? pdfPageSize.value : 'A4';
    const orientVal = pdfOrientation ? pdfOrientation.value : 'Auto';

    const sizes = {
      A4: { w: '210mm', h: '297mm' },
      Letter: { w: '216mm', h: '279mm' },
      Legal: { w: '216mm', h: '356mm' },
      'Fit to Image': { w: '100%', h: '100%' }
    };
    const dims = sizes[sizeVal] || sizes.A4;
    const isLandscape = orientVal === 'Landscape' || (orientVal === 'Auto' && originalImg.naturalWidth > originalImg.naturalHeight);

    const printHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${originalFilename} - PDF</title>
<style>
  @page { size: ${isLandscape ? dims.h + ' ' + dims.w : dims.w + ' ' + dims.h}; margin: 0; }
  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #e0e0e0; }
  img { max-width: 100%; max-height: 100vh; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
  @media print { body { background: white; } img { box-shadow: none; max-height: 100vh; max-width: 100vw; } }
</style>
</head>
<body>
<img src="${imgDataUrl}" onload="window.print();window.onafterprint=()=>window.close();">
</body>
</html>`;

    const blob = new Blob([printHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      Utils.showToast('Pop-up blocked. Please allow pop-ups.', 'warning');
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    if (pdfPageSize) pdfPageSize.value = 'A4';
    if (pdfOrientation) pdfOrientation.value = 'Auto';
    if (pageInfo) pageInfo.textContent = '';
    canvas.width = 0;
    canvas.height = 0;
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });

  document.addEventListener('paste', e => {
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
