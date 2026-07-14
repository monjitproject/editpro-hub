/**
 * Favicon Generator Tool
 * Generates multiple favicon sizes from a single image.
 * Controls: toggle#includeIco (default:false), color#faviconBg (default:#ffffff)
 * Generates sizes: 16, 32, 48, 64, 128, 180, 192px
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const includeIco = document.getElementById('includeIco');
  const faviconBg = document.getElementById('faviconBg');
  const sizePreview = document.getElementById('sizePreview');
  let originalImg = null;
  let originalFilename = 'favicon';

  const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192];

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

  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);
    updatePreview();
  }

  function updatePreview() {
    if (!sizePreview || !originalImg) return;
    sizePreview.innerHTML = '';
    const background = faviconBg ? faviconBg.value : '#ffffff';

    FAVICON_SIZES.forEach(size => {
      const item = document.createElement('div');
      item.className = 'favicon-preview-item';

      const c = Utils.createCanvas(size, size);
      const cctx = c.getContext('2d');

      // Draw background
      cctx.fillStyle = background;
      cctx.fillRect(0, 0, size, size);

      // Draw image centered and scaled to fit
      const scale = Math.min(size / originalImg.naturalWidth, size / originalImg.naturalHeight);
      const drawW = originalImg.naturalWidth * scale;
      const drawH = originalImg.naturalHeight * scale;
      const drawX = (size - drawW) / 2;
      const drawY = (size - drawH) / 2;
      cctx.imageSmoothingEnabled = true;
      cctx.imageSmoothingQuality = 'high';
      cctx.drawImage(originalImg, drawX, drawY, drawW, drawH);

      const imgEl = document.createElement('img');
      imgEl.src = c.toDataURL('image/png');
      imgEl.width = Math.min(size, 96);
      imgEl.height = Math.min(size, 96);
      imgEl.style.imageRendering = 'auto';

      const label = document.createElement('span');
      label.textContent = `${size}×${size}`;
      label.className = 'favicon-size-label';

      item.appendChild(imgEl);
      item.appendChild(label);
      sizePreview.appendChild(item);
    });
  }

  function generateFavicon(size) {
    if (!originalImg) return null;
    const c = Utils.createCanvas(size, size);
    const cctx = c.getContext('2d');
    const background = faviconBg ? faviconBg.value : '#ffffff';

    cctx.fillStyle = background;
    cctx.fillRect(0, 0, size, size);

    const scale = Math.min(size / originalImg.naturalWidth, size / originalImg.naturalHeight);
    const drawW = originalImg.naturalWidth * scale;
    const drawH = originalImg.naturalHeight * scale;
    const drawX = (size - drawW) / 2;
    const drawY = (size - drawH) / 2;
    cctx.imageSmoothingEnabled = true;
    cctx.imageSmoothingQuality = 'high';
    cctx.drawImage(originalImg, drawX, drawY, drawW, drawH);

    return c;
  }

  function downloadSingleSize(size) {
    const c = generateFavicon(size);
    if (!c) return;
    Utils.downloadCanvas(c, `${originalFilename}-${size}x${size}`, 'png');
  }

  if (faviconBg) faviconBg.addEventListener('input', () => {
    processImage();
  });

  if (includeIco) {
    includeIco.addEventListener('change', () => {
      // No extra behavior needed; the download handler checks the toggle
    });
  }

  document.getElementById('download-btn')?.addEventListener('click', async () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }

    // Download all sizes individually (no built-in zip in browser JS without a library)
    // We download each size as a separate PNG
    for (const size of FAVICON_SIZES) {
      downloadSingleSize(size);
      // Small delay between downloads to avoid browser throttling
      await new Promise(r => setTimeout(r, 200));
    }

    // If ICO is requested, generate a multi-size ICO
    // Modern browsers can't create .ico natively, so we create an HTML page
    // that embeds the favicon as a data URI for the user to right-click save.
    if (includeIco && includeIco.checked) {
      const mainC = generateFavicon(32);
      if (mainC) {
        const dataUrl = mainC.toDataURL('image/png');
        const icoHtml = `<!DOCTYPE html>
<html><head><title>Favicon - ${originalFilename}</title>
<link rel="icon" href="${dataUrl}">
<style>
body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
h2 { margin-bottom: 8px; }
p { color: #666; font-size: 14px; }
.fav { display: inline-block; margin: 8px; text-align: center; }
.fav img { border: 1px solid #ddd; border-radius: 4px; }
.fav small { display: block; margin-top: 4px; color: #888; }
</style></head>
<body>
<h2>Favicon Download</h2>
<p>Right-click each image and "Save as..." to download individual sizes.</p>
<div>`;
        FAVICON_SIZES.forEach(size => {
          const c = generateFavicon(size);
          if (c) {
            const url = c.toDataURL('image/png');
            icoHtml += `<div class="fav"><img src="${url}" width="${Math.min(size, 96)}" height="${Math.min(size, 96)}"><small>${size}x${size}</small></div>`;
          }
        });
        icoHtml += `</div></body></html>`;

        const blob = new Blob([icoHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    }

    Utils.showToast('All favicon sizes generated', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'favicon';
    if (includeIco) includeIco.checked = false;
    if (faviconBg) faviconBg.value = '#ffffff';
    if (sizePreview) sizePreview.innerHTML = '';
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
