// Generate floating squares for background
const squareCount = 15; // Increased number of squares
const squaresContainer = document.createElement('div');
squaresContainer.className = 'background-squares';
squaresContainer.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`;

for (let i = 0; i < squareCount; i++) {
  const square = document.createElement('div');
  square.className = 'background-square';
  
  // Random size between 20px and 80px
  const size = Math.random() * 60 + 20;
  
  // Random position
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  
  // Random animation duration between 20s and 40s
  const duration = 20 + Math.random() * 20;
  
  // Random delay
  const delay = Math.random() * 10;
  
  // Random movement range
  const moveX = (Math.random() - 0.5) * 100;
  const moveY = (Math.random() - 0.5) * 100;
  
  square.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: rgba(197, 168, 128, 0.03);
    border: 1px solid rgba(197, 168, 128, 0.08);
    transform: rotate(${Math.random() * 360}deg);
    left: ${x}px;
    top: ${y}px;
    animation: floatSquare ${duration}s ease-in-out infinite;
    animation-delay: ${delay}s;
  `;
  
  // Add CSS animation for this specific square
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatSquare {
      0%, 100% {
        transform: translate(0, 0) rotate(${Math.random() * 360}deg);
        opacity: 0.3;
      }
      25% {
        transform: translate(${moveX}px, ${moveY * 0.5}px) rotate(${Math.random() * 360}deg);
        opacity: 0.6;
      }
      50% {
        transform: translate(${moveX * 0.5}px, ${moveY}px) rotate(${Math.random() * 360}deg);
        opacity: 0.4;
      }
      75% {
        transform: translate(${moveX * 0.8}px, ${moveY * 0.3}px) rotate(${Math.random() * 360}deg);
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);
  
  squaresContainer.appendChild(square);
}

document.body.appendChild(squaresContainer);

// Responsive handling
window.addEventListener('resize', () => {
  const squares = document.querySelectorAll('.background-square');
  squares.forEach(square => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
  });
}); 