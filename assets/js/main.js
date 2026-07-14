/* ============================================
   EditPro Hub — Main JavaScript
   Navigation, Search, Theme, Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initSearch();
  initScrollAnimations();
  init3DCardTilt();
  initRippleButtons();
  initBackToTop();
  initCookieBanner();
  initMobileMenu();
  initFAQ();
  initPageLoader();
});

/* ---------- Page Loader ---------- */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 300);
    });
    // Fallback
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 300);
    }, 3000);
  }
}

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.navbar');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('mobile-nav-open');
    const isOpen = nav.classList.contains('mobile-nav-open');
    btn.textContent = isOpen ? '✕' : '☰';
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on nav link click
  nav.querySelectorAll('.navbar-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-nav-open');
      btn.textContent = '☰';
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Theme Toggle ---------- */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('editpro-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(toggle, savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeIcon(toggle, 'dark');
    }
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('editpro-theme', next);
    updateThemeIcon(toggle, next);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

/* ---------- Search ---------- */
function initSearch() {
  const input = document.querySelector('.search-bar input');
  const clearBtn = document.querySelector('.search-clear');
  if (!input) return;

  const cards = document.querySelectorAll('.tool-card[data-name]');
  const categorySections = document.querySelectorAll('.category-section');
  const noResults = document.querySelector('.no-results');

  const doSearch = Utils.debounce((query) => {
    const q = query.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach(card => {
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();
      const match = !q || name.includes(q) || desc.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // Show/hide category sections based on visible cards
    categorySections.forEach(section => {
      const visibleCards = section.querySelectorAll('.tool-card[data-name]:not([style*="display: none"])');
      section.style.display = visibleCards.length > 0 ? '' : 'none';
    });

    if (noResults) {
      noResults.classList.toggle('visible', visibleCount === 0 && q.length > 0);
    }

    if (clearBtn) {
      clearBtn.classList.toggle('visible', q.length > 0);
    }
  }, 200);

  input.addEventListener('input', (e) => doSearch(e.target.value));

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      doSearch('');
      input.focus();
    });
  }
}

/* ---------- Scroll Animations ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ---------- 3D Card Tilt Effect ---------- */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.tool-card');
  if (!cards.length) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      const inner = card.querySelector('.tool-card-inner') || card;
      inner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
    });

    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.tool-card-inner') || card;
      inner.style.transform = '';
    });
  });
}

/* ---------- Ripple Effect on Buttons ---------- */
function initRippleButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.pageYOffset > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Cookie Banner ---------- */
function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const accepted = localStorage.getItem('editpro-cookies-accepted');
  if (accepted) return;

  setTimeout(() => {
    banner.classList.add('visible');
  }, 1500);

  banner.querySelectorAll('.cookie-accept, .cookie-dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('editpro-cookies-accepted', 'true');
      banner.classList.remove('visible');
    });
  });
}

/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ---------- Tool Page Helpers ---------- */
function setupToolPage(config) {
  const {
    fileInput,
    dropZone,
    previewCanvas,
    controls,
    downloadBtn,
    resetBtn,
    accept = 'image/*',
    onLoad,
    onProcess,
    onDownload,
    onReset
  } = config;

  let originalImage = null;
  let originalFilename = 'image';

  // File handling
  const handleFile = async (file) => {
    if (!Utils.validateImageFile(file)) return;

    originalFilename = file.name;
    try {
      originalImage = await Utils.loadImage(file);
      if (onLoad) onLoad(originalImage);

      // Hide upload, show workspace
      if (dropZone) dropZone.style.display = 'none';
      const workspace = document.querySelector('.tool-workspace');
      if (workspace) workspace.classList.add('active');

      Utils.showToast('Image loaded successfully!', 'success');
    } catch (err) {
      Utils.showToast('Failed to load image: ' + err.message, 'error');
    }
  };

  // Setup drag & drop
  if (dropZone) {
    Utils.setupDragDrop(dropZone, handleFile, accept);
    dropZone.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const input = dropZone.querySelector('input[type="file"]');
        if (input) input.click();
      }
    });

    const fileInputEl = dropZone.querySelector('input[type="file"]');
    if (fileInputEl) {
      fileInputEl.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFile(e.target.files[0]);
        }
      });
    }
  }

  // Download
  if (downloadBtn && onDownload) {
    downloadBtn.addEventListener('click', onDownload);
  }

  // Reset
  if (resetBtn && onReset) {
    resetBtn.addEventListener('click', () => {
      onReset();
      if (dropZone) dropZone.style.display = '';
      const workspace = document.querySelector('.tool-workspace');
      if (workspace) workspace.classList.remove('active');
      originalImage = null;
    });
  }

  return {
    getOriginalImage: () => originalImage,
    getOriginalFilename: () => originalFilename,
    handleFile
  };
}

/* ---------- Slider Value Display ---------- */
function setupSliderValue(slider, display) {
  if (!slider || !display) return;
  const update = () => { display.textContent = slider.value; };
  slider.addEventListener('input', update);
  update();
}

/* ---------- Canvas Paste Support ---------- */
function initCanvasPaste(callback) {
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) callback(file);
        break;
      }
    }
  });
}
