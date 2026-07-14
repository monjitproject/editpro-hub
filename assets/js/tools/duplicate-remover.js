/**
 * Duplicate Remover — Remove duplicate lines from text
 * Pure text tool with case-sensitive and remove-empty toggles.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const caseSensitive = document.getElementById('caseSensitive');
  const removeEmpty = document.getElementById('removeEmpty');
  const originalCountEl = document.getElementById('original-count');
  const dedupCountEl = document.getElementById('dedup-count');

  function process() {
    if (!input) return;
    const text = input.value;
    const lines = text.split('\n');
    const cs = caseSensitive ? caseSensitive.checked : true;
    const re = removeEmpty ? removeEmpty.checked : false;

    const seen = new Set();
    const result = [];

    for (let line of lines) {
      const key = cs ? line : line.toLowerCase();
      if (re && line.trim() === '') continue;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }

    const deduped = result.join('\n');
    if (output) output.textContent = deduped;

    if (originalCountEl) originalCountEl.textContent = lines.length;
    if (dedupCountEl) dedupCountEl.textContent = result.length;
  }

  [input, caseSensitive, removeEmpty].forEach(el => {
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
