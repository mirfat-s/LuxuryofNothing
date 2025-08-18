/* ===========================
   NAV ACTIVE HIGHLIGHT
   =========================== */
   (() => {
    const links = document.querySelectorAll('.nav-link');
    const file = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => a.getAttribute('href') === file
      ? a.classList.add('active')
      : a.classList.remove('active'));
  })();
  
  /* ===========================
     HERO TITLE PARALLAX (if present)
     =========================== */
  (() => {
    const titleLines = document.querySelectorAll('.title-line');
    const heroTitle  = document.querySelector('.hero-title');
    if (!heroTitle || titleLines.length === 0) return;
  
    let w = innerWidth, h = innerHeight;
    addEventListener('resize', () => { w = innerWidth; h = innerHeight; });
  
    addEventListener('mousemove', (e) => {
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
  
      titleLines.forEach((line, i) => {
        const k = (i + 1) * 0.5;
        line.style.setProperty('--mouse-x', `${nx * 15 * k}px`);
        line.style.setProperty('--mouse-y', `${ny * 10 * k}px`);
        line.style.setProperty('--rotate-x', `${ny * 5 * k}deg`);
        line.style.setProperty('--rotate-y', `${nx * 5 * k}deg`);
        line.classList.remove('parallax-1', 'parallax-2', 'parallax-3');
        line.classList.add(`parallax-${i + 1}`);
      });
    });
  
    addEventListener('mouseleave', () => {
      titleLines.forEach((line) => {
        line.style.setProperty('--mouse-x', '0px');
        line.style.setProperty('--mouse-y', '0px');
        line.style.setProperty('--rotate-x', '0deg');
        line.style.setProperty('--rotate-y', '0deg');
        line.classList.remove('parallax-1', 'parallax-2', 'parallax-3');
      });
    });
  })();
  
  /* ===========================
     PAGE TRANSITIONS
     =========================== */
  function addPageTransition() {
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }
  
  function handlePageLinkTransition(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    e.preventDefault();
    const overlay = addPageTransition();
    overlay.classList.add('active');
    setTimeout(() => (window.location.href = href), 400);
  }
  
  window.addEventListener('pageshow', (evt) => {
    if (!evt.persisted) return;
    document.querySelector('.page-transition-overlay')?.classList.remove('active');
    document.body.classList.remove('page-transitioning');
    const main = document.querySelector('.main-content') || document.body;
    main.style.opacity = '1';
    main.style.visibility = 'visible';
    document.querySelectorAll('.animated-fade-in').forEach(el => {
      el.style.visibility = 'visible';
      el.classList.add('fade-in-triggered');
    });
  });
  
  window.addEventListener('DOMContentLoaded', () => {
    // Only anchors — your CTA is a button and is handled below
    document.querySelectorAll('a.nav-link, a.cta-primary').forEach(a => {
      a.addEventListener('click', handlePageLinkTransition);
    });
  
    const main = document.querySelector('.main-content') || document.body;
    document.body.classList.add('page-transitioning');
    main.classList.add('page-enter');
    setTimeout(() => {
      main.classList.add('page-enter-active');
      setTimeout(() => document.body.classList.remove('page-transitioning'), 700);
    }, 30);
  
    document.querySelectorAll('.animated-fade-in').forEach(el => {
      el.style.visibility = 'visible';
      el.classList.add('fade-in-triggered');
    });
  
    setTimeout(() => {
      document.body.style.opacity = '1';
      document.body.style.visibility = 'visible';
      const m = document.querySelector('.main-content') || document.body;
      m.style.opacity = '1';
      m.style.visibility = 'visible';
    }, 100);
  });
  
  /* ===========================
     MODAL -> DIRECT TO PAYPAL VIEW
     (does NOT modify your HTML; safely overrides the other handler)
     =========================== */
  (() => {
    const modal   = document.getElementById('detail-modal');
    const btnOpen = document.getElementById('detail-btn');
    const btnClose = document.getElementById('close-modal');
    const btnBack  = document.getElementById('back-to-info');
    const btnDone  = document.getElementById('close-success');
  
    const VIEWS = ['product-info-view','payment-view','success-view'];
    const showView = (id) => {
      VIEWS.forEach(v => document.getElementById(v)?.classList.add('hidden'));
      document.getElementById(id)?.classList.remove('hidden');
    };
  
    // Defensive CSS fix: prevent vertical stacked letters in payment view
    const styleFix = document.createElement('style');
    styleFix.textContent = `
      #payment-view, #payment-view * {
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        white-space: normal !important;
        word-break: normal !important;
        overflow-wrap: anywhere;
      }
      .paypal-button-container {
        min-height: 60px; display:flex; align-items:center; justify-content:center;
      }
    `;
    document.head.appendChild(styleFix);
  
    // Try to render hosted button ONLY if container is empty and SDK is ready
    let triedRender = false;
    function ensurePayPalButton() {
      const sel = '#paypal-container-R3VQPLVDZPUKC';
      const el = document.querySelector(sel);
      if (!el) return;
      if (el.childElementCount > 0) return;            // already rendered by your inline script
      if (!triedRender && window.paypal?.HostedButtons) {
        triedRender = true;
        try { window.paypal.HostedButtons({ hostedButtonId: 'R3VQPLVDZPUKC' }).render(sel); }
        catch (e) { console.warn('HostedButtons fallback failed:', e); }
      }
    }
  
    function openModalToPayment() {
      if (!modal) return;
      modal.classList.remove('hidden');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      showView('payment-view');
  
      // Render if needed (in case inline render hasn't run yet)
      ensurePayPalButton();
      setTimeout(ensurePayPalButton, 400);
    }
  
    // Intercept the CTA click in CAPTURE phase so the inline listener won't run
    // This is the key to skipping the “Choose Payment Method” step without editing HTML.
    btnOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      openModalToPayment();
    }, true); // <-- capture phase
  
    btnClose?.addEventListener('click', () => {
      modal?.classList.add('hidden');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    });
  
    btnBack?.addEventListener('click', () => showView('product-info-view'));
  
    btnDone?.addEventListener('click', () => {
      modal?.classList.add('hidden');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    });
  
    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal?.classList.add('hidden');
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
      }
    });
  
    // Optional: support clicking the top-right “X” hit area (pseudo-element)
    document.querySelector('.modal-content')?.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x > rect.width - 36 && y < 36) {
        modal?.classList.add('hidden');
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
      }
    });
  })();
  




