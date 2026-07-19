/* Wraps the client-rasterised certificate PNG in a single-page PDF.
   pdf-lib is pure JS (no native deps, no on-disk font/asset files), which
   makes it safe to bundle into a Netlify Function — unlike pdfkit, whose
   bundled .afm font files don't survive esbuild bundling reliably. */

import { PDFDocument } from 'pdf-lib';

const MAX_POINTS = 792; // fit comfortably on a US Letter / A4 page

export async function pngToPdf(pngBytes) {
  const pdfDoc = await PDFDocument.create();
  const png = await pdfDoc.embedPng(pngBytes);

  const scale = Math.min(1, MAX_POINTS / Math.max(png.width, png.height));
  const width = png.width * scale;
  const height = png.height * scale;

  const page = pdfDoc.addPage([width, height]);
  page.drawImage(png, { x: 0, y: 0, width, height });

  return pdfDoc.save();
}
