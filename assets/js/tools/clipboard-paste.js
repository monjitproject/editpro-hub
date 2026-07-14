/**
 * Clipboard Paste Image Tool
 * Image tool focused on clipboard. Has the upload-zone but also prominently
 * shows "Paste image here (Ctrl+V)" instructions. Listens for paste events.
 * Displays the pasted image. Allows basic edits (format conversion for download).
 * Controls: select for output format (PNG/JPEG/WEBP), download button.
 * Shows "Images pasted from clipboard" count.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');
  let originalImg = null;
  let originalFilename = 'clipboard-image';
  let pasteCount = 0;

  /* Output format select - create if not in DOM */
  let formatSelect = document.getElementById('clipFormat');
  if (!formatSelect && workspace) {
    /* Look for a controls panel and inject the format select */
    const controlsPanel = workspace.querySelector('.controls-panel');
    if (controlsPanel) {
      const group = document.createElement('div');
      group.className = 'control-group';
      group.innerHTML = `
        <label>Output Format</label>
        <select id="clipFormat">
          <option value="PNG">PNG</option>
          <option value="JPEG">JPEG</option>
          <option value="WEBP">WEBP</option>
        </select>`;
      controlsPanel.insertBefore(group, controlsPanel.querySelector('.tool-actions'));
      formatSelect = document.getElementById('clipFormat');
    }
  }

  /* Create paste counter display if not in DOM */
  let counterDisplay = document.getElementById('paste-counter');
  if (!counterDisplay && workspace) {
    counterDisplay = document.createElement('div');
    counterDisplay.id = 'paste-counter';
    counterDisplay.style.cssText = 'text-align:center;padding:var(--space-2);font-size:var(--text-sm);color:var(--text-muted);';
    counterDisplay.textContent = 'Images pasted from clipboard: 0';
    const controlsPanel = workspace.querySelector('.controls-panel');
    if (controlsPanel) {
      controlsPanel.insertBefore(counterDisplay, controlsPanel.querySelector('.tool-actions'));
    }
  }

  /* ---- Upload Zone ---- */
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
    if (workspace) workspace.classList.add('active');
    updateImageInfo();
  }

  function updateImageInfo() {
    if (!originalImg) return;
    /* Update any info displays */
    const infoEl = document.getElementById('clip-info');
    if (infoEl) {
      infoEl.textContent = `${originalImg.naturalWidth} x ${originalImg.naturalHeight}px | ${originalFilename}`;
    }
  }

  /* ---- Clipboard Paste ---- */
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        handleFile(blob);
        pasteCount++;
        if (counterDisplay) {
          counterDisplay.textContent = `Images pasted from clipboard: ${pasteCount}`;
        }
        Utils.showToast(`Image pasted from clipboard (${pasteCount} total)`, 'success');
        break;
      }
    }
  });

  /* ---- Also listen for drag/paste on the whole document when workspace is visible ---- */
  document.addEventListener('dragover', e => {
    e.preventDefault();
  });

  document.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });

  /* ---- Format Conversion for Download ---- */
  function getMimeType(format) {
    const map = { PNG: 'image/png', JPEG: 'image/jpeg', WEBP: 'image/webp' };
    return map[format] || 'image/png';
  }

  function getExt(format) {
    return format.toLowerCase();
  }

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', async () => {
    if (!originalImg) {
      Utils.showToast('Please paste or upload an image first', 'warning');
      return;
    }
    const format = formatSelect ? formatSelect.value : 'PNG';
    const mime = getMimeType(format);
    const quality = format === 'PNG' ? undefined : 0.92;

    /* Re-draw and download */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    Utils.downloadCanvas(canvas, originalFilename, getExt(format), quality);
    Utils.showToast(`Image downloaded as ${format}`, 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'clipboard-image';
    pasteCount = 0;
    canvas.width = 0;
    canvas.height = 0;
    if (formatSelect) formatSelect.value = 'PNG';
    if (counterDisplay) counterDisplay.textContent = 'Images pasted from clipboard: 0';
    zone.style.display = '';
    if (workspace) workspace.classList.remove('active');
    Utils.showToast('Tool reset', 'info');
  });
});
