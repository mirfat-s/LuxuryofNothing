/* ============================================================
   LUXURY OF NOTHING — interaction orchestration
   GSAP + ScrollTrigger (vendored, CSP-safe) + Lenis smooth scroll
   Every effect degrades: reduced-motion → instant/cross-fade,
   touch → tap/scroll equivalents.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  if (REDUCED || !hasGSAP) document.documentElement.classList.add('no-motion');
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var lenis = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initSmoothScroll();
    initCursor();
    initNav();
    initProgressBar();
    initSplitText();
    initFades();
    initParallax();
    initHeroDepth();
    initPreloaderAndHero();
    initMagnetic();
    initTilt();
    initVitrine();
    initCounters();
    initCertificate();
    initCart();
    initFieldLabels();
    initRegistry();
    initVerifier();
    initCheckout();
    initVeil();
    initAnchors();
  }

  /* ----------------------------------------------------------
     Smooth scroll (Lenis) — skipped for reduced motion
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    if (REDUCED || !hasGSAP || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ----------------------------------------------------------
     Custom cursor — dot leads, ring lags (lerp), morphs on hover
     ---------------------------------------------------------- */
  function initCursor() {
    if (TOUCH || REDUCED || !hasGSAP) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    var label = ring.querySelector('.cursor-label');
    document.body.classList.add('has-cursor');

    var mx = innerWidth / 2, my = innerHeight / 2;
    var rx = mx, ry = my;
    var visible = false;

    var setDotX = gsap.quickSetter(dot, 'x', 'px');
    var setDotY = gsap.quickSetter(dot, 'y', 'px');
    var setRingX = gsap.quickSetter(ring, 'x', 'px');
    var setRingY = gsap.quickSetter(ring, 'y', 'px');

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx; ry = my;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    });

    gsap.ticker.add(function () {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      setDotX(mx); setDotY(my);
      setRingX(rx); setRingY(ry);
    });

    // Hover morphs — event delegation so dynamic nodes (cart items) work
    var HOVERABLE = 'a, button, [data-cursor], input, label';
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(HOVERABLE);
      if (!t) return;
      var text = t.getAttribute('data-cursor') ||
        (t.closest('[data-cursor]') && t.closest('[data-cursor]').getAttribute('data-cursor'));
      if (text) {
        label.textContent = text;
        ring.classList.add('is-label');
        dot.classList.add('is-hidden');
      } else {
        ring.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest(HOVERABLE);
      if (!t) return;
      ring.classList.remove('is-label', 'is-hover');
      dot.classList.remove('is-hidden');
    });
    // Precise beam over long-form text
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('p, .lede, .prose')) ring.classList.add('is-text');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('p, .lede, .prose')) ring.classList.remove('is-text');
    });
    window.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
  }

  /* ----------------------------------------------------------
     Nav — glass after scroll, hides scrolling down
     ---------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var lastY = 0;
    function onScroll(y) {
      nav.classList.toggle('is-solid', y > 30);
      if (y > lastY + 6 && y > 180 && !document.body.classList.contains('drawer-open')) {
        nav.classList.add('is-hidden');
      } else if (y < lastY - 4 || y <= 180) {
        nav.classList.remove('is-hidden');
      }
      lastY = y;
    }
    if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
    else window.addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
  }

  /* ----------------------------------------------------------
     Scroll progress hairline
     ---------------------------------------------------------- */
  function initProgressBar() {
    var bar = document.querySelector('.scroll-progress .bar');
    if (!bar) return;
    function update() {
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? (window.scrollY || 0) / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    if (lenis) lenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Split text — word-mask reveals on scroll
     ---------------------------------------------------------- */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    el.classList.add('split-mask');
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).forEach(function (w) {
          if (!w) return;
          el.appendChild(makeWord(w));
          el.appendChild(document.createTextNode(' '));
        });
      } else if (node.nodeType === 1) {
        // keep inline elements (em) whole, mask them as one unit
        var wrap = document.createElement('span');
        wrap.className = 'word';
        var inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.appendChild(node);
        wrap.appendChild(inner);
        el.appendChild(wrap);
        el.appendChild(document.createTextNode(' '));
      }
    });
    function makeWord(w) {
      var wrap = document.createElement('span');
      wrap.className = 'word';
      var inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = w;
      wrap.appendChild(inner);
      return wrap;
    }
    return el.querySelectorAll('.word-inner');
  }

  function initSplitText() {
    var targets = document.querySelectorAll('[data-split]');
    targets.forEach(function (el) {
      var inners = splitWords(el);
      if (REDUCED || !hasGSAP) return;
      gsap.to(inners, {
        y: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });
  }

  /* ----------------------------------------------------------
     Fade-rise reveals ([data-fade], groups stagger children)
     ---------------------------------------------------------- */
  function initFades() {
    if (REDUCED || !hasGSAP) return;
    document.querySelectorAll('[data-fade-group]').forEach(function (group) {
      var items = group.querySelectorAll('[data-fade]');
      gsap.to(items, {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true }
      });
    });
    document.querySelectorAll('[data-fade]').forEach(function (el) {
      if (el.closest('[data-fade-group]') || el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
        delay: parseFloat(el.getAttribute('data-delay') || 0),
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }

  /* ----------------------------------------------------------
     Parallax layers ([data-parallax="0.4"] moves at 0.4x)
     ---------------------------------------------------------- */
  function initParallax() {
    if (REDUCED || !hasGSAP) return;
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
      var dist = (1 - speed) * 240;
      gsap.fromTo(el, { y: dist }, {
        y: -dist,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Hero depth planes — scroll drift + pointer drift (diorama)
     ---------------------------------------------------------- */
  function initHeroDepth() {
    if (REDUCED || !hasGSAP) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var planes = hero.querySelectorAll('.hero-plane');
    planes.forEach(function (p) {
      var depth = parseFloat(p.getAttribute('data-depth') || 0.2);
      gsap.to(p, {
        yPercent: depth * 120,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    if (!TOUCH) {
      var setters = Array.prototype.map.call(planes, function (p) {
        return {
          x: gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3.out' }),
          d: parseFloat(p.getAttribute('data-depth') || 0.2)
        };
      });
      hero.addEventListener('mousemove', function (e) {
        var nx = (e.clientX / innerWidth) * 2 - 1;
        var ny = (e.clientY / innerHeight) * 2 - 1;
        setters.forEach(function (s) { s.x(nx * 40 * s.d); s.y(ny * 26 * s.d); });
      }, { passive: true });
    }
    // Hero content recedes slightly as you leave — depth on exit
    gsap.to('.hero-content', {
      yPercent: -14, opacity: 0.25, scale: 0.97,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ----------------------------------------------------------
     Preloader — a beat of nothing, the name assembles, wipe up
     ---------------------------------------------------------- */
  function initPreloaderAndHero() {
    var pre = document.querySelector('.preloader');
    var heroLines = document.querySelectorAll('.hero-title .h-line > span');
    var heroBits = document.querySelectorAll('.hero .hero-stagger');

    if (REDUCED || !hasGSAP) {
      if (pre) pre.remove();
      return; // CSS no-motion rules leave everything visible
    }

    var revisit = false;
    try { revisit = sessionStorage.getItem('lon-seen') === '1'; sessionStorage.setItem('lon-seen', '1'); } catch (e) {}

    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (pre) {
      var word = pre.querySelector('.preloader-word');
      var chars = [];
      if (word) {
        var txt = word.textContent;
        word.textContent = '';
        txt.split('').forEach(function (c) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          word.appendChild(s);
        });
        chars = word.querySelectorAll('.ch');
      }
      var line = pre.querySelector('.preloader-line');
      var hint = pre.querySelector('.preloader-hint');

      if (revisit) {
        intro.to(pre, { opacity: 0, duration: 0.45, ease: 'power2.inOut', onComplete: function () { pre.remove(); } });
      } else {
        // 1 — hold on pure negative space
        intro.set(word, { letterSpacing: '0.6em' })
          .to({}, { duration: 0.9 })
          // 2 — the name appears, tracking collapses inward
          .to(chars, { opacity: 1, y: 0, duration: 0.9, stagger: 0.028, ease: 'power2.out' })
          .to(word, { letterSpacing: '0.06em', duration: 1.4, ease: 'power3.inOut' }, '<0.1')
          .to(line, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '<0.35')
          .to(hint, { opacity: 1, duration: 0.5 }, '<0.2')
          .to({}, { duration: 0.35 })
          // 3 — the veil lifts: clip-path wipe, not a fade
          .to(pre, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1.05,
            ease: 'power4.inOut',
            onComplete: function () { pre.remove(); }
          })
          .to([word, line, hint], { yPercent: -160, opacity: 0, duration: 0.9, ease: 'power4.inOut' }, '<');
      }
    }

    // 4 — hero staggers in behind the lifting veil
    if (heroLines.length) {
      intro.to(heroLines, {
        y: 0, duration: 1.25, ease: 'power4.out', stagger: 0.11
      }, pre && !revisit ? '-=0.55' : '+=0.05');
    }
    if (heroBits.length) {
      intro.to(heroBits, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1
      }, '-=0.85');
    }
  }

  /* ----------------------------------------------------------
     Magnetic buttons — pull toward cursor, spring back
     ---------------------------------------------------------- */
  function initMagnetic() {
    if (TOUCH || REDUCED || !hasGSAP) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.35;
      var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var cap = 26;
        xTo(Math.max(-cap, Math.min(cap, dx * strength)));
        yTo(Math.max(-cap, Math.min(cap, dy * strength)));
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      });
    });
  }

  /* ----------------------------------------------------------
     3D tilt cards — subtle, max ~7deg
     ---------------------------------------------------------- */
  function initTilt() {
    if (TOUCH || REDUCED || !hasGSAP) return;
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      gsap.set(el, { transformPerspective: 900 });
      var rxTo = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power2.out' });
      var ryTo = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power2.out' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        rxTo(-ny * max);
        ryTo(nx * max);
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ----------------------------------------------------------
     The vitrine — genuinely 3D, auto-rotating, drag to inspect
     ---------------------------------------------------------- */
  function initVitrine() {
    var stage = document.querySelector('.stage');
    var scene = document.querySelector('.scene');
    if (!stage || !scene) return;

    var ry = -18, rx = -8;
    var vel = 0;
    var auto = !REDUCED;
    var dragging = false;
    var lastX = 0, lastY = 0;
    var lastT = 0;

    function render() {
      scene.style.setProperty('--ry', ry.toFixed(2));
      scene.style.setProperty('--rx', rx.toFixed(2));
    }
    render();
    if (REDUCED) return;

    function tick() {
      if (!onScreen && !dragging) { running = false; return; }
      if (!dragging) {
        if (Math.abs(vel) > 0.02) {
          ry += vel;
          vel *= 0.94; // inertia decay after release
        } else if (auto) {
          ry += 0.1; // slow museum turntable
        }
        // ease pitch back to resting angle
        rx += (-8 - rx) * 0.06;
        render();
      }
      requestAnimationFrame(tick);
    }

    // Only animate while on screen — frame budget
    var running = false;
    var onScreen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        onScreen = en.isIntersecting;
        if (onScreen && !running) { running = true; requestAnimationFrame(tick); }
      });
    }, { threshold: 0.05 });
    io.observe(stage);

    function down(x, y) { dragging = true; vel = 0; lastX = x; lastY = y; lastT = performance.now(); stage.classList.add('is-dragging'); }
    function move(x, y) {
      if (!dragging) return;
      var now = performance.now();
      var dx = x - lastX, dy = y - lastY;
      ry += dx * 0.45;
      rx = Math.max(-32, Math.min(10, rx - dy * 0.2));
      vel = (dx * 0.45) / Math.max(1, (now - lastT)) * 16;
      lastX = x; lastY = y; lastT = now;
      render();
    }
    function up() { dragging = false; stage.classList.remove('is-dragging'); }

    stage.addEventListener('mousedown', function (e) { e.preventDefault(); down(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', function (e) { down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    stage.addEventListener('touchmove', function (e) { move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    stage.addEventListener('touchend', up);
  }

  /* ----------------------------------------------------------
     Counters — luxury inversion: numbers collapse to zero
     ---------------------------------------------------------- */
  function initCounters() {
    document.querySelectorAll('[data-count-from]').forEach(function (el) {
      var from = parseFloat(el.getAttribute('data-count-from'));
      var to = parseFloat(el.getAttribute('data-count-to') || 0);
      if (REDUCED || !hasGSAP) { el.textContent = String(to); return; }
      var obj = { v: from };
      el.textContent = String(Math.round(from));
      gsap.to(obj, {
        v: to,
        duration: 2.2,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () { el.textContent = String(Math.round(obj.v)); }
      });
    });
  }

  /* ----------------------------------------------------------
     Certificate — pinned, engraved by scroll (scrubbed)
     ---------------------------------------------------------- */
  function initCertificate() {
    var section = document.querySelector('.certificate-section');
    var svg = document.querySelector('.cert-svg');
    if (!section || !svg) return;
    if (REDUCED || !hasGSAP) return; // CSS no-motion shows it complete

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=220%',
        pin: '.certificate-sticky',
        scrub: 0.6,
        anticipatePin: 1
      }
    });

    tl.fromTo('.cert-frame', { scale: 0.92, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.18 })
      .to(svg.querySelector('.d-outer'), { strokeDashoffset: 0, duration: 0.3 }, 0.02)
      .to(svg.querySelector('.d-inner'), { strokeDashoffset: 0, duration: 0.28 }, 0.1)
      .to(svg.querySelectorAll('.a-head'), { opacity: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.26)
      .to(svg.querySelector('.d-rule'), { strokeDashoffset: 0, duration: 0.1 }, 0.4)
      .to(svg.querySelectorAll('.a-body'), { opacity: 1, y: 0, duration: 0.12, stagger: 0.05 }, 0.46)
      .fromTo(svg.querySelector('.g-seal'),
        { opacity: 0, scale: 0.4, rotation: -50, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.16, ease: 'back.out(2)' }, 0.62)
      .to(svg.querySelector('.d-sig'), { strokeDashoffset: 0, duration: 0.14 }, 0.72)
      .to(svg.querySelectorAll('.a-foot'), { opacity: 1, y: 0, duration: 0.1, stagger: 0.04 }, 0.84);

    gsap.set(svg.querySelectorAll('.appear'), { y: 12 });
  }

  /* ----------------------------------------------------------
     Registry of Absence — live list of issued certificates
     ---------------------------------------------------------- */
  function initRegistry() {
    var list = document.querySelector('[data-registry]');
    if (!list) return;

    fetch('/api/registry')
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.data.certificates) {
          list.innerHTML = '<div class="registry-status">' +
            esc(res.data.error || 'The registry is unavailable.') + '</div>';
          return;
        }
        var certs = res.data.certificates;
        if (!certs.length) {
          list.innerHTML = '<div class="registry-status">The registry awaits its first patron.</div>';
          return;
        }
        list.innerHTML = certs.map(function (c) {
          return '<div class="reg-row">' +
            '<span class="reg-serial">&#8470; ' + esc(c.serial) + '</span>' +
            '<span class="reg-name">' + esc(c.name) + '</span>' +
            '<span class="reg-date">' + esc(c.date) + '</span>' +
            '</div>';
        }).join('');
        if (hasGSAP && !REDUCED) {
          gsap.fromTo(list.querySelectorAll('.reg-row'),
            { opacity: 0, y: 22 },
            {
              opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
              scrollTrigger: { trigger: list, start: 'top 88%', once: true }
            });
        }
      })
      .catch(function () {
        list.innerHTML = '<div class="registry-status">The registry is unavailable.</div>';
      });
  }

  /* ----------------------------------------------------------
     Certificate verifier — authentic or forgery, no mercy
     ---------------------------------------------------------- */
  function initVerifier() {
    var form = document.querySelector('.verify-form');
    if (!form) return;
    var input = form.querySelector('input');
    var result = document.querySelector('.verify-result');
    var busy = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var code = (input.value || '').trim();
      if (code.replace(/[^0-9a-fA-F]/g, '').length !== 12) {
        shake(input.closest('.field'));
        return;
      }
      busy = true;
      result.className = 'verify-result';
      result.innerHTML = '<div class="registry-status">Consulting the archives&hellip;</div>';

      fetch('/api/verify?code=' + encodeURIComponent(code))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          busy = false;
          if (d.valid) {
            result.className = 'verify-result is-valid';
            result.innerHTML =
              '<div class="vr-seal">&empty;</div>' +
              '<div class="vr-body">' +
              '<div class="vr-title">Authentic</div>' +
              '<div class="vr-sub">&#8470; ' + esc(d.serial) + ' &mdash; inscribed to ' + esc(d.name) +
              ' &mdash; ' + esc(d.date) + '</div>' +
              '</div>';
            if (hasGSAP && !REDUCED) {
              gsap.fromTo(result.querySelector('.vr-seal'),
                { scale: 0.3, rotation: -40, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' });
              gsap.fromTo(result.querySelector('.vr-body'),
                { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
            }
          } else if (d.error) {
            result.className = 'verify-result';
            result.innerHTML = '<div class="registry-status">' + esc(d.error) + '</div>';
          } else {
            result.className = 'verify-result is-invalid';
            result.innerHTML =
              '<div class="vr-title">This certificate is a forgery.</div>' +
              '<div class="vr-sub">How embarrassing.</div>';
            shake(result);
          }
        })
        .catch(function () {
          busy = false;
          result.className = 'verify-result';
          result.innerHTML = '<div class="registry-status">The concierge is unavailable.</div>';
        });
    });
  }

  function shake(el) {
    if (!el) return;
    if (hasGSAP && !REDUCED) {
      gsap.fromTo(el, { x: 0 }, { x: -9, duration: 0.07, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' });
    }
  }

  /* ----------------------------------------------------------
     Checkout — PayPal Buttons gated on an inscription name;
     a verified capture mints the personalised certificate
     ---------------------------------------------------------- */
  function initCheckout() {
    var container = document.getElementById('paypal-buttons');
    if (!container) return;
    var nameInput = document.getElementById('inscription-name');
    var stagePay = document.getElementById('stage-pay');
    var stageCert = document.getElementById('stage-cert');

    function inscribedName() {
      var v = (nameInput && nameInput.value || '').replace(/\s+/g, ' ').trim();
      return v.length >= 2 ? v : null;
    }

    function mount() {
      if (typeof paypal === 'undefined' || !paypal.Buttons) return false;
      paypal.Buttons({
        style: { layout: 'vertical', color: 'black', shape: 'pill', label: 'pay' },
        onClick: function (data, actions) {
          if (!inscribedName()) {
            shake(nameInput.closest('.field'));
            nameInput.focus();
            return actions.reject();
          }
          return actions.resolve();
        },
        createOrder: function () {
          return fetch('/api/create-order', { method: 'POST' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (!d.orderID) throw new Error(d.error || 'Order failed');
              return d.orderID;
            });
        },
        onApprove: function (data) {
          return fetch('/api/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, name: inscribedName() })
          })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (!d.certificate) throw new Error(d.error || 'Capture failed');
              showCertificate(d.certificate);
            })
            .catch(function (err) {
              toast('The acquisition could not be completed', err.message || 'Please try again.');
            });
        },
        onError: function () {
          toast('The concierge encountered a problem', 'Payment could not be initiated.');
        }
      }).render('#paypal-buttons');
      return true;
    }

    if (!mount()) {
      var tries = 0;
      var t = setInterval(function () {
        if (mount() || ++tries > 100) clearInterval(t);
      }, 100);
    }

    // Test-purchase button: only revealed when the site has explicitly
    // opted in via ALLOW_TEST_PURCHASE, so real customers never see it.
    var testBtn = document.getElementById('test-purchase');
    if (testBtn) {
      fetch('/api/config')
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.testPurchase) testBtn.hidden = false; })
        .catch(function () {});

      var testBusy = false;
      testBtn.addEventListener('click', function () {
        if (testBusy) return;
        if (!inscribedName()) {
          shake(nameInput.closest('.field'));
          nameInput.focus();
          return;
        }
        testBusy = true;
        testBtn.classList.add('is-success');
        fetch('/api/test-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: inscribedName() })
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (!d.certificate) throw new Error(d.error || 'Test purchase failed');
            showCertificate(d.certificate);
          })
          .catch(function (err) {
            testBusy = false;
            testBtn.classList.remove('is-success');
            toast('Test purchase failed', err.message || 'Please try again.');
          });
      });
    }

    var currentCert = null;

    function showCertificate(cert) {
      currentCert = cert;
      setSvgText('cert-name', cert.name);
      setSvgText('cert-serial',
        'EDITION № ' + cert.serial + ' — ISSUED ' + String(cert.date).toUpperCase());
      setSvgText('cert-code',
        'VERIFICATION CODE ' + cert.code + ' — AUTHENTICATE AT LUXURYOFNOTHING.LIFE');
      try { localStorage.removeItem('lon-cart'); } catch (e) {}

      stagePay.hidden = true;
      stageCert.hidden = false;
      window.scrollTo(0, 0);
      toast('Certificate of Absence generated',
        '№ ' + cert.serial + ', inscribed to ' + cert.name + '.');

      if (hasGSAP && !REDUCED) {
        var tl = gsap.timeline();
        tl.fromTo(stageCert, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
          .fromTo('.cert-live-frame',
            { clipPath: 'inset(0 0 100% 0)', y: 24 },
            { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'power4.inOut' }, 0.1)
          .fromTo('#cert-seal',
            { scale: 0.4, rotation: -50, opacity: 0, transformOrigin: '50% 50%' },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, '-=0.3')
          .fromTo('.cert-actions, .cert-email-form, .cert-keep-note, #stage-cert .back-row',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09 }, '-=0.35');
      }
    }

    function setSvgText(id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    // Shared rasteriser: draws the live SVG certificate onto a canvas at 2x
    // and hands back a PNG data URL. Used by both Download and Email PDF.
    // Fonts fall back to Georgia in the raster; Print/PDF uses live webfonts.
    function rasterizeCert(onDone, onError) {
      var svg = document.getElementById('cert-live');
      if (!svg) { onError(new Error('Certificate not found')); return; }
      var xml = new XMLSerializer().serializeToString(svg);
      var blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 1520; canvas.height = 1120;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FBFAF6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        onDone(canvas.toDataURL('image/png'));
      };
      img.onerror = function () { URL.revokeObjectURL(url); onError(new Error('Could not rasterise certificate')); };
      img.src = url;
    }

    var dlBtn = document.getElementById('cert-download');
    if (dlBtn) {
      dlBtn.addEventListener('click', function () {
        rasterizeCert(function (dataUrl) {
          var a = document.createElement('a');
          a.download = 'certificate-of-absence.png';
          a.href = dataUrl;
          a.click();
          toast('Certificate downloaded', 'A perfect copy of your proof of nothing.');
        }, function () { window.print(); });
      });
    }
    var prBtn = document.getElementById('cert-print');
    if (prBtn) prBtn.addEventListener('click', function () { window.print(); });

    // Email the certificate as a PDF attachment. Gated server-side on the
    // (private) verification code so the endpoint can't be used to blast
    // arbitrary attachments to arbitrary addresses.
    var emailForm = document.getElementById('cert-email-form');
    if (emailForm) {
      var emailInput = document.getElementById('cert-email');
      var emailBtn = document.getElementById('cert-email-btn');
      var emailLabel = emailBtn.querySelector('.btn-label');
      var emailBusy = false;

      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (emailBusy || !currentCert) return;

        var email = (emailInput.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          shake(emailInput.closest('.field'));
          emailInput.focus();
          return;
        }

        emailBusy = true;
        emailBtn.classList.add('is-sending');
        emailLabel.textContent = 'Sending…';

        function reset() {
          emailBusy = false;
          emailBtn.classList.remove('is-sending');
          emailLabel.textContent = 'Send PDF';
        }

        rasterizeCert(function (dataUrl) {
          fetch('/api/email-certificate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentCert.code, email: email, image: dataUrl })
          })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (res) {
              reset();
              if (!res.ok || !res.d || res.d.error) {
                throw new Error((res.d && res.d.error) || 'Failed to send');
              }
              emailBtn.classList.add('is-success');
              setTimeout(function () { emailBtn.classList.remove('is-success'); }, 2600);
              toast('Certificate emailed', 'Sent to ' + email + '.');
              emailInput.value = '';
              emailInput.closest('.field').classList.remove('is-filled');
            })
            .catch(function (err) {
              reset();
              toast('Could not send the certificate', err.message || 'Please try again.');
            });
        }, function () {
          reset();
          toast('Could not send the certificate', 'Please try Download instead.');
        });
      });
    }
  }

  /* ----------------------------------------------------------
     Cart — fly-to-cart, badge bump, glass drawer
     ---------------------------------------------------------- */
  var cart = [];
  function initCart() {
    try { cart = JSON.parse(localStorage.getItem('lon-cart') || '[]'); } catch (e) { cart = []; }

    var drawer = document.querySelector('.cart-drawer');
    var backdrop = document.querySelector('.cart-backdrop');
    var openBtn = document.querySelector('.nav-cart');
    if (!drawer || !openBtn) return;

    renderCart();
    updateBadge(false);

    var addButtons = document.querySelectorAll('[data-add-to-cart]');

    // Reflect items already in the cart (restored from localStorage) so a
    // button for an item you already own doesn't invite adding it again.
    addButtons.forEach(function (btn) {
      var id = btn.getAttribute('data-id') || btn.getAttribute('data-name');
      if (cart.some(function (it) { return it.id === id; })) lockButton(btn);
    });

    openBtn.addEventListener('click', function (e) { e.preventDefault(); openDrawer(); });
    drawer.querySelector('.cart-close').addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

    addButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.getAttribute('data-id') || btn.getAttribute('data-name');
        if (cart.some(function (it) { return it.id === id; })) {
          toast('Already in your void', 'One unit of nothing is quite enough.');
          openDrawer();
          return;
        }
        addItem({
          id: id,
          name: btn.getAttribute('data-name') || 'Absolutely Nothing',
          sub: btn.getAttribute('data-sub') || '',
          price: parseFloat(btn.getAttribute('data-price') || '1999')
        }, btn);
      });
    });

    drawer.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-remove]');
      if (rm) {
        var idx = parseInt(rm.getAttribute('data-remove'), 10);
        var row = rm.closest('.cart-item');
        var removed = cart.splice(idx, 1)[0];
        persist();
        updateBadge(true);
        if (removed) unlockButton(removed.id);
        if (hasGSAP && !REDUCED && row) {
          gsap.to(row, {
            opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0,
            duration: 0.45, ease: 'power3.in', onComplete: renderCart
          });
        } else renderCart();
      }
    });

    function lockButton(btn) {
      btn.classList.add('is-success');
      btn.disabled = true;
    }
    function unlockButton(id) {
      addButtons.forEach(function (btn) {
        if ((btn.getAttribute('data-id') || btn.getAttribute('data-name')) === id) {
          btn.classList.remove('is-success');
          btn.disabled = false;
        }
      });
    }

    function openDrawer() {
      renderCart();
      document.body.classList.add('drawer-open');
      drawer.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      if (hasGSAP && !REDUCED) {
        gsap.fromTo(drawer.querySelectorAll('.cart-item, .cart-empty, .cart-foot'),
          { opacity: 0, x: 36 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.18 });
      }
      if (lenis) lenis.stop();
    }
    function closeDrawer() {
      document.body.classList.remove('drawer-open');
      drawer.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      if (lenis) lenis.start();
    }

    function addItem(item, btn) {
      cart.push(item);
      persist();
      // button morph → checkmark, and stays locked: this is a one-per-void item
      if (btn) {
        if (hasGSAP && !REDUCED) {
          gsap.fromTo(btn, { scale: 1 }, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' });
        }
        lockButton(btn);
      }
      // flying dot: button → cart icon
      if (btn && hasGSAP && !REDUCED) {
        var target = openBtn.getBoundingClientRect();
        var from = btn.getBoundingClientRect();
        var d = document.createElement('div');
        d.className = 'fly-dot';
        document.body.appendChild(d);
        gsap.set(d, { x: from.left + from.width / 2, y: from.top + from.height / 2 });
        var tl = gsap.timeline({ onComplete: function () { d.remove(); updateBadge(true); } });
        tl.to(d, { x: target.left + target.width / 2, duration: 0.75, ease: 'power2.inOut' }, 0)
          .to(d, { y: target.top + target.height / 2, duration: 0.75, ease: 'back.in(1.4)' }, 0)
          .to(d, { scale: 0.2, opacity: 0.6, duration: 0.3 }, 0.5);
      } else {
        updateBadge(true);
      }
      toast(item.name + ' committed to the void', 'It will arrive as it is: not at all.');
    }

    function updateBadge(bump) {
      var badge = document.querySelector('.nav-cart-count');
      if (!badge) return;
      badge.textContent = String(cart.length);
      badge.classList.toggle('is-visible', cart.length > 0);
      if (bump && cart.length > 0) {
        badge.classList.remove('is-bump');
        void badge.offsetWidth; // restart animation
        badge.classList.add('is-bump');
      }
    }

    function renderCart() {
      var list = drawer.querySelector('.cart-items');
      var foot = drawer.querySelector('.cart-foot');
      var total = cart.reduce(function (s, it) { return s + (it.price || 0); }, 0);
      if (!cart.length) {
        list.innerHTML =
          '<div class="cart-empty">' +
          '<div class="ce-ring"></div>' +
          '<p>Your void is empty. Which is, of course, the point.</p>' +
          '</div>';
        foot.style.display = 'none';
        return;
      }
      foot.style.display = '';
      list.innerHTML = cart.map(function (it, i) {
        return '<div class="cart-item">' +
          '<div class="cart-item-thumb"><span>&empty;</span></div>' +
          '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + esc(it.name) + '</div>' +
          (it.sub ? '<div class="cart-item-sub">' + esc(it.sub) + '</div>' : '') +
          '<button class="cart-item-remove u-line" data-remove="' + i + '">Release</button>' +
          '</div>' +
          '<div class="cart-item-price">$' + Number(it.price).toLocaleString() + '</div>' +
          '</div>';
      }).join('');
      drawer.querySelector('.cart-total-value').textContent = '$' + total.toLocaleString();
    }

    function persist() {
      try { localStorage.setItem('lon-cart', JSON.stringify(cart)); } catch (e) {}
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ----------------------------------------------------------
     Toast — spring in, shrinking progress bar, auto-dismiss
     ---------------------------------------------------------- */
  function toast(title, sub) {
    var stack = document.querySelector('.toast-stack');
    if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML =
      '<div class="toast-title">' + esc(title) + '</div>' +
      (sub ? '<div class="toast-sub">' + esc(sub) + '</div>' : '') +
      '<div class="toast-bar"></div>';
    stack.appendChild(t);
    var bar = t.querySelector('.toast-bar');
    var LIFE = 4.2;
    if (hasGSAP && !REDUCED) {
      gsap.fromTo(t, { y: 26, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' });
      gsap.fromTo(bar, { scaleX: 1 }, { scaleX: 0, duration: LIFE, ease: 'none' });
      gsap.to(t, {
        y: 14, opacity: 0, duration: 0.5, ease: 'power2.in', delay: LIFE,
        onComplete: function () { t.remove(); }
      });
    } else {
      bar.style.display = 'none';
      setTimeout(function () { t.remove(); }, LIFE * 1000);
    }
  }
  window.lonToast = toast;

  /* ----------------------------------------------------------
     Floating labels — shared by every .field input on the site
     ---------------------------------------------------------- */
  function initFieldLabels() {
    document.querySelectorAll('.field input').forEach(function (input) {
      input.addEventListener('input', function () {
        input.closest('.field').classList.toggle('is-filled', input.value.trim() !== '');
      });
    });
  }

  /* ----------------------------------------------------------
     Page veil — wipe between pages instead of a hard cut
     ---------------------------------------------------------- */
  function initVeil() {
    var veil = document.querySelector('.veil');
    if (!veil) return;
    var word = veil.querySelector('.veil-word');

    // Arriving from a veiled exit: reveal by wiping up
    var arriving = false;
    try { arriving = sessionStorage.getItem('lon-veil') === '1'; sessionStorage.removeItem('lon-veil'); } catch (e) {}
    if (arriving && !document.querySelector('.preloader')) {
      if (hasGSAP && !REDUCED) {
        gsap.set(veil, { clipPath: 'inset(0 0 0 0)' });
        gsap.to(veil, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut', delay: 0.15 });
      }
    }

    if (REDUCED || !hasGSAP) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' ||
          /^(https?:)?\/\//.test(href) || href.indexOf('mailto:') === 0) return;
      if (a.hasAttribute('data-no-veil') || a.hasAttribute('data-add-to-cart')) return;
      e.preventDefault();
      try { sessionStorage.setItem('lon-veil', '1'); } catch (err) {}
      var tl = gsap.timeline({ onComplete: function () { window.location.href = href; } });
      tl.to(veil, { clipPath: 'inset(0 0 0 0)', duration: 0.65, ease: 'power4.inOut' });
      if (word) tl.fromTo(word, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.25');
    });

    // back/forward cache: never trap the user behind the veil
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) gsap.set(veil, { clipPath: 'inset(100% 0 0 0)' });
    });
  }

  /* ----------------------------------------------------------
     Smooth anchors
     ---------------------------------------------------------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.6 });
        else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
  }
})();
