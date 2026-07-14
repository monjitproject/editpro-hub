/**
 * Whitespace Remover — Remove various types of whitespace
 * Controls: select#wsMode (Remove Extra Spaces, Remove All Spaces,
 *   Remove Tabs, Remove Line Breaks, Remove Everything)
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const wsMode = document.getElementById('wsMode');

  function process() {
    if (!input) return;
    const text = input.value;
    const mode = wsMode ? wsMode.value : 'extra-spaces';
    let result;

    switch (mode) {
      case 'extra-spaces':
        result = text.replace(/[^\S\n]+/g, ' '); // Collapse horizontal whitespace, preserve line breaks
        break;
      case 'all-spaces':
        result = text.replace(/\s/g, ''); // Remove all whitespace
        break;
      case 'tabs':
        result = text.replace(/\t/g, ' '); // Replace tabs with spaces
        break;
      case 'line-breaks':
        result = text.replace(/[\r\n]+/g, ' '); // Replace line breaks with spaces
        break;
      case 'everything':
        result = text.replace(/\s/g, ''); // Remove absolutely all whitespace
        break;
      default:
        result = text;
    }

    if (output) output.textContent = result;
  }

  [input, wsMode].forEach(el => {
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
