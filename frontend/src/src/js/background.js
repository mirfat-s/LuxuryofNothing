// Generate Perlin-like noise overlay
const noiseCanvas = document.createElement('canvas');
noiseCanvas.width = window.innerWidth;
noiseCanvas.height = window.innerHeight;
noiseCanvas.className = 'noise';
const nctx = noiseCanvas.getContext('2d');
const imageData = nctx.createImageData(noiseCanvas.width, noiseCanvas.height);
for (let i = 0; i < imageData.data.length; i += 4) {
  const v = Math.random() * 255;
  imageData.data[i] = v;
  imageData.data[i + 1] = v;
  imageData.data[i + 2] = v;
  imageData.data[i + 3] = 10; // low alpha for subtle texture
}
nctx.putImageData(imageData, 0, 0);
document.body.appendChild(noiseCanvas);