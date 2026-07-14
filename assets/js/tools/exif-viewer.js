/**
 * EXIF Data Viewer
 * Upload an image and display its EXIF metadata in a table.
 * Parses JPEG binary data to find EXIF info: camera make/model, date,
 * ISO, aperture, shutter speed, focal length, GPS lat/long if available.
 * Shows a thumbnail and "No EXIF data found" if none.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');
  let originalImg = null;
  let originalFilename = 'image';

  /* ---- EXIF Parsing Utilities ---- */

  /* Read an unsigned 16-bit int from DataView (little-endian or big-endian) */
  function getUint16(view, offset, littleEndian) {
    return littleEndian ? view.getUint16(offset, true) : view.getUint16(offset, false);
  }

  /* Read an unsigned 32-bit int from DataView */
  function getUint32(view, offset, littleEndian) {
    return littleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
  }

  /* Read a signed 32-bit int from DataView */
  function getInt32(view, offset, littleEndian) {
    return littleEndian ? view.getInt32(offset, true) : view.getInt32(offset, false);
  }

  /* Read a rational number (num/den) from DataView */
  function getRational(view, offset, littleEndian) {
    const num = getUint32(view, offset, littleEndian);
    const den = getUint32(view, offset + 4, littleEndian);
    return den === 0 ? num : num / den;
  }

  /* Read a signed rational number */
  function getSRational(view, offset, littleEndian) {
    const num = getInt32(view, offset, littleEndian);
    const den = getInt32(view, offset + 4, littleEndian);
    return den === 0 ? num : num / den;
  }

  /* Read a null-terminated ASCII string of given length */
  function getString(view, offset, length) {
    let str = '';
    for (let i = 0; i < length; i++) {
      const ch = view.getUint8(offset + i);
      if (ch === 0) break;
      str += String.fromCharCode(ch);
    }
    return str;
  }

  /* IFD Tag IDs we care about */
  const TAGS = {
    0x010F: 'Make',
    0x0110: 'Model',
    0x0112: 'Orientation',
    0x011A: 'XResolution',
    0x011B: 'YResolution',
    0x0131: 'Software',
    0x0132: 'DateTime',
    0x013B: 'Artist',
    0x8298: 'Copyright',
    /* Exif IFD */
    0x829A: 'ExposureTime',
    0x829D: 'FNumber',
    0x8827: 'ISOSpeedRatings',
    0x9000: 'ExifVersion',
    0x9003: 'DateTimeOriginal',
    0x9004: 'DateTimeDigitized',
    0x920A: 'FocalLength',
    0xA001: 'ColorSpace',
    0xA002: 'PixelXDimension',
    0xA003: 'PixelYDimension',
    /* GPS IFD */
    0x8825: 'GPSInfoIFD',
    0x0000: 'GPSVersionID',
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude',
    0x0005: 'GPSAltitudeRef',
    0x0006: 'GPSAltitude'
  };

  /* Data type sizes for IFD entries */
  const TYPE_SIZES = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
  const TYPE_NAMES = { 1: 'BYTE', 2: 'ASCII', 3: 'SHORT', 4: 'LONG', 5: 'RATIONAL',
    6: 'SBYTE', 7: 'UNDEFINED', 8: 'SSHORT', 9: 'SLONG', 10: 'SRATIONAL', 11: 'FLOAT', 12: 'DOUBLE' };

  function readIFDEntry(view, offset, littleEndian) {
    const tag = getUint16(view, offset, littleEndian);
    const type = getUint16(view, offset + 2, littleEndian);
    const count = getUint32(view, offset + 4, littleEndian);
    const typeSize = TYPE_SIZES[type] || 1;
    const totalBytes = typeSize * count;
    let valueOffset;
    if (totalBytes <= 4) {
      valueOffset = offset + 8;
    } else {
      valueOffset = getUint32(view, offset + 8, littleEndian);
    }
    return { tag, type, count, valueOffset, totalBytes };
  }

  function parseIFD(view, ifdOffset, littleEndian, tagNamePrefix) {
    const entries = {};
    const numEntries = getUint16(view, ifdOffset, littleEndian);
    const results = {};

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + (i * 12);
      const entry = readIFDEntry(view, entryOffset, littleEndian);

      const tagId = entry.tag;
      const tagName = tagNamePrefix ? `${tagNamePrefix}.${TAGS[tagId] || 'Tag 0x' + tagId.toString(16).toUpperCase()}` : (TAGS[tagId] || 'Tag 0x' + tagId.toString(16).toUpperCase());
      const shortName = TAGS[tagId] || ('Tag 0x' + tagId.toString(16).toUpperCase());

      try {
        if (entry.type === 2) {
          /* ASCII string */
          results[shortName] = getString(view, entry.valueOffset, entry.count);
        } else if (entry.type === 3 && entry.count === 1) {
          /* SHORT */
          results[shortName] = getUint16(view, entry.valueOffset, littleEndian);
        } else if (entry.type === 4 && entry.count === 1) {
          /* LONG */
          results[shortName] = getUint32(view, entry.valueOffset, littleEndian);
        } else if (entry.type === 5) {
          /* RATIONAL */
          if (entry.count === 1) {
            results[shortName] = getRational(view, entry.valueOffset, littleEndian);
          } else {
            /* Array of rationals */
            const vals = [];
            for (let j = 0; j < entry.count; j++) {
              vals.push(getRational(view, entry.valueOffset + j * 8, littleEndian));
            }
            results[shortName] = vals;
          }
        } else if (entry.type === 10) {
          /* SRATIONAL */
          if (entry.count === 1) {
            results[shortName] = getSRational(view, entry.valueOffset, littleEndian);
          }
        } else if (entry.type === 4) {
          /* LONG array */
          const vals = [];
          for (let j = 0; j < entry.count; j++) {
            vals.push(getUint32(view, entry.valueOffset + j * 4, littleEndian));
          }
          results[shortName] = vals;
        }
      } catch (e) {
        /* Skip unreadable entries */
      }
    }

    /* Check for nested IFD: GPS or Exif */
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + (i * 12);
      const entry = readIFDEntry(view, entryOffset, littleEndian);
      if (entry.tag === 0x8769 && !tagNamePrefix) {
        /* Exif SubIFD */
        const exifOffset = getUint32(view, entryOffset + 8, littleEndian);
        const exifData = parseIFD(view, exifOffset, littleEndian, 'Exif');
        Object.assign(results, exifData);
      } else if (entry.tag === 0x8825 && !tagNamePrefix) {
        /* GPS SubIFD */
        const gpsOffset = getUint32(view, entryOffset + 8, littleEndian);
        const gpsData = parseIFD(view, gpsOffset, littleEndian, 'GPS');
        Object.assign(results, gpsData);
      }
    }

    return results;
  }

  function parseEXIF(arrayBuffer) {
    const view = new DataView(arrayBuffer);

    /* Check JPEG SOI marker */
    if (view.getUint8(0) !== 0xFF || view.getUint8(1) !== 0xD8) {
      return null;
    }

    /* Search for APP1 (EXIF) marker */
    let offset = 2;
    while (offset < view.byteLength - 1) {
      const marker = view.getUint8(offset);
      if (marker !== 0xFF) return null;
      const nextMarker = view.getUint8(offset + 1);
      if (nextMarker === 0xE1) {
        /* Found APP1 */
        const length = getUint16(view, offset + 2, false);
        const exifStart = offset + 4;

        /* Check "Exif\0\0" header */
        const header = getString(view, exifStart, 6);
        if (header !== 'Exif\0\0') return null;

        /* TIFF header at exifStart + 6 */
        const tiffStart = exifStart + 6;
        const byteOrder = String.fromCharCode(view.getUint8(tiffStart), view.getUint8(tiffStart + 1));
        const littleEndian = (byteOrder === 'II');
        const ifdOffset = getUint32(view, tiffStart + 4, littleEndian);

        /* Parse IFD0 */
        const ifd0Absolute = tiffStart + ifdOffset;
        return parseIFD(view, ifd0Absolute, littleEndian);
      } else if ((nextMarker & 0xE0) === 0xE0) {
        /* Skip other APP markers */
        const length = getUint16(view, offset + 2, false);
        offset += 2 + length;
      } else if (nextMarker === 0xDA) {
        /* Start of scan - stop */
        return null;
      } else {
        offset += 2;
      }
    }
    return null;
  }

  /* ---- Format helpers ---- */

  function formatExposure(value) {
    if (!value || value === 0) return null;
    if (value < 1) {
      const denom = Math.round(1 / value);
      return `1/${denom}s`;
    }
    return value.toFixed(2) + 's';
  }

  function formatAperture(value) {
    if (!value || value === 0) return null;
    return 'f/' + value.toFixed(1);
  }

  function formatFocalLength(value) {
    if (!value || value === 0) return null;
    return value.toFixed(1) + ' mm';
  }

  function formatGPSLatitude(values, ref) {
    if (!values || values.length < 3) return null;
    let deg = values[0];
    let min = values[1];
    let sec = values[2];
    /* Handle rational values (arrays of [num, den]) */
    if (Array.isArray(deg)) deg = deg[0] / deg[1];
    if (Array.isArray(min)) min = min[0] / min[1];
    if (Array.isArray(sec)) sec = sec[0] / sec[1];
    let lat = deg + min / 60 + sec / 3600;
    if (ref === 'S') lat = -lat;
    return lat.toFixed(6) + '° ' + ref;
  }

  function formatGPSLongitude(values, ref) {
    if (!values || values.length < 3) return null;
    let deg = values[0];
    let min = values[1];
    let sec = values[2];
    if (Array.isArray(deg)) deg = deg[0] / deg[1];
    if (Array.isArray(min)) min = min[0] / min[1];
    if (Array.isArray(sec)) sec = sec[0] / sec[1];
    let lng = deg + min / 60 + sec / 3600;
    if (ref === 'W') lng = -lng;
    return lng.toFixed(6) + '° ' + ref;
  }

  /* ---- Upload / Drag Drop ---- */
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
    processImage();
  }

  async function processImage() {
    if (!originalImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0);
    renderExifData(null);
  }

  async function renderExifData(exifData) {
    const resultsContainer = document.getElementById('exif-results');
    if (!resultsContainer) return;

    /* Read the file as ArrayBuffer to parse EXIF */
    if (!exifData) {
      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);
        const res = await fetch(dataURL);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        exifData = parseEXIF(arrayBuffer);
      } catch (e) {
        exifData = null;
      }
    }

    resultsContainer.innerHTML = '';

    if (!exifData || Object.keys(exifData).length === 0) {
      resultsContainer.innerHTML = `
        <div class="exif-empty" style="text-align:center;padding:var(--space-6);color:var(--text-muted);">
          <p style="font-size:1.2em;margin-bottom:var(--space-2);">No EXIF data found</p>
          <p style="font-size:var(--text-sm);">This image does not contain EXIF metadata, or the format is not supported for EXIF parsing.</p>
        </div>`;
      return;
    }

    /* Group data into categories */
    const categories = {
      'Camera Info': ['Make', 'Model', 'Software'],
      'Date & Time': ['DateTime', 'DateTimeOriginal', 'DateTimeDigitized'],
      'Exposure': ['ExposureTime', 'FNumber', 'ISOSpeedRatings', 'FocalLength'],
      'Image Info': ['Orientation', 'PixelXDimension', 'PixelYDimension',
        'XResolution', 'YResolution', 'ColorSpace', 'ExifVersion'],
      'Author': ['Artist', 'Copyright'],
      'GPS Location': ['GPSLatitude', 'GPSLatitudeRef', 'GPSLongitude', 'GPSLongitudeRef',
        'GPSAltitude', 'GPSAltitudeRef']
    };

    let html = '<table class="exif-table" style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">';

    for (const [catName, tagNames] of Object.entries(categories)) {
      let hasData = false;
      for (const tagName of tagNames) {
        if (exifData[tagName] !== undefined && exifData[tagName] !== '') {
          hasData = true;
          break;
        }
      }
      if (!hasData) continue;

      html += `<thead><tr><th colspan="2" style="text-align:left;padding:8px 12px;background:var(--bg-secondary);border-bottom:2px solid var(--border);font-weight:600;">${catName}</th></tr></thead><tbody>`;

      for (const tagName of tagNames) {
        let value = exifData[tagName];
        if (value === undefined || value === '' || value === null) continue;

        /* Format special values */
        let displayValue = String(value);
        if (tagName === 'ExposureTime') {
          displayValue = formatExposure(value) || String(value);
        } else if (tagName === 'FNumber') {
          displayValue = formatAperture(value) || String(value);
        } else if (tagName === 'FocalLength') {
          displayValue = formatFocalLength(value) || String(value);
        } else if (tagName === 'GPSLatitude') {
          displayValue = formatGPSLatitude(value, exifData['GPSLatitudeRef']) || String(value);
        } else if (tagName === 'GPSLongitude') {
          displayValue = formatGPSLongitude(value, exifData['GPSLongitudeRef']) || String(value);
        } else if (tagName === 'ISOSpeedRatings') {
          displayValue = 'ISO ' + value;
        } else if (tagName === 'XResolution' || tagName === 'YResolution') {
          displayValue = typeof value === 'number' ? Math.round(value) + ' dpi' : String(value);
        } else if (tagName === 'Orientation') {
          const orientations = { 1: 'Normal', 2: 'Flipped horizontal', 3: 'Rotated 180', 4: 'Flipped vertical',
            5: 'Transposed', 6: 'Rotated 90 CW', 7: 'Transverse', 8: 'Rotated 270 CW' };
          displayValue = orientations[value] || String(value);
        }

        html += `<tr style="border-bottom:1px solid var(--border);">
          <td style="padding:6px 12px;font-weight:500;white-space:nowrap;">${tagName}</td>
          <td style="padding:6px 12px;color:var(--text-secondary);word-break:break-all;">${escapeHtml(String(displayValue))}</td>
        </tr>`;
      }
      html += '</tbody>';
    }

    html += '</table>';

    /* Also show raw tags */
    html += '<details style="margin-top:var(--space-4);"><summary style="cursor:pointer;font-weight:600;padding:8px 0;">All Raw Tags (' + Object.keys(exifData).length + ')</summary>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">';
    for (const [key, value] of Object.entries(exifData)) {
      let displayVal = String(value);
      if (Array.isArray(value)) displayVal = JSON.stringify(value);
      html += `<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:4px 12px;font-weight:500;">${escapeHtml(key)}</td>
        <td style="padding:4px 12px;color:var(--text-secondary);word-break:break-all;">${escapeHtml(displayVal)}</td>
      </tr>`;
    }
    html += '</table></details>';

    resultsContainer.innerHTML = html;
  }

  /* Simple HTML escape */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---- Download ---- */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (!originalImg) {
      Utils.showToast('Please upload an image first', 'warning');
      return;
    }
    Utils.downloadCanvas(canvas, originalFilename, 'jpg', 0.95);
    Utils.showToast('Image downloaded', 'success');
  });

  /* ---- Reset ---- */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    originalImg = null;
    originalFilename = 'image';
    canvas.width = 0;
    canvas.height = 0;
    const resultsContainer = document.getElementById('exif-results');
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
