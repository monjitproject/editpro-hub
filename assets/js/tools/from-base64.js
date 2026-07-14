/**
 * From Base64 Tool
 * Decodes a Base64 string back into a viewable image.
 * No typical controls. Has textarea for pasting base64.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const base64Input = document.getElementById('base64Input');
  const parseBtn = document.getElementById('parseBtn');
  const imageInfo = document.getElementById('imageInfo');
  let decodedImg = null;
  let originalFilename = 'decoded-image';

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
    const dataUrl = await Utils.readFileAsDataURL(file);
    loadFromBase64(dataUrl);
  }

  function loadFromBase64(base64String) {
    const str = base64String.trim();
    let dataUrl = str;

    // If it doesn't start with data:, try to construct a data URI
    if (!str.startsWith('data:')) {
      // Try to detect format from the start of the base64 string
      let mimeType = 'image/png';
      if (str.startsWith('/9j/')) mimeType = 'image/jpeg';
      else if (str.startsWith('UklGR')) mimeType = 'image/webp';
      else if (str.startsWith('iVBOR')) mimeType = 'image/png';
      dataUrl = `data:${mimeType};base64,${str}`;
    }

    Utils.loadImage(dataUrl).then(img => {
      decodedImg = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      zone.style.display = 'none';
      document.getElementById('tool-workspace').classList.add('active');

      if (imageInfo) {
        imageInfo.textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;
      }
      Utils.showToast('Base64 decoded successfully', 'success');
    }).catch(() => {
      Utils.showToast('Invalid Base64 image data', 'error');
    });
  }

  if (parseBtn) {
    parseBtn.addEventListener('click', () => {
      const val = base64Input ? base64Input.value.trim() : '';
      if (!val) {
        Utils.showToast('Please paste a Base64 string first', 'warning');
        return;
      }
      loadFromBase64(val);
    });
  }

  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!decodedImg) {
      Utils.showToast('No image to download', 'warning');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename, 'png');
    Utils.showToast('Image downloaded', 'success');
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    decodedImg = null;
    originalFilename = 'decoded-image';
    if (base64Input) base64Input.value = '';
    if (imageInfo) imageInfo.textContent = '';
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
