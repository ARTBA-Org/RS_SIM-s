import { useRef, useEffect } from 'react';

export const draw2DScene = (ctx, carPosition, workerPosition) => {
  const canvas = ctx.canvas;
  
  // Set canvas resolution to match display size
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  // Improved font settings
  ctx.strokeStyle = '#444444';
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  // Convert road length to pixels (use 80% of canvas width)
  const scale = (width * 0.8) / 402.336;
  const offsetX = width * 0.1;
  
  // Calculate distance between car and worker
  const distance = Math.abs(carPosition - workerPosition);
  
  // Add legend with distance at top left
  ctx.fillStyle = '#00ff00';
  ctx.fillText('● Car', 10, height * 0.3);
  ctx.fillStyle = '#ff8800';
  ctx.fillText('● Worker', 70, height * 0.3);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`----- ${distance.toFixed(0)}m`, 140, height * 0.3);
  
  // Draw markers every 50 meters
  ctx.textAlign = 'center'; // Reset text align for markers
  for (let i = 0; i <= 400; i += 50) {
    const x = offsetX + (i * scale);
    
    ctx.strokeStyle = '#444444';
    ctx.beginPath();
    ctx.moveTo(x, height * 0.7);
    ctx.lineTo(x, height * 0.5);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${i}m`, x, height * 0.85);
  }
  
  // Draw worker position
  const workerX = offsetX + ((workerPosition + 200) * scale);
  ctx.fillStyle = '#ff8800';
  ctx.beginPath();
  ctx.arc(workerX, height * 0.6, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw car position
  const carX = offsetX + ((carPosition + 200) * scale);
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.arc(carX, height * 0.6, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw distance line between car and worker
  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(carX, height * 0.6);
  ctx.lineTo(workerX, height * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);
};

export const create2DVisualization = (distanceCanvasRef) => {
  // Instead of JSX, create the canvas element directly
  const canvas = document.createElement('canvas');
  
  // Apply styles
  Object.assign(canvas.style, {
    width: '100%',
    maxWidth: '768px',
    height: '10vh',
    backgroundColor: '#1a1a1a',
    margin: '0 auto',
    display: 'block',
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0'
  });

  // Set the ref
  if (distanceCanvasRef) {
    distanceCanvasRef.current = canvas;
  }

  return canvas;
};
