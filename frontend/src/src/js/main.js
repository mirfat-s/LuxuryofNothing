// Navigation highlighting
const navLinks = document.querySelectorAll('.nav-link');
const path = window.location.pathname.split('/').pop();
navLinks.forEach(link => {
  if (link.getAttribute('href') === path) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// Parallax effect for title
const titleLines = document.querySelectorAll('.title-line');
const heroTitle = document.querySelector('.hero-title');

if (heroTitle && titleLines.length > 0) {
  let mouseX = 0;
  let mouseY = 0;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  // Update window dimensions on resize
  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  // Handle mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Calculate normalized mouse position (-1 to 1)
    const normalizedX = (mouseX / windowWidth) * 2 - 1;
    const normalizedY = (mouseY / windowHeight) * 2 - 1;
    
    // Apply parallax effect to each title line
    titleLines.forEach((line, index) => {
      const intensity = (index + 1) * 0.5; // Different intensity for each line
      const moveX = normalizedX * 15 * intensity; // 15px max movement
      const moveY = normalizedY * 10 * intensity; // 10px max movement
      const rotateX = normalizedY * 5 * intensity; // 5 degrees max rotation
      const rotateY = normalizedX * 5 * intensity; // 5 degrees max rotation
      
      // Set CSS custom properties for the parallax effect
      line.style.setProperty('--mouse-x', `${moveX}px`);
      line.style.setProperty('--mouse-y', `${moveY}px`);
      line.style.setProperty('--rotate-x', `${rotateX}deg`);
      line.style.setProperty('--rotate-y', `${rotateY}deg`);
      
      // Add parallax class based on line index
      line.classList.remove('parallax-1', 'parallax-2', 'parallax-3');
      line.classList.add(`parallax-${index + 1}`);
    });
  });

  // Reset position when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    titleLines.forEach((line, index) => {
      line.style.setProperty('--mouse-x', '0px');
      line.style.setProperty('--mouse-y', '0px');
      line.style.setProperty('--rotate-x', '0deg');
      line.style.setProperty('--rotate-y', '0deg');
      line.classList.remove('parallax-1', 'parallax-2', 'parallax-3');
    });
  });
}

// Orbs (from orbs.js)
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
  document.querySelector('.orbs-bg')?.appendChild(orb);
}

// Page transition effect for navigation
function addPageTransition() {
  // Create overlay if not present
  let overlay = document.querySelector('.page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function handlePageLinkTransition(e) {
  const link = e.currentTarget;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
  e.preventDefault();
  const overlay = addPageTransition();
  overlay.classList.add('active');
  setTimeout(() => {
    window.location.href = href;
  }, 400); // match CSS transition
}

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
  // Reset page state when coming back from cache
  if (event.persisted) {
    // Remove any transition overlays
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }

    // Reset body classes
    document.body.classList.remove('page-transitioning');

    // Ensure content is visible
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.style.opacity = '1';
    mainContent.style.visibility = 'visible';

    // Re-trigger animations
    document.querySelectorAll('.animated-fade-in').forEach(el => {
      el.style.visibility = 'visible';
      el.classList.add('fade-in-triggered');
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // Attach to nav and cta links
  document.querySelectorAll('a.nav-link, a.cta-primary').forEach(link => {
    link.addEventListener('click', handlePageLinkTransition);
  });

  // Entering animation for main content
  const mainContent = document.querySelector('.main-content') || document.body;

  // Prevent scrollbars during page transition
  document.body.classList.add('page-transitioning');

  mainContent.classList.add('page-enter');
  setTimeout(() => {
    mainContent.classList.add('page-enter-active');
    // Remove the transitioning class after animation completes
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 700); // Match the transition duration
  }, 30);

  // Trigger fade-in animation for .animated-fade-in elements
  document.querySelectorAll('.animated-fade-in').forEach(el => {
    el.style.visibility = 'visible';
    el.classList.add('fade-in-triggered');
  });

  // Fallback: Ensure page is always visible after a short delay
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.style.opacity = '1';
    mainContent.style.visibility = 'visible';
  }, 100);
});



