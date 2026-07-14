/**
 * Contrast Checker Tool
 * Calculate WCAG contrast ratio between foreground and background colors.
 * Controls:
 *   color#fgColor      (default: #000000)
 *   color#bgColorCheck (default: #ffffff)
 * Shows AA/AAA compliance for normal and large text with pass/fail indicators.
 */
document.addEventListener('DOMContentLoaded', () => {
  const fgColor = document.getElementById('fgColor');
  const bgColor = document.getElementById('bgColorCheck');
  const ratioDisplay = document.getElementById('contrastRatio');
  const fgPreview = document.getElementById('fgPreview');
  const bgPreview = document.getElementById('bgPreview');
  const aaNormal = document.getElementById('aaNormal');
  const aaLarge = document.getElementById('aaLarge');
  const aaaNormal = document.getElementById('aaaNormal');
  const aaaLarge = document.getElementById('aaaLarge');
  const sampleText = document.getElementById('sampleText');

  // ── WCAG contrast ratio calculation ──
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function getContrastRatio(rgb1, rgb2) {
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function updateContrast() {
    if (!fgColor || !bgColor) return;

    const fg = Utils.hexToRgb(fgColor.value);
    const bg = Utils.hexToRgb(bgColor.value);
    const ratio = getContrastRatio(fg, bg);
    const ratioRounded = Math.round(ratio * 100) / 100;

    // Update ratio display
    if (ratioDisplay) {
      ratioDisplay.textContent = `${ratioRounded}:1`;
    }

    // Update previews
    if (fgPreview) fgPreview.style.backgroundColor = fgColor.value;
    if (bgPreview) bgPreview.style.backgroundColor = bgColor.value;

    // Sample text preview
    if (sampleText) {
      sampleText.style.color = fgColor.value;
      sampleText.style.backgroundColor = bgColor.value;
    }

    // WCAG thresholds
    // AA Normal text: >= 4.5
    // AA Large text: >= 3.0
    // AAA Normal text: >= 7.0
    // AAA Large text: >= 4.5
    setCompliance(aaNormal, ratio >= 4.5);
    setCompliance(aaLarge, ratio >= 3.0);
    setCompliance(aaaNormal, ratio >= 7.0);
    setCompliance(aaaLarge, ratio >= 4.5);
  }

  function setCompliance(element, passes) {
    if (!element) return;
    element.textContent = passes ? 'PASS' : 'FAIL';
    element.className = 'compliance-badge ' + (passes ? 'pass' : 'fail');
  }

  // ── Swap colors ──
  const swapBtn = document.getElementById('swapColors');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = fgColor.value;
      fgColor.value = bgColor.value;
      bgColor.value = temp;
      updateContrast();
    });
  }

  // ── Control event listeners ──
  if (fgColor) fgColor.addEventListener('input', updateContrast);
  if (bgColor) bgColor.addEventListener('input', updateContrast);

  // ── Reset handler ──
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (fgColor) fgColor.value = '#000000';
      if (bgColor) bgColor.value = '#ffffff';
      updateContrast();
      Utils.showToast('Contrast checker reset to default', 'info');
    });
  }

  // ── Initialize ──
  updateContrast();
});
