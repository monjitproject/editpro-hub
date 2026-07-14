/**
 * Case Converter — Convert text between various case styles
 * UPPERCASE, lowercase, Title Case, Sentence case, aLtErNaTiNg, InVeRsE
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');

  function process(text) {
    return text;
  }

  // Case transform functions
  const transforms = {
    uppercase: (text) => text.toUpperCase(),
    lowercase: (text) => text.toLowerCase(),
    title: (text) => text.replace(/\b\w/g, c => c.toUpperCase()),
    sentence: (text) => text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, sep, char) => sep + char.toUpperCase()),
    alternating: (text) => text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
    inverse: (text) => text.split('').map(c => {
      if (c === c.toUpperCase() && c !== c.toLowerCase()) return c.toLowerCase();
      if (c === c.toLowerCase() && c !== c.toUpperCase()) return c.toUpperCase();
      return c;
    }).join('')
  };

  // Bind buttons to transforms
  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!input || !output) return;
      const type = btn.dataset.case;
      const fn = transforms[type];
      if (fn) {
        output.textContent = fn(input.value);
        Utils.showToast(`Applied ${btn.textContent.trim()}`, 'success');
      }
    });
  });

  // Copy button
  document.getElementById('copy-btn')?.addEventListener('click', () => {
    if (output) {
      navigator.clipboard.writeText(output.textContent).then(() => {
        Utils.showToast('Copied to clipboard!', 'success');
      }).catch(() => Utils.showToast('Failed to copy', 'error'));
    }
  });

  // Real-time output mirroring input
  input?.addEventListener('input', () => {
    if (output) output.textContent = input.value;
  });
});
