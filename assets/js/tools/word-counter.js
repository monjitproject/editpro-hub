/**
 * Word Counter — Count words, characters, sentences, paragraphs, lines
 * Pure text tool with real-time stats.
 */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input') || document.querySelector('textarea');
  const statsContainer = document.getElementById('stats-container') || document.querySelector('.stats-grid');

  function process() {
    if (!input) return;
    const text = input.value;

    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCountWithSpaces = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const sentenceCount = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphCount = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0);
    const lineCount = text === '' ? 0 : text.split('\n').length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const speakingTimeMinutes = Math.ceil(wordCount / 130);

    const stats = [
      { label: 'Words', value: wordCount },
      { label: 'Characters (with spaces)', value: charCountWithSpaces },
      { label: 'Characters (no spaces)', value: charCountNoSpaces },
      { label: 'Sentences', value: sentenceCount },
      { label: 'Paragraphs', value: paragraphCount },
      { label: 'Lines', value: lineCount },
      { label: 'Reading Time', value: readingTimeMinutes === 0 ? '< 1 min' : readingTimeMinutes + ' min' },
      { label: 'Speaking Time', value: speakingTimeMinutes === 0 ? '< 1 min' : speakingTimeMinutes + ' min' }
    ];

    updateStatsDisplay(stats);
  }

  function updateStatsDisplay(stats) {
    // Try to find individual stat elements by ID pattern: stat-<label>
    const idMap = {
      'Words': 'stat-words',
      'Characters (with spaces)': 'stat-char-spaces',
      'Characters (no spaces)': 'stat-char-nospaces',
      'Sentences': 'stat-sentences',
      'Paragraphs': 'stat-paragraphs',
      'Lines': 'stat-lines',
      'Reading Time': 'stat-reading',
      'Speaking Time': 'stat-speaking'
    };

    stats.forEach(stat => {
      const id = idMap[stat.label];
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          const valueEl = el.querySelector('.stat-value') || el.querySelector('.value');
          if (valueEl) valueEl.textContent = stat.value;
        }
      }
    });

    // Fallback: render all stats into stats container
    if (statsContainer) {
      statsContainer.innerHTML = stats.map(stat => `
        <div class="stat-card">
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `).join('');
    }
  }

  input?.addEventListener('input', process);

  // Initial render
  process();
});
