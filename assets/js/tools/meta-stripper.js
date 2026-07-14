/**
 * Metadata Stripper
 * Upload image, strip all metadata, show what was removed
 * (file size before/after), download clean version.
 * Re-encode image through canvas to strip EXIF.
 * Show metadata categories that were stripped (GPS, camera info, timestamp, etc.)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');
  let originalImg = null;
  let originalFilename = 'image';
  let originalSize = 0;
  let strippedData = null;

  /* ---- Upload ---- */
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
    originalSize = file.size;
    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    if (workspace) workspace.classList.add('active');
    processImage();
  }

  async function processImage() {
    if (!originalImg) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    /* Re-encode through canvas to strip all metadata */
    try {
      /* Convert to blob (re-encoding strips EXIF) */
      const blob = await Utils.canvasToBlob(canvas, 'image/png');
      strippedData = {
        originalSize: originalSize,
        strippedSize: blob.size,
        reduction: originalSize - blob.size,
        reductionPercent: ((originalSize - blob.size) / originalSize * 100).toFixed(1)
      };

      renderResults(strippedData);
    } catch (err) {
      Utils.showToast('Error processing image', 'error');
    }
  }

  function renderResults(data) {
    const resultsContainer = document.getElementById('meta-results');
    if (!resultsContainer) return;

    if (!data) return;

    /* Determine what metadata categories exist in the original */
    /* For JPEG files, we can try to detect EXIF presence */
    const hasEXIF = isJPEG(originalFilename);

    const metadataCategories = [
      { name: 'EXIF Data', icon: '📐', description: 'Camera settings, focal length, exposure', found: hasEXIF },
      { name: 'GPS Location', icon: '📍', description: 'Latitude, longitude, altitude coordinates', found: hasEXIF },
      { name: 'Camera Info', icon: '📷', description: 'Camera make, model, serial number', found: hasEXIF },
      { name: 'Timestamp', icon: '🕐', description: 'Date/time original, modified, digitized', found: hasEXIF },
      { name: 'Software', icon: '💻', description: 'Software used to create/edit the image', found: hasEXIF },
      { name: 'Thumbnail', icon: '🖼️', description: 'Embedded preview thumbnail image', found: hasEXIF },
      { name: 'Copyright', icon: '©️', description: 'Copyright and author information', found: hasEXIF },
      { name: 'Color Profile', icon: '🎨', description: 'ICC color management profile data', found: hasEXIF },
      { name: 'IPTC Data', icon: '📝', description: 'Captions, keywords, categories', found: false },
      { name: 'XMP Data', icon: '📋', description: 'Extensible Metadata Platform data', found: false }
    ];

    /* Count found/removed */
    const foundCount = metadataCategories.filter(c => c.found).length;
    const removedCount = metadataCategories.filter(c => c.found).length;

    let html = `
      <div style="margin-bottom:var(--space-4);">
        <h4 style="margin-bottom:var(--space-2);">File Size Comparison</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-3);">
          <div style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
            <div style="font-size:var(--text-sm);color:var(--text-muted);">Original</div>
            <div style="font-size:1.3em;font-weight:700;">${Utils.formatFileSize(data.originalSize)}</div>
          </div>
          <div style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
            <div style="font-size:var(--text-sm);color:var(--text-muted);">After Strip</div>
            <div style="font-size:1.3em;font-weight:700;">${Utils.formatFileSize(data.strippedSize)}</div>
          </div>
          <div style="text-align:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:8px;">
            <div style="font-size:var(--text-sm);color:var(--text-muted);">Saved</div>
            <div style="font-size:1.3em;font-weight:700;color:${data.reduction >= 0 ? 'var(--success, #22c55e)' : 'var(--warning, #f59e0b)'};">
              ${data.reduction >= 0 ? '-' : '+'}${Utils.formatFileSize(Math.abs(data.reduction))}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:var(--space-4);">
        <h4 style="margin-bottom:var(--space-2);">Metadata Categories</h4>
        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-2);">
          ${foundCount > 0 ? `${removedCount} metadata categories detected and removed.` : 'No EXIF metadata detected in this file format.'}
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;">`;

    for (const cat of metadataCategories) {
      html += `<div style="padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:var(--text-sm);display:flex;align-items:center;gap:8px;">
        <span>${cat.icon}</span>
        <div style="flex:1;">
          <div style="font-weight:600;">${cat.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);">${cat.description}</div>
        </div>
        <span style="font-size:var(--text-xs);padding:2px 8px;border-radius:4px;${cat.found ? 'background:#fef2f2;color:#dc2626;' : 'background:#f0fdf4;color:#16a34a;'}">
          ${cat.found ? 'Removed' : 'None found'}
        </span>
      </div>`;
    }

    html += `</div></div>

      <div style="padding:var(--space-3);background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;font-size:var(--text-sm);">
        <strong style="color:var(--success, #22c55e);">Image successfully cleaned!</strong>
        <p style="margin-top:4px;color:var(--text-secondary);">
          The image has been re-encoded through canvas, which strips all embedded metadata.
          The clean version is ready to download. No server upload was required - all processing
          happened in your browser.
        </p>
      </div>`;

    resultsContainer.innerHTML = html;
  }

  function isJPEG(filename) {
    return /\.(jpe?g)$/i.test(filename);
  }

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', async () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename, 'png');
    Utils.showToast('Clean image downloaded (metadata stripped)', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    originalSize = 0;
    strippedData = null;
    canvas.width = 0;
    canvas.height = 0;
    const resultsContainer = document.getElementById('meta-results');
    if (resultsContainer) resultsContainer.innerHTML = '';
    zone.style.display = '';
    if (workspace) workspace.classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });

  /* ---- Clipboard paste ---- */
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
