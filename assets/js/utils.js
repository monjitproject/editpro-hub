/* ============================================
   EditPro Hub — Shared Utility Functions
   ============================================ */

const Utils = (() => {
  /* ---------- Toast Notifications ---------- */
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  }

  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }

  /* ---------- File Handling ---------- */
  function createFileInput(accept, multiple = false, onChange) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    input.addEventListener('change', (e) => onChange(e.target.files));
    document.body.appendChild(input);
    return input;
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      if (src instanceof Blob) {
        img.src = URL.createObjectURL(src);
      } else {
        img.src = src;
      }
    });
  }

  function isImageFile(file) {
    return file && file.type.startsWith('image/');
  }

  function validateImageFile(file, maxSizeMB = 50) {
    if (!file) {
      showToast('Please select a file', 'error');
      return false;
    }
    if (!isImageFile(file)) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, etc.)', 'error');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`File size must be under ${maxSizeMB}MB`, 'error');
      return false;
    }
    return true;
  }

  /* ---------- Download ---------- */
  function downloadFile(data, filename, mimeType) {
    let blob;
    if (data instanceof Blob) {
      blob = data;
    } else if (data instanceof HTMLCanvasElement) {
      const type = mimeType || 'image/png';
      blob = canvasToBlob(data, type);
    } else if (typeof data === 'string') {
      blob = new Blob([data], { type: mimeType || 'text/plain' });
    } else {
      blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }

  async function downloadCanvas(canvas, filename, format = 'png', quality = 0.92) {
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    const mime = mimeTypes[format.toLowerCase()] || 'image/png';
    const blob = await canvasToBlob(canvas, mime, quality);
    const ext = format.toLowerCase();
    const name = filename.replace(/\.[^.]+$/, '') + '.' + ext;
    downloadFile(blob, name, mime);
  }

  /* ---------- Canvas Helpers ---------- */
  function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function imageToCanvas(img) {
    const canvas = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  function cloneCanvas(canvas) {
    const clone = createCanvas(canvas.width, canvas.height);
    clone.getContext('2d').drawImage(canvas, 0, 0);
    return clone;
  }

  function getCanvasData(canvas) {
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  }

  function setCanvasData(canvas, imageData) {
    canvas.getContext('2d').putImageData(imageData, 0, 0);
  }

  /* ---------- Drag & Drop Setup ---------- */
  function setupDragDrop(zone, onFile, acceptTypes = 'image/*') {
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFile(files[0]);
      }
    });
  }

  /* ---------- Image Processing ---------- */
  function adjustBrightness(imageData, value) {
    const data = imageData.data;
    const factor = value * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + factor);
      data[i + 1] = clamp(data[i + 1] + factor);
      data[i + 2] = clamp(data[i + 2] + factor);
    }
    return imageData;
  }

  function adjustContrast(imageData, value) {
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(factor * (data[i] - 128) + 128);
      data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }
    return imageData;
  }

  function adjustSaturation(imageData, value) {
    const data = imageData.data;
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      data[i] = clamp(gray + factor * (data[i] - gray));
      data[i + 1] = clamp(gray + factor * (data[i + 1] - gray));
      data[i + 2] = clamp(gray + factor * (data[i + 2] - gray));
    }
    return imageData;
  }

  function adjustHue(imageData, degrees) {
    const data = imageData.data;
    const angle = degrees * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = clamp(r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928));
      data[i + 1] = clamp(r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283));
      data[i + 2] = clamp(r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072));
    }
    return imageData;
  }

  function toGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    return imageData;
  }

  function toSepia(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131);
    }
    return imageData;
  }

  function invertColors(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
  }

  /* ---------- Color Conversion ---------- */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /* ---------- Helpers ---------- */
  function clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function generateFilename(original, suffix, ext) {
    const base = original.replace(/\.[^.]+$/, '');
    return `${base}_${suffix}.${ext || original.split('.').pop()}`;
  }

  /* ---------- Canvas Filter Functions ---------- */
  function applyBlur(canvas, radius) {
    if (radius <= 0) return canvas;
    const ctx = canvas.getContext('2d');
    ctx.filter = `blur(${radius}px)`;
    const tempCanvas = createCanvas(canvas.width, canvas.height);
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
    return canvas;
  }

  function applyBrightness(canvas, value) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    adjustBrightness(imageData, value);
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function rotateCanvas(canvas, degrees) {
    const rad = degrees * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newW = Math.round(canvas.width * cos + canvas.height * sin);
    const newH = Math.round(canvas.width * sin + canvas.height * cos);
    const tempCanvas = createCanvas(newW, newH);
    const ctx = tempCanvas.getContext('2d');
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    return tempCanvas;
  }

  function flipCanvas(canvas, horizontal) {
    const tempCanvas = createCanvas(canvas.width, canvas.height);
    const ctx = tempCanvas.getContext('2d');
    if (horizontal) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(canvas, 0, 0);
    return tempCanvas;
  }

  function cropCanvas(canvas, x, y, width, height) {
    const tempCanvas = createCanvas(width, height);
    tempCanvas.getContext('2d').drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return tempCanvas;
  }

  function resizeCanvas(canvas, width, height) {
    const tempCanvas = createCanvas(width, height);
    const ctx = tempCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, width, height);
    return tempCanvas;
  }

  /* ---------- Image Filters via CSS filter shorthand ---------- */
  function applyCSSFilter(canvas, filterStr) {
    const ctx = canvas.getContext('2d');
    const tempCanvas = createCanvas(canvas.width, canvas.height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.filter = filterStr;
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    return canvas;
  }

  /* ---------- QR Code generation helper (simple) ---------- */
  /* Minimal QR code using canvas - just the essential encoding */
  // We'll include a small QR library inline in the QR tool page instead.

  /* ---------- Public API ---------- */
  return {
    // Toast
    showToast,
    // File
    createFileInput,
    readFileAsDataURL,
    readFileAsArrayBuffer,
    loadImage,
    isImageFile,
    validateImageFile,
    // Download
    downloadFile,
    downloadCanvas,
    canvasToBlob,
    // Canvas
    createCanvas,
    imageToCanvas,
    cloneCanvas,
    getCanvasData,
    setCanvasData,
    // Drag & Drop
    setupDragDrop,
    // Image Processing
    adjustBrightness,
    adjustContrast,
    adjustSaturation,
    adjustHue,
    toGrayscale,
    toSepia,
    invertColors,
    // Color
    rgbToHex,
    hexToRgb,
    rgbToHsl,
    hslToRgb,
    // Canvas Filters
    applyBlur,
    applyBrightness,
    rotateCanvas,
    flipCanvas,
    cropCanvas,
    resizeCanvas,
    applyCSSFilter,
    // Helpers
    clamp,
    escapeHtml,
    debounce,
    formatFileSize,
    generateFilename
  };
})();
