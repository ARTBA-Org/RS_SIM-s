import { useRef, useEffect } from 'react';

export const draw2DScene = (ctx, carPosition, workerPosition, headlightMode, useMetric) => {

  
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
  
  // Convert distance to feet if not using metric
  const distance = Math.abs(carPosition - workerPosition);

  const displayDistance = useMetric ? 
    `${distance.toFixed(0)}m` : 
    `${(distance * 3.28084).toFixed(0)}ft`;  // Convert meters to feet
  
  // Draw legend with headlight beam indicator - moved earlier and made more visible
  ctx.fillStyle = '#00ff00';
  ctx.fillText('● Car', 10, height * 0.3);
  
  // Make beam indicator more visible
  ctx.fillStyle = 'rgba(176, 224, 230, 0.8)'; // Increased opacity
  ctx.fillRect(55, height * 0.3 - 10, 15, 15); // Draw a visible rectangle instead of text
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Headlights', 75, height * 0.3);
  
  ctx.fillStyle = '#ff8800';
  ctx.fillText('● Worker', 140, height * 0.3);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`----- ${displayDistance}`, 200, height * 0.3);
  
  // Draw markers every 50 meters/150 feet
  ctx.textAlign = 'center';
  const markerInterval = useMetric ? 50 : 150;  // 50m or ~150ft
  const maxDistance = useMetric ? 400 : 1200;   // 400m or ~1200ft
  
  for (let i = 0; i <= maxDistance; i += markerInterval) {
    const x = offsetX + ((i / (useMetric ? 1 : 3.28084)) * scale);
    
    ctx.strokeStyle = '#444444';
    ctx.beginPath();
    ctx.moveTo(x, height * 0.7);
    ctx.lineTo(x, height * 0.5);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${i}${useMetric ? 'm' : 'ft'}`, x, height * 0.85);
  }
  
  
  
  // Draw car and worker positions
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
  
  // Draw car
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.arc(carX, height * 0.6, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw worker
  ctx.fillStyle = '#ff8800';
  ctx.beginPath();
  ctx.arc(workerX, height * 0.6, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw distance line
  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(carX, height * 0.6);
  ctx.lineTo(workerX, height * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw headlight beam projection if lights are on - made more visible
  if (headlightMode != 'off') {


    const beamLength = headlightMode === true ? 80 : 35; // High beam vs normal beam
    const beamWidth = beamLength * 0.4; // Beam width proportional to length
    
    ctx.beginPath();
    ctx.moveTo(carX, height * 0.6); // Start at car position
    ctx.lineTo(carX + (beamLength * scale), height * 0.6 - (beamWidth * scale / 2)); // Top point
    ctx.lineTo(carX + (beamLength * scale), height * 0.6 + (beamWidth * scale / 2)); // Bottom point
    ctx.closePath();
    
    ctx.fillStyle = 'rgba(176, 224, 230, 0.6)'; // Increased opacity
    ctx.fill();
    
    // Add stroke to make it more visible
    ctx.strokeStyle = 'rgba(176, 224, 230, 0.8)';
    ctx.stroke();
  }
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
