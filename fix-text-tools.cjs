/**
 * Fix text tool HTML pages — replace image layout with textarea layout
 * Run: node fix-text-tools.cjs
 */
const fs = require('fs');
const path = require('path');

const BASE = 'c:/Users/Dell/Downloads/Editing Tools';

// Shared header/footer parts (reuse existing pattern)
function getHeader(tool) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.name} — Free Online Tool | EditPro Hub</title>
  <meta name="description" content="${tool.shortDesc}">
  <link rel="canonical" href="https://editprohub.com/tools/text-tools/${tool.id}.html">
  <meta property="og:title" content="${tool.name} — EditPro Hub">
  <meta property="og:description" content="${tool.shortDesc}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/tool.css">
</head>
<body>
  <nav class="navbar"><div class="navbar-inner">
    <a href="/" class="navbar-logo"><span class="logo-icon">⚡</span><span>EditPro Hub</span></a>
    <div class="navbar-nav"><div class="nav-dropdown"><button aria-expanded="false">Categories ▾</button><div class="nav-dropdown-menu" id="nav-categories"></div></div><a href="/about.html">About</a><a href="/contact.html">Contact</a></div>
    <div class="navbar-actions"><button class="theme-toggle" aria-label="Toggle dark mode">🌙</button><button class="mobile-menu-btn">☰</button></div>
  </div></nav>
  <main class="tool-page">
    <div class="tool-header">
      <div class="breadcrumb"><a href="/">Home</a> <span>/</span> <a href="/#cat-text-tools">Text & Typography</a> <span>/</span> <span>${tool.name}</span></div>
      <h1>${tool.icon} ${tool.name}</h1>
      <p class="tool-tagline">${tool.shortDesc}</p>
    </div>
    <!-- Ad slot -->
    <div class="ad-slot" style="min-height:90px;margin:0 var(--container-padding) var(--space-6);">Advertisement</div>
    <div class="tool-container">
      ${tool.content}
    </div>
    <!-- Ad slot -->
    <div class="ad-slot" style="min-height:250px;margin:var(--space-8) var(--container-padding);">Advertisement</div>
    <div class="tool-info">
      <section><h2>How to Use ${tool.name}</h2>
        <ol>
          <li><strong>Enter or paste your text</strong> — Type or paste the text you want to process into the input area.</li>
          <li><strong>Choose your settings</strong> — Select the options you want from the controls below the input.</li>
          <li><strong>View and copy results</strong> — The result updates in real time. Click copy to use it.</li>
        </ol>
        <p>${tool.longDesc}</p>
      </section>
      <section><h2>Features</h2><ul>${tool.features.map(f => `<li>${f}</li>`).join('')}</ul></section>
      <section><h2>Frequently Asked Questions</h2><div class="faq-list">
        ${tool.faq.map(([q,a]) => `<div class="faq-item"><button class="faq-question" aria-expanded="false">${q}<span class="faq-chevron">▾</span></button><div class="faq-answer"><p>${a}</p></div></div>`).join('')}
      </div></section>
    </div>
  </main>
  <footer class="footer"><div class="container"><div class="footer-grid">
    <div class="footer-brand"><a href="/" class="navbar-logo" style="color:white;"><span class="logo-icon">⚡</span><span>EditPro Hub</span></a><p>100+ free browser-based editing tools. Your files never leave your device.</p></div>
    <div><h4>Tools</h4><div class="footer-links"><a href="/tools/image-editing/brightness.html">Image Editing</a><a href="/tools/text-tools/word-counter.html">Text Tools</a></div></div>
    <div><h4>Company</h4><div class="footer-links"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy-policy.html">Privacy</a><a href="/terms.html">Terms</a></div></div>
  </div><div class="footer-bottom"><p>&copy; 2025 EditPro Hub</p></div></div></footer>
  <button class="back-to-top" aria-label="Back to top">↑</button>
  <div class="cookie-banner" role="dialog" aria-label="Cookie consent"><div class="cookie-inner"><p>🍪 We use cookies and third-party ads. By using our site, you agree to our <a href="/privacy-policy.html">Privacy Policy</a>.</p><div class="cookie-actions"><button class="btn btn-primary btn-sm cookie-accept">Accept</button><button class="btn btn-ghost btn-sm cookie-dismiss">Dismiss</button></div></div></div>
  <script src="/assets/js/utils.js"></script>
  <script src="/assets/js/tools-registry.js"></script>
  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/tools/${tool.id}.js"></script>
</body>
</html>`;
}

// Tool definitions for text tools
const textTools = [
  {
    id: 'word-counter', icon: '🔢', name: 'Word Counter',
    shortDesc: 'Count words, characters, sentences, paragraphs, and lines in any text.',
    longDesc: 'This word counter tool provides instant statistics for any text you type or paste. It counts words, characters (with and without spaces), sentences, paragraphs, lines, and estimates reading and speaking time.',
    features: ['Real-time word and character counting', 'Sentence, paragraph, and line statistics', 'Reading and speaking time estimates', 'Copy-friendly results display'],
    faq: [['Is the counting real-time?', 'Yes! Statistics update instantly as you type or paste text.'], ['How is reading time calculated?', 'Reading time is estimated at 200 words per minute, the average adult reading speed.'], ['What counts as a word?', 'Any sequence of characters separated by spaces or line breaks is counted as a word.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Your Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Type or paste your text here..." aria-label="Input text"></textarea>
      </div>
      <div class="text-tool-panel">
        <h3>📊 Statistics</h3>
        <div id="stats-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);"></div>
      </div>
    </div>`
  },
  {
    id: 'char-counter', icon: '#️⃣', name: 'Character Counter',
    shortDesc: 'Count characters with and without spaces, track social media limits.',
    longDesc: 'Monitor character counts for social media posts, SMS messages, or any text with character limits.',
    features: ['Characters with and without spaces', 'Social media limit tracking (Twitter, Instagram, Facebook, LinkedIn)', 'Real-time progress bars with color coding'],
    faq: [['What social media limits are shown?', 'Twitter (280), Instagram (2200), Facebook (63206), and LinkedIn (3000) character limits.'], ['How do special characters count?', 'Each character counts as one. Some emojis may count as 2 characters.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Your Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Type or paste your text here..." aria-label="Input text"></textarea>
      </div>
      <div class="text-tool-panel">
        <h3>📊 Character Count</h3>
        <div id="char-stats" style="display:flex;flex-direction:column;gap:var(--space-3);"></div>
        <h3 style="margin-top:var(--space-4);">📱 Social Media Limits</h3>
        <div id="social-limits" style="display:flex;flex-direction:column;gap:var(--space-3);"></div>
      </div>
    </div>`
  },
  {
    id: 'case-converter', icon: '🔡', name: 'Case Converter',
    shortDesc: 'Convert text between UPPER CASE, lower case, Title Case, Sentence case, and more.',
    longDesc: 'Transform text between different cases with one click. Perfect for formatting titles, headings, or fixing accidentally caps-locked text.',
    features: ['UPPERCASE, lowercase, Title Case, Sentence case', 'aLtErNaTiNg CaSe and InVeRsE CaSe', 'One-click conversion with real-time preview', 'Copy result to clipboard'],
    faq: [['What is Title Case?', 'Title Case capitalizes the first letter of each major word. Common for headings and titles.'], ['What is Sentence case?', 'Sentence case capitalizes only the first letter of the first word in each sentence.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Type or paste text here..." aria-label="Input text"></textarea>
        <div class="text-tool-actions" style="margin-top:var(--space-3);">
          <button class="btn btn-sm btn-outline" data-case="upper">UPPERCASE</button>
          <button class="btn btn-sm btn-outline" data-case="lower">lowercase</button>
          <button class="btn btn-sm btn-outline" data-case="title">Title Case</button>
          <button class="btn btn-sm btn-outline" data-case="sentence">Sentence case</button>
          <button class="btn btn-sm btn-outline" data-case="alternating">aLtErNaTiNg</button>
          <button class="btn btn-sm btn-outline" data-case="inverse">InVeRsE</button>
        </div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;white-space:pre-wrap;overflow-wrap:break-word;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'text-reverser', icon: '🔃', name: 'Text Reverser',
    shortDesc: 'Reverse any text string character by character, word by word, or line by line.',
    longDesc: 'Reverse text in multiple ways: reverse all characters, reverse word order, or reverse individual words.',
    features: ['Reverse all characters', 'Reverse word order', 'Reverse each word individually', 'One-click copy'],
    faq: [['What reversal options are available?', 'Reverse characters, reverse word order, and reverse each word individually.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Enter text to reverse..." aria-label="Input text"></textarea>
        <div class="text-tool-actions" style="margin-top:var(--space-3);">
          <button class="btn btn-sm btn-outline" data-reverse="chars">Reverse Characters</button>
          <button class="btn btn-sm btn-outline" data-reverse="words">Reverse Words</button>
          <button class="btn btn-sm btn-outline" data-reverse="lines">Reverse Lines</button>
        </div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'duplicate-remover', icon: '🧹', name: 'Duplicate Line Remover',
    shortDesc: 'Remove duplicate lines from text while preserving line order.',
    longDesc: 'Clean up lists and text by removing duplicate lines. Optionally match case and remove empty lines.',
    features: ['Remove exact duplicates', 'Case-sensitive matching option', 'Remove empty lines option', 'Show original and unique line counts'],
    faq: [['Does it preserve line order?', 'Yes, the first occurrence of each line is preserved in its original position.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Paste text with duplicate lines..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label class="toggle" style="justify-content:space-between;width:100%;">Case Sensitive<input type="checkbox" id="caseSensitive"><span class="toggle-slider"></span></label></div>
        <div class="control-group"><label class="toggle" style="justify-content:space-between;width:100%;">Remove Empty Lines<input type="checkbox" id="removeEmpty" checked><span class="toggle-slider"></span></label></div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div id="dup-stats" style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-2);"></div>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'slug-converter', icon: '🔗', name: 'Text to Slug Converter',
    shortDesc: 'Convert any text to a URL-friendly slug format.',
    longDesc: 'Transform text into clean, URL-friendly slugs by removing special characters and replacing spaces with separators.',
    features: ['Instant slug generation', 'Custom separator options', 'Remove special characters', 'Lowercase conversion'],
    faq: [['What is a URL slug?', 'A slug is the part of a URL that identifies a page using readable words, like "my-post-title" in example.com/my-post-title.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <input type="text" id="text-input" placeholder="Enter text to convert to a slug..." aria-label="Input text" style="width:100%;padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg);color:var(--text-primary);font-size:var(--text-base);">
        <div class="control-group" style="margin-top:var(--space-2);"><label>Separator</label><select id="separator"><option value="-">Hyphen (-)</option><option value="_">Underscore (_)</option><option value=".">Dot (.)</option><option value="+">Custom</option></select></div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:60px;font-size:var(--text-lg);"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'lorem-ipsum', icon: '📄', name: 'Lorem Ipsum Generator',
    shortDesc: 'Generate Lorem Ipsum placeholder text for design mockups.',
    longDesc: 'Create placeholder text in paragraphs, sentences, or word counts for design and layout previews.',
    features: ['Paragraph, sentence, or word mode', 'Customizable count', 'Classic Lorem Ipsum text', 'Copy to clipboard'],
    faq: [['What is Lorem Ipsum?', 'Lorem Ipsum is placeholder text used in the design and publishing industry since the 1500s.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>⚙️ Options</h3>
        <div class="control-group"><label>Type</label><select id="loremType"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
        <div class="control-group"><label>Count</label><input type="number" id="loremCount" value="4" min="1" max="100" style="width:100%;padding:var(--space-2) var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg);color:var(--text-primary);"></div>
        <button class="btn btn-primary" id="generate-btn">🔄 Generate</button>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:300px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'text-diff', icon: '🔍', name: 'Text Diff Checker',
    shortDesc: 'Compare two texts and highlight differences between them.',
    longDesc: 'Compare two versions of text side by side with clear highlighting of additions and deletions.',
    features: ['Side-by-side comparison', 'Added text highlighted in green', 'Removed text highlighted in red', 'Ignore whitespace option'],
    faq: [['How does the comparison work?', 'The tool compares both texts line by line, highlighting additions in green and deletions in red.']],
    content: `<div class="control-group"><label class="toggle" style="justify-content:space-between;width:auto;gap:var(--space-3);">Ignore Whitespace<input type="checkbox" id="ignoreWhitespace"><span class="toggle-slider"></span></label></div>
    <div class="text-tool-layout" style="margin-top:var(--space-3);">
      <div class="text-tool-panel"><h3>📝 Original Text</h3><textarea class="tool-textarea" id="text-input" placeholder="Original text..." aria-label="Original text"></textarea></div>
      <div class="text-tool-panel"><h3>📝 Modified Text</h3><textarea class="tool-textarea" id="text-input2" placeholder="Modified text..." aria-label="Modified text"></textarea></div>
    </div>
    <div class="text-tool-panel" style="margin-top:var(--space-3);">
      <h3>✅ Differences</h3>
      <div id="diff-output" style="min-height:200px;font-family:var(--font-mono);font-size:var(--text-sm);line-height:1.8;white-space:pre-wrap;overflow-wrap:break-word;padding:var(--space-3);"></div>
      <div id="diff-stats" style="font-size:var(--text-sm);color:var(--text-muted);margin-top:var(--space-2);"></div>
    </div>`
  },
  {
    id: 'text-sorter', icon: '📋', name: 'Text Sorter',
    shortDesc: 'Sort lines of text alphabetically, numerically, or by length.',
    longDesc: 'Quickly organize text lines in ascending or descending order with various sorting methods.',
    features: ['Alphabetical sort A-Z and Z-A', 'Numeric sort', 'Sort by line length', 'Remove duplicates option'],
    faq: [['Can I sort numbers correctly?', 'Numeric sort handles numbers in their correct numerical order, not alphabetically.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Enter text lines to sort..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label>Sort Order</label><select id="sortOrder"><option value="alpha-asc">Alphabetical (A-Z)</option><option value="alpha-desc">Alphabetical (Z-A)</option><option value="num-asc">Numeric (Low-High)</option><option value="num-desc">Numeric (High-Low)</option><option value="len-asc">Length (Short-Long)</option><option value="len-desc">Length (Long-Short)</option></select></div>
        <label class="toggle" style="justify-content:space-between;width:100%;margin-top:var(--space-2);">Remove Duplicates<input type="checkbox" id="sortDedup"><span class="toggle-slider"></span></label>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'text-formatter', icon: '✨', name: 'Text Formatter',
    shortDesc: 'Clean and format text with proper spacing and line breaks.',
    longDesc: 'Fix messy text copied from emails or documents by normalizing spacing and line breaks.',
    features: ['Fix multiple spaces', 'Normalize line breaks', 'Trim trailing whitespace', 'Clean up text formatting'],
    faq: [['Can I fix text copied from Word?', 'Yes! The formatter handles smart quotes, non-breaking spaces, and other formatting artifacts from word processors.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Paste messy text here..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label class="toggle" style="justify-content:space-between;width:100%;">Fix Multiple Spaces<input type="checkbox" id="fixSpaces" checked><span class="toggle-slider"></span></label></div>
        <div class="control-group"><label class="toggle" style="justify-content:space-between;width:100%;">Normalize Line Breaks<input type="checkbox" id="fixLineBreaks" checked><span class="toggle-slider"></span></label></div>
        <div class="control-group"><label class="toggle" style="justify-content:space-between;width:100%;">Trim Trailing Whitespace<input type="checkbox" id="trimTrailing" checked><span class="toggle-slider"></span></label></div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'whitespace-remover', icon: '🗑️', name: 'Whitespace Remover',
    shortDesc: 'Remove extra spaces, tabs, line breaks, and all whitespace from text.',
    longDesc: 'Clean text by removing unwanted whitespace. Choose from various removal modes for different needs.',
    features: ['Remove extra spaces only', 'Remove all spaces', 'Remove tabs', 'Remove line breaks', 'Remove everything including all whitespace'],
    faq: [['Can I keep single spaces between words?', 'Yes, choose "Remove Extra Spaces" to collapse multiple spaces while keeping word separation.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input Text</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Paste text with unwanted whitespace..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label>Mode</label><select id="wsMode"><option value="extra">Remove Extra Spaces</option><option value="all-spaces">Remove All Spaces</option><option value="tabs">Remove Tabs</option><option value="breaks">Remove Line Breaks</option><option value="everything">Remove Everything</option></select></div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn" style="margin-top:var(--space-2);">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'encoder-decoder', icon: '🔐', name: 'Text Encoder/Decoder',
    shortDesc: 'Encode and decode text in Base64, URL, and HTML entity formats.',
    longDesc: 'Transform text between different encoding formats commonly used in web development.',
    features: ['Base64 encode and decode', 'URL encoding and decoding', 'HTML entity encoding', 'One-click copy and swap'],
    faq: [['What is Base64 encoding?', 'Base64 converts binary data to ASCII characters. Commonly used for embedding data in URLs and data URIs.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Enter text to encode or decode..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label>Encoding Type</label><select id="encType"><option value="base64">Base64</option><option value="url">URL Encoding</option><option value="html">HTML Entities</option></select></div>
        <div class="text-tool-actions" style="margin-top:var(--space-2);">
          <button class="btn btn-primary btn-sm" id="encode-btn">Encode →</button>
          <button class="btn btn-secondary btn-sm" id="decode-btn">Decode →</button>
        </div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn">📋 Copy to Clipboard</button>
      </div>
    </div>`
  },
  {
    id: 'binary-ascii', icon: '💻', name: 'Binary/ASCII Converter',
    shortDesc: 'Convert text to binary, decimal, hexadecimal, and octal representations.',
    longDesc: 'See how text is represented in different number systems. Great for learning computer science concepts.',
    features: ['Binary (8-bit) representation', 'Decimal code display', 'Hexadecimal representation', 'Octal format', 'Reverse conversion (back to text)'],
    faq: [['What is binary representation?', 'Binary represents each character as 8 bits (0s and 1s), showing how computers store data internally.']],
    content: `<div class="text-tool-layout">
      <div class="text-tool-panel">
        <h3>📝 Input</h3>
        <textarea class="tool-textarea" id="text-input" placeholder="Enter text or number codes..." aria-label="Input text"></textarea>
        <div class="control-group" style="margin-top:var(--space-2);"><label>Output Format</label><select id="binaryFormat"><option value="binary">Binary (8-bit)</option><option value="decimal">Decimal</option><option value="hex">Hexadecimal</option><option value="octal">Octal</option></select></div>
        <div class="text-tool-actions" style="margin-top:var(--space-2);">
          <button class="btn btn-primary btn-sm" id="convert-btn">Convert →</button>
          <button class="btn btn-secondary btn-sm" id="reverse-btn">← Reverse</button>
        </div>
      </div>
      <div class="text-tool-panel">
        <h3>✅ Result</h3>
        <div class="tool-output" id="text-output" style="min-height:200px;font-family:var(--font-mono);font-size:var(--text-sm);"></div>
        <button class="btn btn-primary btn-sm" id="copy-btn">📋 Copy to Clipboard</button>
      </div>
    </div>`
  }
];

// Generate all pages
textTools.forEach(tool => {
  const html = getHeader(tool);
  const filePath = path.join(BASE, 'tools', 'text-tools', `${tool.id}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✓ Updated: text-tools/${tool.id}.html`);
});

console.log(`\n✅ Updated ${textTools.length} text tool pages with proper layouts!`);
