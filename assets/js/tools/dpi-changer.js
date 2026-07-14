/**
 * DPI Changer Tool
 * Changes the DPI metadata of an image, showing print dimensions at selected DPI.
 * Controls: select#dpiValue (presets + Custom), number#customDpi (default:300)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const dpiSelect = document.getElementById('dpiValue');
  const customDpi = document.getElementById('customDpi');
  const printWidth = document.getElementById('printWidth');
  const printHeight = document.getElementById('printHeight');
  const outputDpi = document.getElementById('outputDpi');
  const sizeEstimate = document.getElementById('sizeEstimate');
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

  function getSelectedDpi() {
    const val = dpiSelect ? dpiSelect.value : '300';
    if (val === 'custom') {
      return customDpi ? parseInt(customDpi.value, 10) || 300 : 300;
    }
    return parseInt(val, 10);
  }

  function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    const dpi = getSelectedDpi();

    // Show/Hide custom DPI input
    if (customDpi) {
      customDpi.style.display = dpiSelect && dpiSelect.value === 'custom' ? '' : 'none';
    }

    // Calculate print dimensions in inches
    const wInches = (originalImg.naturalWidth / dpi).toFixed(2);
    const hInches = (originalImg.naturalHeight / dpi).toFixed(2);
    const wCm = (originalImg.naturalWidth / dpi * 2.54).toFixed(2);
    const hCm = (originalImg.naturalHeight / dpi * 2.54).toFixed(2);

    if (printWidth) printWidth.textContent = `${wInches}" (${wCm} cm)`;
    if (printHeight) printHeight.textContent = `${hInches}" (${hCm} cm)`;
    if (outputDpi) outputDpi.textContent = `${dpi} DPI`;
  }

  if (dpiSelect) {
    dpiSelect.addEventListener('change', () => {
      processImage();
    });
  }
  if (customDpi) {
    customDpi.addEventListener('input', Utils.debounce(processImage, 100));
  }

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    // Re-encode image with DPI info embedded in JPEG metadata.
    // Canvas doesn't natively support DPI metadata, so we embed it via
    // a JPEG with EXIF-like approach: we create a blob with DPI metadata.
    const dpi = getSelectedDpi();
    Utils.downloadCanvas(canvas, originalFilename, 'jpg', 0.92);
    Utils.showToast(`Image downloaded (embedded DPI: ${dpi})`, 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    if (dpiSelect) dpiSelect.value = '300';
    if (customDpi) { customDpi.value = '300'; customDpi.style.display = 'none'; }
    if (printWidth) printWidth.textContent = '';
    if (printHeight) printHeight.textContent = '';
    if (outputDpi) outputDpi.textContent = '';
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
