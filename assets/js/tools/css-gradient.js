/**
 * CSS Gradient Tool
 * Generate copy-ready CSS gradient code with live preview.
 * Controls:
 *   select#cssGradType  (Linear / Radial)
 *   color#cssGrad1      (default: #667eea)
 *   color#cssGrad2      (default: #764ba2)
 *   range#cssGradAngle  (0-360, default: 135)
 * Shows preview and code in a pre/code block.
 */
document.addEventListener('DOMContentLoaded', () => {
  const cssGradType = document.getElementById('cssGradType');
  const cssGrad1 = document.getElementById('cssGrad1');
  const cssGrad2 = document.getElementById('cssGrad2');
  const cssGradAngle = document.getElementById('cssGradAngle');
  const angleDisplay = document.getElementById('cssAngleDisplay');
  const previewEl = document.getElementById('cssGradientPreview');
  const codeBlock = document.getElementById('cssCodeBlock');

  function generateCSSGradient() {
    const type = cssGradType ? cssGradType.value : 'linear';
    const c1 = cssGrad1 ? cssGrad1.value : '#667eea';
    const c2 = cssGrad2 ? cssGrad2.value : '#764ba2';
    const angle = cssGradAngle ? cssGradAngle.value : 135;

    let gradientCSS = '';
    let fullCSS = '';

    if (type === 'linear') {
      gradientCSS = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
      fullCSS = `.element {\n  background: ${gradientCSS};\n}`;
    } else {
      gradientCSS = `radial-gradient(circle, ${c1}, ${c2})`;
      fullCSS = `.element {\n  background: ${gradientCSS};\n}`;
    }

    // Update preview
    if (previewEl) {
      previewEl.style.background = gradientCSS;
    }

    // Update code block
    if (codeBlock) {
      codeBlock.textContent = fullCSS;
    }

    // Update angle display
    if (angleDisplay) {
      angleDisplay.textContent = angle + '°';
    }
  }

  // ── Control event listeners ──
  if (cssGradType) cssGradType.addEventListener('change', generateCSSGradient);
  if (cssGrad1) cssGrad1.addEventListener('input', generateCSSGradient);
  if (cssGrad2) cssGrad2.addEventListener('input', generateCSSGradient);
  if (cssGradAngle) cssGradAngle.addEventListener('input', generateCSSGradient);

  // ── Copy code ──
  const copyBtn = document.getElementById('copyCSSCode');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = codeBlock ? codeBlock.textContent : '';
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(() => {
          Utils.showToast('CSS gradient code copied!', 'success');
        });
      }
    });
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (cssGradType) cssGradType.value = 'linear';
      if (cssGrad1) cssGrad1.value = '#667eea';
      if (cssGrad2) cssGrad2.value = '#764ba2';
      if (cssGradAngle) cssGradAngle.value = 135;
      generateCSSGradient();
      Utils.showToast('CSS gradient reset to default', 'info');
    });
  }

  // ── Initialize ──
  generateCSSGradient();
});
