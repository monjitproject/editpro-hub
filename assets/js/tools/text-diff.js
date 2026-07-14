/**
 * Text Diff — Compare two texts and highlight differences
 * Two textareas side by side, line-by-line/character comparison.
 * Green for additions, red for deletions.
 */
document.addEventListener('DOMContentLoaded', () => {
  const leftInput = document.getElementById('text-left') || document.querySelector('.diff-left textarea');
  const rightInput = document.getElementById('text-right') || document.querySelector('.diff-right textarea');
  const diffOutput = document.getElementById('diff-output') || document.querySelector('.diff-result');
  const ignoreWhitespace = document.getElementById('ignoreWhitespace');
  const statsEl = document.getElementById('diff-stats');

  function diff(a, b, ignoreWS) {
    const aLines = a.split('\n');
    const bLines = b.split('\n');

    const normalize = (s) => ignoreWS ? s.replace(/\s+/g, ' ').trim() : s;

    const result = [];
    let added = 0, removed = 0, unchanged = 0;

    // LCS-based diff
    const m = aLines.length;
    const n = bLines.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (normalize(aLines[i - 1]) === normalize(bLines[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    let i = m, j = n;
    const diffResult = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalize(aLines[i - 1]) === normalize(bLines[j - 1])) {
        diffResult.unshift({ type: 'same', text: aLines[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diffResult.unshift({ type: 'added', text: bLines[j - 1] });
        j--;
      } else {
        diffResult.unshift({ type: 'removed', text: aLines[i - 1] });
        i--;
      }
    }

    return diffResult;
  }

  function process() {
    if (!leftInput || !rightInput) return;
    const left = leftInput.value;
    const right = rightInput.value;
    const ignoreWS = ignoreWhitespace ? ignoreWhitespace.checked : false;

    if (!left && !right) {
      if (diffOutput) diffOutput.innerHTML = '';
      if (statsEl) statsEl.textContent = '';
      return;
    }

    const diffs = diff(left, right, ignoreWS);

    let added = 0, removed = 0, unchanged = 0;
    const html = diffs.map(d => {
      const escaped = Utils.escapeHtml(d.text) || '&nbsp;';
      switch (d.type) {
        case 'added':
          added++;
          return `<div class="diff-line diff-added"><span class="diff-prefix">+</span>${escaped}</div>`;
        case 'removed':
          removed++;
          return `<div class="diff-line diff-removed"><span class="diff-prefix">-</span>${escaped}</div>`;
        default:
          unchanged++;
          return `<div class="diff-line diff-same"><span class="diff-prefix"> </span>${escaped}</div>`;
      }
    }).join('');

    if (diffOutput) diffOutput.innerHTML = html;
    if (statsEl) {
      statsEl.textContent = `+${added} added, -${removed} removed, ${unchanged} unchanged`;
    }
  }

  [leftInput, rightInput].forEach(el => {
    if (el) el.addEventListener('input', process);
  });
  ignoreWhitespace?.addEventListener('change', process);

  process();
});
