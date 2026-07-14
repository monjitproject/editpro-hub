/**
 * Text Sorter — Sort lines of text in various orders
 * Controls: select#sortOrder, toggle#sortDedup
 * Alphabetical A-Z, Z-A, Numeric Low-High, High-Low, Length Short-Long, Long-Short
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const sortOrder = document.getElementById('sortOrder');
  const sortDedup = document.getElementById('sortDedup');

  function process() {
    if (!input) return;
    let lines = input.value.split('\n');
    const order = sortOrder ? sortOrder.value : 'alpha-az';
    const dedup = sortDedup ? sortDedup.checked : false;

    // Optionally deduplicate
    if (dedup) {
      const seen = new Set();
      lines = lines.filter(line => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    }

    // Sort
    const sorted = [...lines].sort((a, b) => {
      switch (order) {
        case 'alpha-az':
          return a.localeCompare(b);
        case 'alpha-za':
          return b.localeCompare(a);
        case 'num-low-high': {
          const na = parseFloat(a) || 0;
          const nb = parseFloat(b) || 0;
          return na - nb;
        }
        case 'num-high-low': {
          const na = parseFloat(a) || 0;
          const nb = parseFloat(b) || 0;
          return nb - na;
        }
        case 'len-short-long':
          return a.length - b.length;
        case 'len-long-short':
          return b.length - a.length;
        default:
          return a.localeCompare(b);
      }
    });

    if (output) output.textContent = sorted.join('\n');
  }

  [input, sortOrder, sortDedup].forEach(el => {
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
