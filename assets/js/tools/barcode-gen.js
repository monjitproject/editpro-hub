/**
 * Barcode Generator — Generate barcodes in Code128/Code39/EAN-13/UPC-A formats
 * Controls: select#barcodeFormat, text#barcodeData, range#barcodeWidth (1-5, default:2)
 * Draws barcode bars on canvas with text below.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const barcodeFormat = document.getElementById('barcodeFormat');
  const barcodeData = document.getElementById('barcodeData');
  const barcodeWidth = document.getElementById('barcodeWidth');

  /* Show workspace immediately (no image upload needed) */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* ── Code128 encoding ── */
  const CODE128_PATTERNS = {
    ' ': '11011001100', '!': '11001101100', '"': '11001101100', '#': '10010011000',
    '$': '10010011000', '%': '10001001100', '&': '10011001000', "'": '10011001000',
    '(': '11001001000', ')': '11001001000', '*': '11001101000', '+': '10110011100',
    ',': '10010111100', '-': '10010011100', '.': '11001011100', '/': '11001001110',
    '0': '11011001100', '1': '11001101100', '2': '11001101100', '3': '10010011000',
    '4': '10010011000', '5': '10001001100', '6': '10011001000', '7': '10011001000',
    '8': '11001001000', '9': '11001001000', ':': '11001101000', ';': '10110011100',
    '<': '10010111100', '=': '10010011100', '>': '11001011100', '?': '11001001110',
    '@': '10110011100', 'A': '11011001100', 'B': '11001101100', 'C': '11001101100',
    'D': '10010011000', 'E': '10010011000', 'F': '10001001100', 'G': '10011001000',
    'H': '10011001000', 'I': '11001001000', 'J': '11001001000', 'K': '11001101000',
    'L': '10110011100', 'M': '10010111100', 'N': '10010011100', 'O': '11001011100',
    'P': '11001001110', 'Q': '10110011100', 'R': '10010111100', 'S': '10010011100',
    'T': '11001011100', 'U': '11001001110', 'V': '11011001100', 'W': '11001101100',
    'X': '11001101100', 'Y': '10010011000', 'Z': '10010011000',
    '[': '10001001100', '\\': '10011001000', ']': '10011001000', '^': '11001001000',
    '_': '11001001000', '`': '11001101000'
  };

  const CODE128_START_A = '103';
  const CODE128_START_B = '104';
  const CODE128_STOP = '106';

  const CODE128_B_PATTERNS = [
    '11011001100', '11001101100', '11001101100', '10010011000', '10010011000',
    '10001001100', '10011001000', '10011001000', '11001001000', '11001001000',
    '11001101000', '10110011100', '10010111100', '10010011100', '11001011100',
    '11001001110', '10110011100', '10010111100', '10010011100', '11001011100',
    '11001001110', '11011001100', '11001101100', '11001101100', '10010011000',
    '10010011000', '10001001100', '10011001000', '10011001000', '11001001000',
    '11001001000', '11001101000', '10110011100', '10010111100', '10010011100',
    '11001011100', '11001001110', '10110011100', '10010111100', '10010011100',
    '11001011100', '11001001110', '11011001100', '11001101100', '11001101100',
    '10010011000', '10010011000', '10001001100', '10011001000', '10011001000',
    '11001001000', '11001001000', '11001101000', '10110011100', '10010111100',
    '10010011100', '11001011100', '11001001110', '10110011100', '10010111100',
    '10010011100', '11001011100', '11001001110', '11011001100', '11001101100',
    '11001101100', '10010011000', '10010011000', '10001001100', '10011001000',
    '10011001000', '11001001000', '11001001000', '11001101000', '10110011100',
    '10010111100', '10010011100', '11001011100', '11001001110', '10110011100',
    '10010111100', '10010011100', '11001011100', '11001001110', '11011001100',
    '11001101100', '11001101100', '10010011000', '10010011000', '10001001100',
    '10011001000', '10011001000', '11001001000', '11001001000', '11001101000',
    '10110011100', '10010111100', '10010011100', '11001011100', '11001001110',
    '10110011100', '10010111100', '10010011100', '11001011100', '11001001110'
  ];

  function encodeCode128(text) {
    if (!text) return null;
    const chars = text.toUpperCase();
    let checksum = parseInt(CODE128_START_B);
    let pattern = CODE128_B_PATTERNS[parseInt(CODE128_START_B)];

    for (let i = 0; i < chars.length; i++) {
      const code = chars.charCodeAt(i) - 32;
      if (code < 0 || code > 94) continue;
      checksum += (i + 1) * code;
      pattern += CODE128_B_PATTERNS[code];
    }

    checksum = checksum % 103;
    pattern += CODE128_B_PATTERNS[checksum];
    pattern += CODE128_B_PATTERNS[parseInt(CODE128_STOP)];

    return pattern;
  }

  /* ── Code39 encoding ── */
  const CODE39_CHARS = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
    'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
    'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
    'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
    'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
    'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnn', 'V': 'nwwnnnnnn',
    'W': 'wwwnnnnnn', 'X': 'nwnnwnnnn', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
    '-': 'nwnnnnwnn', '.': 'wwnnnnnwn', ' ': 'nwwnnnnwn', '$': 'nwnwnwnnn',
    '/': 'nwnnnwnwn', '+': 'nwnnwnwnn', '%': 'nnnwnwnwn', '*': 'nwnnwwnwn'
  };

  function encodeCode39(text) {
    const chars = ('*' + text.toUpperCase() + '*').split('');
    let pattern = '';
    for (const ch of chars) {
      const enc = CODE39_CHARS[ch];
      if (!enc) continue;
      for (const bit of enc) {
        pattern += bit === 'w' ? '1' : '11';
        pattern += '0';
      }
      pattern += '0';
    }
    return pattern;
  }

  /* ── EAN-13 encoding ── */
  const EAN_L_PATTERNS = [
    '0001101', '0011001', '0010011', '0111101', '0100011',
    '0110001', '0101111', '0111011', '0110111', '0001011'
  ];
  const EAN_G_PATTERNS = [
    '0100111', '0110011', '0011011', '0100001', '0011101',
    '0111001', '0000101', '0010001', '0001001', '0010111'
  ];
  const EAN_R_PATTERNS = [
    '1110010', '1100110', '1101100', '1000010', '1011100',
    '1001110', '1010000', '1000100', '1001000', '1110100'
  ];
  const EAN_FIRST_DIGIT = [
    'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
    'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
  ];

  function computeEAN13Check(digits) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10;
  }

  function encodeEAN13(text) {
    const cleaned = text.replace(/\D/g, '');
    let digits = cleaned.split('').map(Number);

    if (digits.length === 12) {
      digits.push(computeEAN13Check(digits));
    } else if (digits.length === 13) {
      /* Verify check digit */
    } else {
      return null;
    }

    const pattern = EAN_FIRST_DIGIT[digits[0]];
    let bars = '101'; /* Start guard */

    for (let i = 0; i < 6; i++) {
      const d = digits[i + 1];
      bars += pattern[i] === 'L' ? EAN_L_PATTERNS[d] : EAN_G_PATTERNS[d];
    }

    bars += '01010'; /* Center guard */

    for (let i = 0; i < 6; i++) {
      bars += EAN_R_PATTERNS[digits[i + 7]];
    }

    bars += '101'; /* End guard */
    return { pattern: bars, text: digits.join('') };
  }

  /* ── UPC-A encoding ── */
  function computeUPCCheck(digits) {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
  }

  function encodeUPCA(text) {
    const cleaned = text.replace(/\D/g, '');
    let digits = cleaned.split('').map(Number);

    if (digits.length === 11) {
      digits.push(computeUPCCheck(digits));
    } else if (digits.length === 12) {
      /* Verify */
    } else {
      return null;
    }

    let bars = '101'; /* Start guard */

    /* Left half (odd parity for UPC) */
    for (let i = 0; i < 6; i++) {
      bars += EAN_L_PATTERNS[digits[i]];
    }

    bars += '01010'; /* Center guard */

    /* Right half */
    for (let i = 0; i < 6; i++) {
      bars += EAN_R_PATTERNS[digits[i + 6]];
    }

    bars += '101'; /* End guard */
    return { pattern: bars, text: digits.join('') };
  }

  /* ── Draw barcode ── */
  function renderBarcode() {
    const text = barcodeData.value.trim();
    if (!text) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 400;
      canvas.height = 200;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 200);
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter data above and click Generate', 200, 100);
      return;
    }

    const barWidth = parseInt(barcodeWidth.value, 10) || 2;
    const format = barcodeFormat.value;
    let pattern = '';
    let displayText = text;

    switch (format) {
      case 'code128':
        pattern = encodeCode128(text);
        break;
      case 'code39':
        pattern = encodeCode39(text);
        displayText = text.toUpperCase();
        break;
      case 'ean13': {
        const result = encodeEAN13(text);
        if (!result) {
          Utils.showToast('EAN-13 requires 12 or 13 digits', 'error');
          return;
        }
        pattern = result.pattern;
        displayText = result.text;
        break;
      }
      case 'upca': {
        const result = encodeUPCA(text);
        if (!result) {
          Utils.showToast('UPC-A requires 11 or 12 digits', 'error');
          return;
        }
        pattern = result.pattern;
        displayText = result.text;
        break;
      }
    }

    if (!pattern) {
      Utils.showToast('Invalid input for selected format', 'error');
      return;
    }

    const totalWidth = pattern.length * barWidth;
    const barHeight = 100;
    const textAreaHeight = 30;
    const padding = 20;

    canvas.width = totalWidth + padding * 2;
    canvas.height = barHeight + textAreaHeight + padding * 2;

    /* White background */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Draw bars */
    ctx.fillStyle = '#000000';
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        ctx.fillRect(
          padding + i * barWidth,
          padding,
          barWidth,
          barHeight
        );
      }
    }

    /* Draw text below */
    ctx.fillStyle = '#000000';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(displayText, canvas.width / 2, padding + barHeight + 20);

    Utils.showToast('Barcode generated!', 'success');
  }

  /* ── Event listeners ── */
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', renderBarcode);
  }

  if (barcodeData) {
    barcodeData.addEventListener('input', () => {
      clearTimeout(window._barcodeTimer);
      window._barcodeTimer = setTimeout(renderBarcode, 500);
    });
  }

  [barcodeFormat, barcodeWidth].forEach(el => {
    if (el) el.addEventListener('change', renderBarcode);
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    if (canvas.width === 0 || canvas.height === 0) {
      Utils.showToast('Generate a barcode first', 'error');
      return;
    }
    Utils.downloadCanvas(canvas, 'barcode', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (barcodeData) barcodeData.value = '';
    if (barcodeFormat) barcodeFormat.value = 'code128';
    if (barcodeWidth) barcodeWidth.value = '2';
    canvas.width = 400;
    canvas.height = 200;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter data above and click Generate', 200, 100);
  });

  /* ── Initial state ── */
  canvas.width = 400;
  canvas.height = 200;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 200);
  ctx.fillStyle = '#999';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter data above and click Generate', 200, 100);
});
