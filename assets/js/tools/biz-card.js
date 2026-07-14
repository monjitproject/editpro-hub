/**
 * Business Card Maker — Create 3.5x2 inch business card at 300 DPI
 * Controls: text#cardName, text#cardTitle, text#cardEmail, color#cardColor (#4f46e5)
 * Draws name, title, email with accent color. Download as PNG.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('tool-workspace');
  const zone = document.getElementById('upload-zone');

  const cardName = document.getElementById('cardName');
  const cardTitle = document.getElementById('cardTitle');
  const cardEmail = document.getElementById('cardEmail');
  const cardColor = document.getElementById('cardColor');

  /* Show workspace immediately (no image upload needed) */
  if (zone) zone.style.display = 'none';
  if (workspace) workspace.classList.add('active');

  /* ── Card dimensions: 3.5 x 2 inches at 300 DPI ── */
  const DPI = 300;
  const CARD_W = 3.5 * DPI; /* 1050 px */
  const CARD_H = 2 * DPI;   /* 600 px */

  canvas.width = CARD_W;
  canvas.height = CARD_H;

  function renderCard() {
    const name = cardName ? cardName.value.trim() : '';
    const title = cardTitle ? cardTitle.value.trim() : '';
    const email = cardEmail ? cardEmail.value.trim() : '';
    const color = cardColor ? cardColor.value : '#4f46e5';
    const rgb = Utils.hexToRgb(color);

    /* White background */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    /* Accent bar on left */
    const barWidth = 40;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, barWidth, CARD_H);

    /* Subtle top accent line */
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`;
    ctx.fillRect(barWidth, 0, CARD_W - barWidth, 6);

    /* Card content area */
    const contentLeft = barWidth + 60;
    const contentTop = CARD_H * 0.25;

    /* Name */
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 56px Arial, Helvetica, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(name || 'Your Name', contentLeft, contentTop);

    /* Title */
    ctx.fillStyle = color;
    ctx.font = '28px Arial, Helvetica, sans-serif';
    const nameMetrics = ctx.measureText(name || 'Your Name');
    ctx.fillText(title || 'Job Title', contentLeft, contentTop + nameMetrics.fontBoundingBoxAscent + 20);

    /* Email */
    ctx.fillStyle = '#666666';
    ctx.font = '22px Arial, Helvetica, sans-serif';
    const titleText = title || 'Job Title';
    const titleMetrics = ctx.measureText(titleText);
    ctx.fillText(email || 'email@example.com', contentLeft, contentTop + nameMetrics.fontBoundingBoxAscent + 20 + titleMetrics.fontBoundingBoxAscent + 16);

    /* Bottom decorative line */
    ctx.fillStyle = color;
    ctx.fillRect(barWidth, CARD_H - 20, CARD_W - barWidth - 40, 3);

    /* Small accent dot */
    ctx.beginPath();
    ctx.arc(CARD_W - 60, CARD_H - 30, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  renderCard();

  /* ── Live update ── */
  [cardName, cardTitle, cardEmail, cardColor].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        clearTimeout(window._cardTimer);
        window._cardTimer = setTimeout(renderCard, 150);
      });
      el.addEventListener('change', renderCard);
    }
  });

  /* ── Download ── */
  document.getElementById('download-btn')?.addEventListener('click', () => {
    Utils.downloadCanvas(canvas, 'business-card', 'png');
  });

  /* ── Reset ── */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (cardName) cardName.value = '';
    if (cardTitle) cardTitle.value = '';
    if (cardEmail) cardEmail.value = '';
    if (cardColor) cardColor.value = '#4f46e5';
    renderCard();
  });
});
