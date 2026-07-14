/**
 * To Base64 Tool
 * Converts an image to a Base64 data URI string.
 * Controls: toggle#dataUriPrefix (default: true)
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const dataUriPrefix = document.getElementById('dataUriPrefix');
  const base64Output = document.getElementById('base64Output');
  const charCount = document.getElementById('charCount');
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

  async function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    try {
      const blob = await Utils.canvasToBlob(canvas, 'image/png');
      const reader = new FileReader();
      reader.onload = () => {
        let result = reader.result;
        if (dataUriPrefix && !dataUriPrefix.checked) {
          // Remove data URI prefix, keep only raw base64
          result = result.split(',')[1] || result;
        }
        if (base64Output) {
          base64Output.value = result;
          base64Output.rows = 8;
        }
        if (charCount) {
          charCount.textContent = `${result.length.toLocaleString()} characters`;
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Utils.showToast('Failed to generate Base64', 'error');
    }
  }

  if (dataUriPrefix) {
    dataUriPrefix.addEventListener('change', processImage);
  }

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!base64Output || !base64Output.value) {
      Utils.showToast('No Base64 data to copy', 'warning');
      return;
    }
    // Copy to clipboard
    base64Output.select();
    navigator.clipboard.writeText(base64Output.value).then(() => {
      Utils.showToast('Base64 copied to clipboard', 'success');
    }).catch(() => {
      document.execCommand('copy');
      Utils.showToast('Base64 copied to clipboard', 'success');
    });
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    if (base64Output) base64Output.value = '';
    if (charCount) charCount.textContent = '';
    if (dataUriPrefix) dataUriPrefix.checked = true;
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
