/* src/js/orbs.js — matches orb.css (uses --duration / --delay) */
(() => {
  // avoid duplicates
  if (document.querySelector('.orbs-bg .orb')) return;

  // host container (create if missing)
  const host = document.querySelector('.orbs-bg') || (() => {
    const d = document.createElement('div');
    d.className = 'orbs-bg';
    Object.assign(d.style, { position:'fixed', inset:'0', pointerEvents:'none', zIndex:'60', overflow:'hidden' });
    document.body.appendChild(d);
    return d;
  })();

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = prefersReduced ? 0 : (innerWidth < 480 ? 6 : innerWidth < 1024 ? 10 : 14);

  function spawn() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('div');
      orb.className = 'orb';
      const size = 10 + Math.random() * 20;
      const x = Math.random() * innerWidth;
      const y = Math.random() * innerHeight;
      const dur = 24 + Math.random() * 18;
      const delay = Math.random() * 10;

      Object.assign(orb.style, { width:`${size}px`, height:`${size}px`, left:`${x}px`, top:`${y}px`, position:'fixed' });
      orb.style.setProperty('--duration', `${dur}s`);
      orb.style.setProperty('--delay', `${delay}s`);
      frag.appendChild(orb);
    }
    host.appendChild(frag);
  }

  spawn();

  // light respawn on resize
  let to;
  addEventListener('resize', () => {
    clearTimeout(to);
    to = setTimeout(() => { host.innerHTML = ''; spawn(); }, 120);
  });
})();
