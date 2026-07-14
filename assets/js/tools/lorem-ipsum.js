/**
 * Lorem Ipsum Generator — Generate placeholder text
 * Controls: select#loremType (Paragraphs/Sentences/Words), number#loremCount
 */
document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('text-output') || document.querySelector('.tool-output');
  const copyBtn = document.getElementById('copy-btn');
  const loremType = document.getElementById('loremType');
  const loremCount = document.getElementById('loremCount');
  const generateBtn = document.getElementById('generate-btn');

  const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
    'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
    'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
    'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
    'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
    'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
    'nesciunt', 'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus',
    'maxime', 'placeat', 'facere', 'possimus', 'omnis', 'assumenda', 'repellat'
  ];

  function getRandomWord() {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  }

  function generateSentence() {
    const len = 8 + Math.floor(Math.random() * 12);
    const words = [];
    for (let i = 0; i < len; i++) {
      let w = getRandomWord();
      if (i === 0) w = w.charAt(0).toUpperCase() + w.slice(1);
      words.push(w);
    }
    return words.join(' ') + '.';
  }

  function generateParagraph() {
    const sentenceCount = 3 + Math.floor(Math.random() * 5);
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  }

  function generateLorem() {
    const type = loremType ? loremType.value : 'paragraphs';
    const count = loremCount ? Math.max(1, parseInt(loremCount.value, 10) || 5) : 5;
    let result = '';

    switch (type) {
      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;

      case 'sentences':
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;

      case 'words':
        const words = [];
        for (let i = 0; i < count; i++) {
          let w = getRandomWord();
          if (i === 0 || words[words.length - 1]?.endsWith('.')) {
            w = w.charAt(0).toUpperCase() + w.slice(1);
          }
          words.push(w);
        }
        result = words.join(' ');
        break;
    }

    if (output) output.textContent = result;
  }

  generateBtn?.addEventListener('click', generateLorem);
  loremType?.addEventListener('change', generateLorem);
  loremCount?.addEventListener('input', generateLorem);

  copyBtn?.addEventListener('click', () => {
    if (output) {
      navigator.clipboard.writeText(output.textContent).then(() => {
        Utils.showToast('Copied to clipboard!', 'success');
      }).catch(() => Utils.showToast('Failed to copy', 'error'));
    }
  });

  // Generate on load
  generateLorem();
});
