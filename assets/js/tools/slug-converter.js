/**
 * Slug Converter — Convert text to URL-friendly slug
 * Pure text tool with separator selection.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const separatorSelect = document.getElementById('separator');
  const customSeparator = document.getElementById('customSeparator');

  function toSlug(text, sep) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')          // Remove special characters
      .replace(/[\s_]+/g, sep)            // Replace spaces/underscores with separator
      .replace(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '+', 'g'), sep) // Collapse consecutive separators
      .replace(new RegExp('^' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|'+ sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'g'), ''); // Trim separators from ends
  }

  function process() {
    if (!input) return;
    const text = input.value;
    let sep = separatorSelect ? separatorSelect.value : '-';
    if (sep === 'custom' && customSeparator) {
      sep = customSeparator.value || '-';
    }
    const slug = toSlug(text, sep);
    if (output) output.textContent = slug;
  }

  [input, separatorSelect, customSeparator].forEach(el => {
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
