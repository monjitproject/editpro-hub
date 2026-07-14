/**
 * Gradient Generator Tool
 * Interactive gradient creator with live preview and copy-ready CSS.
 * Controls:
 *   select#gradType      (Linear / Radial / Conic)
 *   range#gradAngle      (0-360, default: 135)
 *   color#gradColor1     (default: #667eea)
 *   color#gradColor2     (default: #764ba2)
 * Shows gradient preview and displays CSS code that can be copied.
 */
document.addEventListener('DOMContentLoaded', () => {
  const gradType = document.getElementById('gradType');
  const gradAngle = document.getElementById('gradAngle');
  const gradColor1 = document.getElementById('gradColor1');
  const gradColor2 = document.getElementById('gradColor2');
  const angleValue = document.getElementById('angleValue');
  const previewEl = document.getElementById('gradientPreview');
  const codeBlock = document.getElementById('gradientCode');

  function generateGradient() {
    const type = gradType ? gradType.value : 'linear';
    const angle = gradAngle ? gradAngle.value : 135;
    const color1 = gradColor1 ? gradColor1.value : '#667eea';
    const color2 = gradColor2 ? gradColor2.value : '#764ba2';

    let cssValue = '';
    let cssFull = '';

    switch (type) {
      case 'linear':
        cssValue = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        cssFull = `background: ${cssValue};`;
        break;
      case 'radial':
        cssValue = `radial-gradient(circle, ${color1}, ${color2})`;
        cssFull = `background: ${cssValue};`;
        break;
      case 'conic':
        cssValue = `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;
        cssFull = `background: ${cssValue};`;
        break;
      default:
        cssValue = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        cssFull = `background: ${cssValue};`;
    }

    if (previewEl) {
      previewEl.style.background = cssValue;
    }
    if (codeBlock) {
      codeBlock.textContent = cssFull;
    }
    if (angleValue) {
      angleValue.textContent = angle + '°';
    }
  }

  // ── Control event listeners ──
  if (gradType) gradType.addEventListener('change', generateGradient);
  if (gradAngle) gradAngle.addEventListener('input', generateGradient);
  if (gradColor1) gradColor1.addEventListener('input', generateGradient);
  if (gradColor2) gradColor2.addEventListener('input', generateGradient);

  // ── Copy CSS code ──
  const copyBtn = document.getElementById('copyGradient');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = codeBlock ? codeBlock.textContent : '';
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(() => {
          Utils.showToast('Gradient CSS copied!', 'success');
        });
      }
    });
  }

  // ── Copy just the gradient value ──
  const copyValueBtn = document.getElementById('copyGradientValue');
  if (copyValueBtn) {
    copyValueBtn.addEventListener('click', () => {
      const type = gradType ? gradType.value : 'linear';
      const angle = gradAngle ? gradAngle.value : 135;
      const color1 = gradColor1 ? gradColor1.value : '#667eea';
      const color2 = gradColor2 ? gradColor2.value : '#764ba2';
      let val = '';
      if (type === 'linear') val = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
      else if (type === 'radial') val = `radial-gradient(circle, ${color1}, ${color2})`;
      else val = `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(val).then(() => {
          Utils.showToast('Gradient value copied!', 'success');
        });
      }
    });
  }

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (gradType) gradType.value = 'linear';
      if (gradAngle) gradAngle.value = 135;
      if (gradColor1) gradColor1.value = '#667eea';
      if (gradColor2) gradColor2.value = '#764ba2';
      generateGradient();
      Utils.showToast('Gradient reset to default', 'info');
    });
  }

  // ── Initialize ──
  generateGradient();
});
