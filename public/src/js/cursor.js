// Custom cursor with trail and click ripple
const cursorDot = document.querySelector('.cursor-dot');
const cursorTrail = document.querySelector('.cursor-trail');
let trailX = window.innerWidth / 2;
let trailY = window.innerHeight / 2;

document.addEventListener('pointermove', e => {
  cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  trailX += (e.clientX - trailX) * 0.2;
  trailY += (e.clientY - trailY) * 0.2;
  cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px)`;
});

document.addEventListener('click', e => {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);
  setTimeout(() => document.body.removeChild(ripple), 600);
});