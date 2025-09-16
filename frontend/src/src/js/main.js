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
    if (document.body.classList.contains('no-transition')) {
      // Skip all page-transition effects on pages that opt-out
      return;
    }
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
     DECORATIVE BACKGROUND BOOT
     (noise overlay, background squares, orbs)
     =========================== */
  (() => {
    // --- z-index plan: noise 0, gradient (your CSS) can be 0–1, squares 1, orbs 2, UI/modal 1000+
    const STYLE_ID = 'bg-decor-keyframes';
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style');
      s.id = STYLE_ID;
      s.textContent = `
        .background-squares{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .background-square{position:absolute;border:1px solid rgba(197,168,128,.08);background:rgba(197,168,128,.03);opacity:.3;will-change:transform,opacity;animation:floatSquare var(--dur,30s) ease-in-out infinite;animation-delay:var(--delay,0s);transform:translateZ(0)}
        @keyframes floatSquare{
          0%,100%{transform:translate(var(--tx0,0),var(--ty0,0)) rotate(var(--r0,0))}
          25%{transform:translate(var(--tx25,20px),var(--ty25,10px)) rotate(var(--r25,90deg))}
          50%{transform:translate(var(--tx50,10px),var(--ty50,20px)) rotate(var(--r50,180deg))}
          75%{transform:translate(var(--tx75,16px),var(--ty75,6px)) rotate(var(--r75,270deg))}
        }
        .orbs-bg{position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden}
        .orbs-bg .orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%, rgba(197,168,128,.35), rgba(197,168,128,0) 60%);filter:blur(8px);opacity:.35;will-change:transform,opacity;animation:orbFloat var(--dur,28s) ease-in-out infinite;animation-delay:var(--delay,0s)}
        @keyframes orbFloat{
          0%,100%{transform:translate(var(--x,0), var(--y,0))}
          50%{transform:translate(calc(var(--x) + var(--dx,0px)), calc(var(--y) + var(--dy,0px)))}
        }
        @media (prefers-reduced-motion: reduce){
          .background-square, .orbs-bg .orb { animation:none !important }
        }
      `;
      document.head.appendChild(s);
    }
  
    // NOISE overlay (canvas) — create if missing
    if (!document.getElementById('noise-overlay-canvas')) {
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      const tileSize = Math.round(128 * dpr);
      const tile = document.createElement('canvas');
      tile.width = tileSize; tile.height = tileSize;
      const tctx = tile.getContext('2d');
      const tid = tctx.createImageData(tileSize, tileSize);
      for (let i = 0; i < tid.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        tid.data[i] = v; tid.data[i+1] = v; tid.data[i+2] = v; tid.data[i+3] = 14;
      }
      tctx.putImageData(tid, 0, 0);
  
      const canvas = document.createElement('canvas');
      canvas.id = 'noise-overlay-canvas';
      Object.assign(canvas.style, { position:'fixed', inset:'0', width:'100%', height:'100%', pointerEvents:'none', zIndex:'0' });
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
  
      function drawNoise(){
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        const pattern = ctx.createPattern(tile, 'repeat');
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.scale(dpr,dpr);
        ctx.fillStyle = pattern;
        ctx.fillRect(0,0,w,h);
      }
      let to; window.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(drawNoise, 120); });
      drawNoise();
    }
  
    // BACKGROUND SQUARES — create if missing
    if (!document.querySelector('.background-squares')) {
      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const count = prefersReduced ? 0 : (innerWidth <= 480 ? 6 : innerWidth <= 768 ? 9 : 15);
      const cont = document.createElement('div'); cont.className = 'background-squares';
      const frag = document.createDocumentFragment();
      for (let i=0;i<count;i++){
        const el = document.createElement('div'); el.className='background-square';
        const size = 20 + Math.random()*60;
        const x = Math.random()*innerWidth, y = Math.random()*innerHeight;
        const moveX = (Math.random()-0.5) * 100, moveY = (Math.random()-0.5) * 100;
        const dur = 20 + Math.random()*20, delay = Math.random()*10;
        const r0 = Math.random()*360, r25=Math.random()*360, r50=Math.random()*360, r75=Math.random()*360;
        el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${size}px`; el.style.height = `${size}px`;
        el.style.setProperty('--dur', `${dur}s`); el.style.setProperty('--delay', `${delay}s`);
        el.style.setProperty('--tx0', `0px`); el.style.setProperty('--ty0', `0px`);
        el.style.setProperty('--tx25', `${moveX}px`); el.style.setProperty('--ty25', `${moveY*.5}px`);
        el.style.setProperty('--tx50', `${moveX*.5}px`); el.style.setProperty('--ty50', `${moveY}px`);
        el.style.setProperty('--tx75', `${moveX*.8}px`); el.style.setProperty('--ty75', `${moveY*.3}px`);
        el.style.setProperty('--r0', `${r0}deg`); el.style.setProperty('--r25', `${r25}deg`);
        el.style.setProperty('--r50', `${r50}deg`); el.style.setProperty('--r75', `${r75}deg`);
        frag.appendChild(el);
      }
      cont.appendChild(frag);
      document.body.appendChild(cont);
      // light reposition on resize
      let to; addEventListener('resize', () => {
        clearTimeout(to); to = setTimeout(() => {
          cont.querySelectorAll('.background-square').forEach(sq => {
            sq.style.left = `${Math.random()*innerWidth}px`;
            sq.style.top  = `${Math.random()*innerHeight}px`;
          });
        }, 120);
      });
    }
  
    // ORBS — create container + orbs if missing
    if (!document.querySelector('.orbs-bg')) {
      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const count = prefersReduced ? 0 : (innerWidth < 480 ? 6 : innerWidth < 1024 ? 10 : 14);
      const host = document.createElement('div'); host.className = 'orbs-bg';
      const frag = document.createDocumentFragment();
      for (let i=0;i<count;i++){
        const o = document.createElement('div'); o.className='orb';
        const size = 10 + Math.random()*20;
        const x = Math.random()*innerWidth, y=Math.random()*innerHeight;
        const dx = (Math.random()-0.5)*120, dy=(Math.random()-0.5)*120;
        const dur = 24 + Math.random()*18, delay = Math.random()*10;
        o.style.width = `${size}px`; o.style.height = `${size}px`;
        o.style.setProperty('--x', `${x}px`); o.style.setProperty('--y', `${y}px`);
        o.style.setProperty('--dx', `${dx}px`); o.style.setProperty('--dy', `${dy}px`);
        o.style.setProperty('--dur', `${dur}s`); o.style.setProperty('--delay', `${delay}s`);
        frag.appendChild(o);
      }
      host.appendChild(frag);
      document.body.appendChild(host);
      // respawn on resize
      let to; addEventListener('resize', () => {
        clearTimeout(to); to = setTimeout(() => {
          host.innerHTML = ''; // remove and rebuild
          const f = document.createDocumentFragment();
          const c = (innerWidth < 480 ? 6 : innerWidth < 1024 ? 10 : 14);
          for (let i=0;i<c;i++){
            const o = document.createElement('div'); o.className='orb';
            const size = 10 + Math.random()*20;
            const x = Math.random()*innerWidth, y=Math.random()*innerHeight;
            const dx = (Math.random()-0.5)*120, dy=(Math.random()-0.5)*120;
            const dur = 24 + Math.random()*18, delay = Math.random()*10;
            o.style.width = `${size}px`; o.style.height = `${size}px`;
            o.style.setProperty('--x', `${x}px`); o.style.setProperty('--y', `${y}px`);
            o.style.setProperty('--dx', `${dx}px`); o.style.setProperty('--dy', `${dy}px`);
            o.style.setProperty('--dur', `${dur}s`); o.style.setProperty('--delay', `${delay}s`);
            f.appendChild(o);
          }
          host.appendChild(f);
        }, 120);
      });
    }
  })();
/* =========================== 
   MODAL -> DIRECT TO PAYPAL VIEW 
   =========================== */
(() => {
  const modal = document.getElementById('detail-modal');
  const btnOpen = document.getElementById('detail-btn');
  const btnClose = document.getElementById('close-modal');
  const btnBack = document.getElementById('back-to-info');
  const btnDone = document.getElementById('close-success');

  const VIEWS = ['product-info-view','payment-view','success-view'];
  const showView = (id) => {
    VIEWS.forEach(v => document.getElementById(v)?.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');
  };

  // Prevent vertical letter stacking inside modal
  const styleFix = document.createElement('style');
  styleFix.textContent = `
    #detail-modal, #detail-modal * {
      writing-mode: horizontal-tb !important;
      text-orientation: mixed !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere;
    }
    .paypal-button-container { 
      min-height: 60px; 
      display:flex; 
      align-items:center; 
      justify-content:center; 
    }
  `;
  document.head.appendChild(styleFix);

  // Render hosted button IF container is empty and SDK is ready (safe fallback)
  let triedRender = false;
  function ensurePayPalButton() {
    const sel = '#paypal-container-R3VQPLVDZPUKC';
    const el = document.querySelector(sel);
    if (!el) return;
    if (el.childElementCount > 0) return; // already rendered by inline script
    if (!triedRender && window.paypal?.HostedButtons) {
      triedRender = true;
      try {
        window.paypal.HostedButtons({ hostedButtonId: 'R3VQPLVDZPUKC' }).render(sel);
      } catch (e) {
        console.warn('HostedButtons fallback failed:', e);
      }
    }
  }

  function openModalToPayment() {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    showView('payment-view');
    ensurePayPalButton();
    setTimeout(ensurePayPalButton, 400);
  }

  // Intercept CTA click in capture phase to bypass the “method selection” page
  btnOpen?.addEventListener('click', (e) => {
    // If the modal doesn't exist on this page, allow normal navigation
    if (!modal) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    openModalToPayment();
  }, true);

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal?.classList.add('hidden');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    }
  });

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
