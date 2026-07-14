/**
 * Binary / ASCII Converter — Convert text to binary, decimal, hex, octal
 * Controls: select#binaryFormat (Binary 8-bit, Decimal, Hexadecimal, Octal)
 * Toggle direction for reverse conversion.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const binaryFormat = document.getElementById('binaryFormat');
  const toggleDirBtn = document.getElementById('toggle-dir-btn');

  let isEncodeMode = true; // true = text -> code, false = code -> text

  function textToBinary(text) {
    return text.split('').map(c => {
      const bin = c.charCodeAt(0).toString(2);
      return bin.padStart(8, '0');
    }).join(' ');
  }

  function textToDecimal(text) {
    return text.split('').map(c => c.charCodeAt(0).toString(10)).join(' ');
  }

  function textToHex(text) {
    return text.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  function textToOctal(text) {
    return text.split('').map(c => c.charCodeAt(0).toString(8)).join(' ');
  }

  function binaryToText(encoded) {
    return encoded.trim().split(/\s+/).map(code => {
      const charCode = parseInt(code, 2);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  }

  function decimalToText(encoded) {
    return encoded.trim().split(/\s+/).map(code => {
      const charCode = parseInt(code, 10);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  }

  function hexToText(encoded) {
    return encoded.trim().split(/\s+/).map(code => {
      const charCode = parseInt(code, 16);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  }

  function octalToText(encoded) {
    return encoded.trim().split(/\s+/).map(code => {
      const charCode = parseInt(code, 8);
      return isNaN(charCode) ? '' : String.fromCharCode(charCode);
    }).join('');
  }

  function process() {
    if (!input || !output) return;
    const text = input.value;
    const format = binaryFormat ? binaryFormat.value : 'binary';

    if (isEncodeMode) {
      switch (format) {
        case 'binary':
          output.textContent = textToBinary(text);
          break;
        case 'decimal':
          output.textContent = textToDecimal(text);
          break;
        case 'hex':
          output.textContent = textToHex(text);
          break;
        case 'octal':
          output.textContent = textToOctal(text);
          break;
      }
    } else {
      // Decode mode
      switch (format) {
        case 'binary':
          output.textContent = binaryToText(text);
          break;
        case 'decimal':
          output.textContent = decimalToText(text);
          break;
        case 'hex':
          output.textContent = hexToText(text);
          break;
        case 'octal':
          output.textContent = octalToText(text);
          break;
      }
    }
  }

  toggleDirBtn?.addEventListener('click', () => {
    isEncodeMode = !isEncodeMode;
    toggleDirBtn.textContent = isEncodeMode ? 'Text to Code' : 'Code to Text';
    toggleDirBtn.classList.toggle('active', !isEncodeMode);
    Utils.showToast(isEncodeMode ? 'Mode: Text to Code' : 'Mode: Code to Text', 'info');
    process();
  });

  [input, binaryFormat].forEach(el => {
    if (!el) return;
    el.addEventListener('input', process);
    el.addEventListener('change', process);
  });

  copyBtn?.addEventListener('click', () => {
    if (output) {
      navigator.clipboard.writeText(output.textContent).then(() => {
        Utils.showToast('Copied to clipboard!', 'success');
      }).catch(() => Utils.showToast('Failed to copy', 'error'));
    }
  });

  process();
});
