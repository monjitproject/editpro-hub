/**
 * Encoder / Decoder — Base64, URL Encoding, HTML Entities
 * Controls: select#encType, Encode/Decode buttons
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const encType = document.getElementById('encType');
  const encodeBtn = document.getElementById('encode-btn');
  const decodeBtn = document.getElementById('decode-btn');

  // HTML entity map
  const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const htmlEntityDecode = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&#x2F;': '/' };

  function encodeBase64(text) {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      return '[Encoding error]';
    }
  }

  function decodeBase64(text) {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (e) {
      return '[Decoding error - invalid Base64]';
    }
  }

  function encodeURL(text) {
    return encodeURIComponent(text);
  }

  function decodeURL(text) {
    try {
      return decodeURIComponent(text);
    } catch (e) {
      return '[Decoding error - invalid URL encoding]';
    }
  }

  function encodeHTML(text) {
    return text.replace(/[&<>"']/g, char => htmlEntities[char]);
  }

  function decodeHTML(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  function getEncoder() {
    const type = encType ? encType.value : 'base64';
    switch (type) {
      case 'base64': return { encode: encodeBase64, decode: decodeBase64 };
      case 'url': return { encode: encodeURL, decode: decodeURL };
      case 'html': return { encode: encodeHTML, decode: decodeHTML };
      default: return { encode: encodeBase64, decode: decodeBase64 };
    }
  }

  encodeBtn?.addEventListener('click', () => {
    if (!input || !output) return;
    const { encode } = getEncoder();
    output.textContent = encode(input.value);
    Utils.showToast('Encoded!', 'success');
  });

  decodeBtn?.addEventListener('click', () => {
    if (!input || !output) return;
    const { decode } = getEncoder();
    output.textContent = decode(input.value);
    Utils.showToast('Decoded!', 'success');
  });

  copyBtn?.addEventListener('click', () => {
    if (output) {
      navigator.clipboard.writeText(output.textContent).then(() => {
        Utils.showToast('Copied to clipboard!', 'success');
      }).catch(() => Utils.showToast('Failed to copy', 'error'));
    }
  });
});
