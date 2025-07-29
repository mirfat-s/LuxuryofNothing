// Create floating orbs
const orbCount = 10;
for (let i = 0; i < orbCount; i++) {
  const orb = document.createElement('div');
  orb.className = 'orb';
  const size = Math.random() * 20 + 10;
  orb.style.setProperty('--duration', `${20 + Math.random() * 20}s`);
  orb.style.setProperty('--delay', `${Math.random() * 10}s`);
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const dx = (Math.random() - 0.5) * 50;
  const dy = (Math.random() - 0.5) * 50;
  orb.style.setProperty('--x', `${x}px`);
  orb.style.setProperty('--y', `${y}px`);
  orb.style.setProperty('--dx', `${dx}px`);
  orb.style.setProperty('--dy', `${dy}px`);
  orb.style.width = `${size}px`;
  orb.style.height = `${size}px`;
  document.body.appendChild(orb);
}