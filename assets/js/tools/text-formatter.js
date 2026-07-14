/**
 * Text Formatter — Clean up and format text
 * Controls: #fixSpaces, #fixLineBreaks, #trimTrailing (all toggles, default true)
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const fixSpaces = document.getElementById('fixSpaces');
  const fixLineBreaks = document.getElementById('fixLineBreaks');
  const trimTrailing = document.getElementById('trimTrailing');

  // Set defaults
  if (fixSpaces) fixSpaces.checked = true;
  if (fixLineBreaks) fixLineBreaks.checked = true;
  if (trimTrailing) trimTrailing.checked = true;

  function process() {
    if (!input) return;
    let text = input.value;

    // Normalize line breaks to \n
    if (fixLineBreaks && fixLineBreaks.checked) {
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Collapse multiple spaces into one
    if (fixSpaces && fixSpaces.checked) {
      text = text.replace(/[^\S\n]+/g, ' ');
    }

    // Trim trailing whitespace on each line
    if (trimTrailing && trimTrailing.checked) {
      text = text.split('\n').map(line => line.trimEnd()).join('\n');
    }

    // Trim leading/trailing whitespace of entire text
    text = text.trim();

    if (output) output.textContent = text;
  }

  [input, fixSpaces, fixLineBreaks, trimTrailing].forEach(el => {
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
