/**
 * Resizer (Percentage) — Scale images up or down by percentage
 * Controls: range#scalePercent (10-300, default 100)
 * Shows resulting dimensions; download scaled image.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');
  const scaleSlider = document.getElementById('scalePercent');
  const scaleValue = document.getElementById('scalePercent-value');
  let originalImg = null;
  let originalFilename = 'image';
  let origW = 0, origH = 0;

  /* ── Upload ── */
  function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      Utils.loadImage(e.target.result).then((img) => {
        originalImg = img;
        origW = img.naturalWidth;
        origH = img.naturalHeight;
        canvas.width = origW;
        canvas.height = origH;
        ctx.drawImage(originalImg, 0, 0);
        zone.style.display = 'none';
        document.getElementById('tool-workspace').classList.add('active');
        Utils.showToast('Image loaded!', 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  /* ── Slider → show resulting dimensions ── */
  function onSliderInput() {
    const pct = parseInt(scaleSlider?.value, 10) || 100;
    if (scaleValue) scaleValue.textContent = pct + '%';
    /* Update canvas to show scaled preview */
    if (originalImg) {
      const w = Math.round(origW * pct / 100);
      const h = Math.round(origH * pct / 100);
      const temp = Utils.resizeCanvas(Utils.imageToCanvas(originalImg), w, h);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(temp, 0, 0);
    }
  }

  if (scaleSlider) {
    scaleSlider.addEventListener('input', Utils.debounce(onSliderInput, 50));
  }

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) return;
    const pct = parseInt(scaleSlider?.value, 10) || 100;
    const w = Math.round(origW * pct / 100);
    const h = Math.round(origH * pct / 100);
    const resized = Utils.resizeCanvas(Utils.imageToCanvas(originalImg), w, h);
    Utils.downloadCanvas(resized, originalFilename, 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (scaleSlider) scaleSlider.value = 100;
    if (scaleValue) scaleValue.textContent = '100%';
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
  });

  /* ── Clipboard paste ── */
  document.addEventListener('paste', (e) => {
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
