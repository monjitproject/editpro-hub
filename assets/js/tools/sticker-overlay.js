/**
 * Sticker/Emoji Overlay — Place emojis on image with draggable positioning
 * Controls: range#stickerSize (24-200, default:64)
 * Show palette of emojis. Click to place, drag to reposition.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const zone = document.getElementById('upload-zone');

  const stickerSize = document.getElementById('stickerSize');

  let originalImg = null;
  let originalFilename = 'image';
  let selectedEmoji = null;
  let stickers = []; /* Array of {emoji, x, y, size} */

  /* ── Dragging state ── */
  let draggingIndex = -1;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  /* ── Emoji palette ── */
  const EMOJIS = [
    '❤️', '😊', '😍', '😂', '🎉',
    '🎁', '⭐', '💯', '👍', '💪',
    '🌟', '🚀', '🌈', '🌹', '🌻',
    '🍕', '💎', '🎮', '💥', '🎄',
    '🎅', '💫', '🌊', '🎈', '😎',
    '👸', '🏆', '🎵', '🎨', '💍'
  ];

  /* ── Build emoji palette in DOM ── */
  function buildEmojiPalette() {
    const existing = document.getElementById('emoji-palette');
    if (existing) existing.remove();

    const palette = document.createElement('div');
    palette.id = 'emoji-palette';
    palette.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin:8px 0;';

    EMOJIS.forEach(emoji => {
      const btn = document.createElement('button');
      btn.textContent = emoji;
      btn.style.cssText = 'font-size:24px;padding:4px;cursor:pointer;border:2px solid transparent;' +
        'background:none;border-radius:4px;transition:border-color 0.2s;';
      btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#4f46e5'; });
      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = selectedEmoji === emoji ? '#4f46e5' : 'transparent';
      });
      btn.addEventListener('click', () => {
        selectedEmoji = emoji;
        /* Update palette UI */
        palette.querySelectorAll('button').forEach(b => {
          b.style.borderColor = b.textContent === emoji ? '#4f46e5' : 'transparent';
        });
        Utils.showToast('Selected: ' + emoji + ' - Click on image to place', 'info');
      });
      palette.appendChild(btn);
    });

    /* Insert palette after the controls area */
    const controls = document.getElementById('controls');
    if (controls) {
      controls.parentNode.insertBefore(palette, controls.nextSibling);
    }
  }

  buildEmojiPalette();

  /* ── Upload ── */
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');
    originalImg = await Utils.loadImage(file);
    stickers = [];
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    composite();
  }

  /* ── Composite image + stickers ── */
  function composite() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);

    const size = stickerSize ? parseInt(stickerSize.value, 10) : 64;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    stickers.forEach((s, i) => {
      ctx.save();
      ctx.font = `${s.size}px serif`;
      ctx.fillText(s.emoji, s.x, s.y);
      ctx.restore();
    });
  }

  /* ── Canvas click to place sticker ── */
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function findStickerAt(x, y) {
    const size = stickerSize ? parseInt(stickerSize.value, 10) : 64;
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const half = s.size / 2;
      if (x >= s.x - half && x <= s.x + half && y >= s.y - half && y <= s.y + half) {
        return i;
      }
    }
    return -1;
  }

  canvas.addEventListener('mousedown', e => {
    if (!originalImg) return;
    const pos = getCanvasCoords(e);
    const idx = findStickerAt(pos.x, pos.y);

    if (idx >= 0) {
      /* Start dragging existing sticker */
      draggingIndex = idx;
      dragOffsetX = pos.x - stickers[idx].x;
      dragOffsetY = pos.y - stickers[idx].y;
    } else if (selectedEmoji) {
      /* Place new sticker */
      const size = stickerSize ? parseInt(stickerSize.value, 10) : 64;
      stickers.push({ emoji: selectedEmoji, x: pos.x, y: pos.y, size });
      composite();
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (draggingIndex < 0 || !originalImg) return;
    const pos = getCanvasCoords(e);
    stickers[draggingIndex].x = pos.x - dragOffsetX;
    stickers[draggingIndex].y = pos.y - dragOffsetY;
    composite();
  });

  canvas.addEventListener('mouseup', () => { draggingIndex = -1; });
  canvas.addEventListener('mouseleave', () => { draggingIndex = -1; });

  /* ── Touch events ── */
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (!originalImg) return;
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    const idx = findStickerAt(pos.x, pos.y);
    if (idx >= 0) {
      draggingIndex = idx;
      dragOffsetX = pos.x - stickers[idx].x;
      dragOffsetY = pos.y - stickers[idx].y;
    } else if (selectedEmoji) {
      const size = stickerSize ? parseInt(stickerSize.value, 10) : 64;
      stickers.push({ emoji: selectedEmoji, x: pos.x, y: pos.y, size });
      composite();
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (draggingIndex < 0 || !originalImg) return;
    const touch = e.touches[0];
    const pos = getCanvasCoords(touch);
    stickers[draggingIndex].x = pos.x - dragOffsetX;
    stickers[draggingIndex].y = pos.y - dragOffsetY;
    composite();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    draggingIndex = -1;
  });

  /* ── Update sticker size and redraw ── */
  if (stickerSize) {
    stickerSize.addEventListener('input', () => {
      const size = parseInt(stickerSize.value, 10);
      const sizeLabel = document.getElementById('stickerSize-value');
      if (sizeLabel) sizeLabel.textContent = size + 'px';
      /* Update sizes of existing stickers */
      stickers.forEach(s => s.size = size);
      composite();
    });
  }

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Upload an image first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename + '_sticker', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (stickerSize) stickerSize.value = '64';
    selectedEmoji = null;
    stickers = [];
    zone.style.display = '';
    document.getElementById('tool-workspace').classList.remove('active');
    originalImg = null;
    /* Reset palette highlight */
    const palette = document.getElementById('emoji-palette');
    if (palette) {
      palette.querySelectorAll('button').forEach(b => {
        b.style.borderColor = 'transparent';
      });
    }
  });

  /* ── Clipboard paste ── */
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
