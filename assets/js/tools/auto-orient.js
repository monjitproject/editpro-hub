/**
 * Auto-Orient Tool
 * Attempts to fix EXIF orientation. Since browser EXIF reading is limited
 * without a library, provides a manual rotation select plus a strip EXIF toggle.
 * Controls: toggle#stripExif, select#manualRotation
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const stripExifToggle = document.getElementById('stripExif');
  const manualRotationSelect = document.getElementById('manualRotation');
  const exifInfo = document.getElementById('exifInfo');
  let originalImg = null;
  let originalFilename = 'image';
  let exifOrientation = 1; // Default: normal

  const zone = document.getElementById('upload-zone');
  if (zone) {
    Utils.setupDragDrop(zone, handleFile);
    const input = zone.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  }

  async function handleFile(file) {
    if (!Utils.validateImageFile(file)) return;
    originalFilename = file.name.replace(/\.[^.]+$/, '');

    // Try to read EXIF orientation from the file
    exifOrientation = await readExifOrientation(file);

    if (exifInfo) {
      const orientationNames = {
        1: 'Normal (0°)',
        2: 'Flipped horizontally',
        3: 'Rotated 180°',
        4: 'Flipped vertically',
        5: 'Transposed (mirror + rotate 270°)',
        6: 'Rotated 90° CW',
        7: 'Transverse (mirror + rotate 90°)',
        8: 'Rotated 270° CW (90° CCW)'
      };
      exifInfo.textContent = 'EXIF Orientation: ' + exifOrientation +
        ' (' + (orientationNames[exifOrientation] || 'Unknown') + ')';
    }

    originalImg = await Utils.loadImage(file);
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);
    zone.style.display = 'none';
    document.getElementById('tool-workspace').classList.add('active');
    processImage();
  }

  /**
   * Read EXIF orientation byte from a JPEG file.
   * Returns 1-8 or 1 if not a JPEG / no EXIF found.
   */
  async function readExifOrientation(file) {
    try {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) return 1;
      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);

      // Check JPEG SOI marker
      if (view.getUint16(0) !== 0xFFD8) return 1;

      let offset = 2;
      while (offset < view.byteLength - 1) {
        const marker = view.getUint16(offset);
        offset += 2;

        if (marker === 0xFFE1) {
          // APP1 marker (EXIF)
          const length = view.getUint16(offset);
          // Check "Exif\0\0"
          if (view.getUint32(offset + 2) === 0x45786966 && view.getUint16(offset + 6) === 0x0000) {
            let tiffOffset = offset + 8;
            const bigEndian = view.getUint16(tiffOffset) === 0x4D4D;
            // Number of IFD entries
            const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, !bigEndian);
            const numEntries = view.getUint16(ifdOffset, !bigEndian);

            for (let i = 0; i < numEntries; i++) {
              const entryOffset = ifdOffset + 2 + i * 12;
              const tag = view.getUint16(entryOffset, !bigEndian);
              if (tag === 0x0112) {
                // Orientation tag
                return view.getUint16(entryOffset + 8, !bigEndian);
              }
            }
          }
          offset += length;
        } else if ((marker & 0xFF00) === 0xFF00) {
          offset += view.getUint16(offset);
        } else {
          break;
        }
      }
    } catch (e) {
      // Silently fall back to normal orientation
    }
    return 1;
  }

  /**
   * Convert EXIF orientation (1-8) to degrees and flip.
   */
  function getExifTransform(orientation) {
    switch (orientation) {
      case 1: return { degrees: 0, hFlip: false, vFlip: false };
      case 2: return { degrees: 0, hFlip: true, vFlip: false };
      case 3: return { degrees: 180, hFlip: false, vFlip: false };
      case 4: return { degrees: 0, hFlip: false, vFlip: true };
      case 5: return { degrees: 90, hFlip: true, vFlip: false };
      case 6: return { degrees: 90, hFlip: false, vFlip: false };
      case 7: return { degrees: 270, hFlip: true, vFlip: false };
      case 8: return { degrees: 270, hFlip: false, vFlip: false };
      default: return { degrees: 0, hFlip: false, vFlip: false };
    }
  }

  function processImage() {
    if (!originalImg) return;
    const stripExif = stripExifToggle ? stripExifToggle.checked : true;
    const manualRotDeg = parseInt(manualRotationSelect.value, 10);

    // Draw original
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    ctx.drawImage(originalImg, 0, 0);

    // Apply EXIF correction unless user chose to strip without correcting
    if (stripExif && exifOrientation !== 1) {
      const transform = getExifTransform(exifOrientation);
      let workingCanvas = Utils.cloneCanvas(canvas);

      // Apply flip first if needed
      if (transform.hFlip) {
        workingCanvas = Utils.flipCanvas(workingCanvas, true);
      }
      if (transform.vFlip) {
        workingCanvas = Utils.flipCanvas(workingCanvas, false);
      }

      // Apply rotation
      if (transform.degrees !== 0) {
        workingCanvas = Utils.rotateCanvas(workingCanvas, transform.degrees);
      }

      canvas.width = workingCanvas.width;
      canvas.height = workingCanvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(workingCanvas, 0, 0);
    }

    // Apply manual rotation if set
    if (manualRotDeg !== 0) {
      const rotated = Utils.rotateCanvas(canvas, manualRotDeg);

      // Swap dimensions for 90/270
      if (manualRotDeg === 90 || manualRotDeg === 270 || manualRotDeg === -90 || manualRotDeg === -270) {
        canvas.width = rotated.width;
        canvas.height = rotated.height;
      } else {
        canvas.width = rotated.width;
        canvas.height = rotated.height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(rotated, 0, 0);
    }
  }

  // Event listeners for controls
  if (stripExifToggle) stripExifToggle.addEventListener('change', processImage);
  if (manualRotationSelect) manualRotationSelect.addEventListener('change', processImage);

  // Download handler
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Utils.downloadCanvas(canvas, originalFilename + '_oriented', 'png');
    });
  }

  // Reset handler
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (stripExifToggle) stripExifToggle.checked = true;
      if (manualRotationSelect) manualRotationSelect.value = '0';
      if (originalImg) {
        canvas.width = originalImg.naturalWidth;
        canvas.height = originalImg.naturalHeight;
        ctx.drawImage(originalImg, 0, 0);
      }
      Utils.showToast('Orientation reset', 'info');
    });
  }

  // Clipboard paste support
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile());
        break;
      }
    }
  });
});
