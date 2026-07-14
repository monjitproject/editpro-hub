/**
 * QR Code Generator — Generate QR codes from text, URL, email, phone, WiFi
 * Controls: select#qrType, text#qrContent, color#qrColor, select#qrSize
 * Renders a QR-like pattern on canvas. Generates as PNG.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const qrType = document.getElementById('qrType');
  const qrContent = document.getElementById('qrContent');
  const qrColor = document.getElementById('qrColor');
  const qrSize = document.getElementById('qrSize');

  /* Show workspace immediately (no image upload needed) */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* ── Simple QR Code encoder (minimal byte-mode QR) ── */
  /* We implement a basic QR code generator supporting byte mode.
     This covers Version 1-4 (up to ~134 bytes) which is enough for URLs/text. */

  const QR_CODE = (() => {
    /* GF(256) arithmetic for Reed-Solomon */
    const EXP_TABLE = new Array(256);
    const LOG_TABLE = new Array(256);
    (function initGaloisField() {
      let x = 1;
      for (let i = 0; i < 256; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
      }
    })();

    function gfMul(a, b) {
      if (a === 0 || b === 0) return 0;
      return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
    }

    function generateRS(data, ecLen) {
      /* Generate generator polynomial */
      let gen = [1];
      for (let i = 0; i < ecLen; i++) {
        const newGen = new Array(gen.length + 1).fill(0);
        for (let j = 0; j < gen.length; j++) {
          newGen[j] ^= gen[j];
          newGen[j + 1] ^= gfMul(gen[j], EXP_TABLE[i]);
        }
        gen = newGen;
      }

      const result = new Array(data.length + ecLen).fill(0);
      for (let i = 0; i < data.length; i++) result[i] = data[i];

      for (let i = 0; i < data.length; i++) {
        const coef = result[i];
        if (coef !== 0) {
          for (let j = 0; j < gen.length; j++) {
            result[i + j] ^= gfMul(gen[j], coef);
          }
        }
      }
      return result.slice(data.length);
    }

    /* Version capacities for byte mode */
    const VERSION_CAPACITY = [
      0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271
    ];

    /* EC codewords per block for each version */
    const EC_PER_BLOCK = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
    const BLOCKS_GROUP1 = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
    const DATA_PER_BLOCK_G1 = [0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274];
    const DATA_PER_BLOCK_G2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    function getVersion(dataLen) {
      for (let v = 1; v <= 10; v++) {
        if (dataLen <= VERSION_CAPACITY[v]) return v;
      }
      return 10;
    }

    function encodeData(text) {
      const bytes = [];
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < 0x80) {
          bytes.push(code);
        } else if (code < 0x800) {
          bytes.push(0xc0 | (code >> 6));
          bytes.push(0x80 | (code & 0x3f));
        } else {
          bytes.push(0xe0 | (code >> 12));
          bytes.push(0x80 | ((code >> 6) & 0x3f));
          bytes.push(0x80 | (code & 0x3f));
        }
      }

      const version = getVersion(bytes.length);
      const totalDataCodewords = DATA_PER_BLOCK_G1[version] * BLOCKS_GROUP1[version];
      const dataCodewords = bytes.slice(0, totalDataCodewords);

      /* Byte mode indicator: 0100 */
      let bits = '0100';
      /* Character count (8 bits for version 1-9) */
      bits += bytes.length.toString(2).padStart(8, '0');
      /* Data bits */
      for (const b of dataCodewords) {
        bits += b.toString(2).padStart(8, '0');
      }
      /* Terminator */
      bits += '0000';
      /* Pad to byte boundary */
      while (bits.length % 8 !== 0) bits += '0';
      /* Pad bytes */
      let padByte = 0;
      while (bits.length < totalDataCodewords * 8) {
        bits += (padByte === 0 ? 0xEC : 0x11).toString(2).padStart(8, '0');
        padByte = padByte === 0 ? 1 : 0;
      }

      /* Convert to bytes */
      const dataBytes = [];
      for (let i = 0; i < bits.length; i += 8) {
        dataBytes.push(parseInt(bits.substr(i, 8), 2));
      }

      return { version, dataBytes };
    }

    function createMatrix(version) {
      const size = version * 4 + 17;
      const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
      const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
      return { size, matrix, reserved };
    }

    function placeFinderPattern(m, row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const mr = row + r, mc = col + c;
          if (mr < 0 || mr >= m.size || mc < 0 || mc >= m.size) continue;
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            m.matrix[mr][mc] = false;
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            m.matrix[mr][mc] = true;
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            m.matrix[mr][mc] = true;
          } else {
            m.matrix[mr][mc] = false;
          }
          m.reserved[mr][mc] = true;
        }
      }
    }

    function placeTimingPatterns(m) {
      for (let i = 8; i < m.size - 8; i++) {
        if (!m.reserved[6][i]) {
          m.matrix[6][i] = i % 2 === 0;
          m.reserved[6][i] = true;
        }
        if (!m.reserved[i][6]) {
          m.matrix[i][6] = i % 2 === 0;
          m.reserved[i][6] = true;
        }
      }
    }

    function reserveFormatArea(m) {
      /* Format info areas around finder patterns */
      for (let i = 0; i < 9; i++) {
        if (i < m.size) {
          m.reserved[8][i] = true;
          m.reserved[i][8] = true;
        }
        if (m.size - 1 - i >= 0) {
          m.reserved[8][m.size - 1 - i] = true;
          m.reserved[m.size - 1 - i][8] = true;
        }
      }
      /* Dark module */
      if (m.size > 13) {
        m.reserved[m.size - 8][8] = true;
        m.matrix[m.size - 8][8] = true;
      }
    }

    function placeData(m, dataBytes) {
      let bitIndex = 0;
      const totalBits = dataBytes.length * 8;
      let col = m.size - 1;
      let upward = true;

      while (col >= 0) {
        if (col === 6) col--; /* Skip timing pattern column */
        const rows = upward
          ? Array.from({ length: m.size }, (_, i) => m.size - 1 - i)
          : Array.from({ length: m.size }, (_, i) => i);

        for (const row of rows) {
          for (let dc = 0; dc <= 1; dc++) {
            const c = col - dc;
            if (c < 0 || m.reserved[row][c]) continue;
            if (bitIndex < totalBits) {
              const byteIdx = Math.floor(bitIndex / 8);
              const bitPos = 7 - (bitIndex % 8);
              m.matrix[row][c] = ((dataBytes[byteIdx] >> bitPos) & 1) === 1;
              bitIndex++;
            } else {
              m.matrix[row][c] = false;
            }
          }
        }

        upward = !upward;
        col -= 2;
      }
    }

    /* Mask patterns */
    const MASKS = [
      (r, c) => (r + c) % 2 === 0,
      (r, c) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
      (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
      (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0
    ];

    function applyMask(m, maskIdx) {
      const result = m.matrix.map(row => [...row]);
      for (let r = 0; r < m.size; r++) {
        for (let c = 0; c < m.size; c++) {
          if (!m.reserved[r][c] && MASKS[maskIdx](r, c)) {
            result[r][c] = !result[r][c];
          }
        }
      }
      return result;
    }

    function generate(text) {
      if (!text) return null;
      const { version, dataBytes } = encodeData(text);
      const m = createMatrix(version);

      /* Place finder patterns */
      placeFinderPattern(m, 0, 0);
      placeFinderPattern(m, 0, m.size - 7);
      placeFinderPattern(m, m.size - 7, 0);

      /* Place timing patterns */
      placeTimingPatterns(m);

      /* Reserve format areas */
      reserveFormatArea(m);

      /* Place data */
      placeData(m, dataBytes);

      /* Apply mask 0 (simplest) and return */
      const finalMatrix = applyMask(m, 0);

      return { size: m.size, matrix: finalMatrix };
    }

    return { generate };
  })();

  /* ── Render QR code to canvas ── */
  function renderQR() {
    const text = qrContent.value.trim();
    if (!text) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter content above and click Generate', canvas.width / 2, canvas.height / 2);
      return;
    }

    const size = parseInt(qrSize.value, 10) || 300;
    const color = qrColor.value || '#000000';
    const rgb = Utils.hexToRgb(color);

    /* Add type prefix */
    let content = text;
    switch (qrType.value) {
      case 'email':
        content = 'mailto:' + text;
        break;
      case 'phone':
        content = 'tel:' + text;
        break;
      case 'wifi':
        content = 'WIFI:T:WPA;S:' + text + ';;';
        break;
    }

    const qr = QR_CODE.generate(content);
    if (!qr) {
      Utils.showToast('Failed to generate QR code', 'error');
      return;
    }

    const margin = 4;
    const totalSize = qr.size + margin * 2;
    const cellSize = Math.floor(size / totalSize);
    const actualSize = cellSize * totalSize;

    canvas.width = actualSize;
    canvas.height = actualSize;

    /* White background */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, actualSize, actualSize);

    /* Draw modules */
    ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.matrix[r][c]) {
          ctx.fillRect(
            (c + margin) * cellSize,
            (r + margin) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    Utils.showToast('QR code generated!', 'success');
  }

  /* ── Event listeners ── */
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', renderQR);
  }

  /* Auto-generate on content change (debounced) */
  let debounceTimer;
  if (qrContent) {
    qrContent.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderQR, 500);
    });
  }

  /* Regenerate on option changes */
  [qrType, qrColor, qrSize].forEach(el => {
    if (el) el.addEventListener('change', renderQR);
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (canvas.width === 0 || canvas.height === 0) {
      Utils.showToast('Generate a QR code first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, 'qrcode', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (qrContent) qrContent.value = '';
    if (qrType) qrType.value = 'url';
    if (qrColor) qrColor.value = '#000000';
    if (qrSize) qrSize.value = '300';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 400;
    canvas.height = 300;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter content above and click Generate', 200, 150);
  });

  /* ── Initial state ── */
  canvas.width = 400;
  canvas.height = 300;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#999';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter content above and click Generate', 200, 150);
});
