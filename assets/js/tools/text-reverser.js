/**
 * Text Reverser — Reverse characters, words, or lines
 * Pure text tool with three reversal modes.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');

  function process() {
    if (!input) return;
    const text = input.value;
    if (output) output.textContent = text;
  }

  const reversers = {
    reverseChars: (text) => text.split('').reverse().join(''),
    reverseWords: (text) => text.split(/\s+/).reverse().join(' '),
    reverseLines: (text) => text.split('\n').reverse().join('\n')
  };

  document.querySelectorAll('[data-reverse]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!input || !output) return;
      const mode = btn.dataset.reverse;
      const fn = reversers[mode];
      if (fn) {
        output.textContent = fn(input.value);
        Utils.showToast(`Reversed: ${btn.textContent.trim()}`, 'success');
      }
    });
  });

  copyBtn?.addEventListener('click', () => {
    if (output) {
      navigator.clipboard.writeText(output.textContent).then(() => {
        Utils.showToast('Copied to clipboard!', 'success');
      }).catch(() => Utils.showToast('Failed to copy', 'error'));
    }
  });

  input?.addEventListener('input', process);
  process();
});
