/**
 * Character Counter — Character counts with social media progress bars
 * Pure text tool showing Twitter, Instagram, Facebook, LinkedIn limits.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');

  const platforms = [
    { name: 'Twitter / X', limit: 280, id: 'twitter' },
    { name: 'Instagram', limit: 2200, id: 'instagram' },
    { name: 'Facebook', limit: 63206, id: 'facebook' },
    { name: 'LinkedIn', limit: 3000, id: 'linkedin' }
  ];

  function process() {
    if (!input) return;
    const text = input.value;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, '').length;

    // Update character count displays
    const countEl = document.getElementById('char-count');
    const countNoSpacesEl = document.getElementById('char-count-nospaces');
    if (countEl) countEl.textContent = charCount;
    if (countNoSpacesEl) countNoSpacesEl.textContent = charNoSpaces;

    // Update progress bars
    platforms.forEach(platform => {
      const bar = document.getElementById(`${platform.id}-bar`);
      const label = document.getElementById(`${platform.id}-label`);
      const remaining = document.getElementById(`${platform.id}-remaining`);

      if (!bar) return;

      const pct = (charCount / platform.limit) * 100;
      const clampedPct = Math.min(pct, 100);
      bar.style.width = clampedPct + '%';

      // Color code: green (<50%), yellow (50-80%), orange (80-95%), red (>95%)
      bar.classList.remove('bar-green', 'bar-yellow', 'bar-orange', 'bar-red');
      if (pct < 50) {
        bar.classList.add('bar-green');
      } else if (pct < 80) {
        bar.classList.add('bar-yellow');
      } else if (pct < 95) {
        bar.classList.add('bar-orange');
      } else {
        bar.classList.add('bar-red');
      }

      if (label) {
        label.textContent = `${platform.name}: ${charCount.toLocaleString()} / ${platform.limit.toLocaleString()}`;
      }
      if (remaining) {
        const left = platform.limit - charCount;
        remaining.textContent = left >= 0 ? `${left.toLocaleString()} remaining` : `${Math.abs(left).toLocaleString()} over limit`;
      }
    });
  }

  input?.addEventListener('input', process);

  // Initial render
  process();
});
