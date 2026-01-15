import { useEffect, useRef, useState, useCallback } from 'react';
import notableSmallGif from "@/assets/notable-small.gif";

const NotableProjectsPixelation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [pixelation, setPixelation] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const requestRunningRef = useRef(false);
  
  // Load image
  useEffect(() => {
    const img = new Image();
    imgRef.current = img;
    
    img.onload = () => {
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.error('Failed to load notable-small.gif');
      setImageLoaded(true);
    };
    
    img.src = notableSmallGif;
  }, []);
  
  // Scroll handler with requestAnimationFrame for performance
  const handleScroll = useCallback(() => {
    if (!containerRef.current || requestRunningRef.current) return;
    
    requestRunningRef.current = true;
    requestAnimationFrame(() => {
      if (!containerRef.current) {
        requestRunningRef.current = false;
        return;
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = windowHeight / 2;
      
      const distanceFromCenter = Math.abs(elementCenter - screenCenter);
      const buffer = 50; // 50px buffer for full resolution
      const maxDistance = windowHeight / 2 + rect.height / 2;
      
      const effectiveDistance = Math.max(0, distanceFromCenter - buffer);
      const normalizedDistance = Math.min(effectiveDistance / (maxDistance - buffer), 1);
      
      setPixelation(normalizedDistance);
      requestRunningRef.current = false;
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Draw pixelated image on canvas
  const drawPixelated = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const displaySize = 230;
    
    canvas.width = displaySize;
    canvas.height = displaySize;
    
    // Cell size: 1px (full res) to 200px (very pixelated)
    const maxCellSize = 200;
    const minCellSize = 1;
    const cellSize = minCellSize + (maxCellSize - minCellSize) * pixelation;
    
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback gradient if image doesn't load
      const gradient = ctx.createLinearGradient(0, 0, displaySize, displaySize);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, displaySize, displaySize);
      
      const cols = Math.ceil(displaySize / cellSize);
      const rows = Math.ceil(displaySize / cellSize);
      
      const imageData = ctx.getImageData(0, 0, displaySize, displaySize);
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = Math.floor((x + 0.5) * cellSize);
          const py = Math.floor((y + 0.5) * cellSize);
          
          if (px < displaySize && py < displaySize) {
            const index = (py * displaySize + px) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
      return;
    }
    
    const cols = Math.ceil(displaySize / cellSize);
    const rows = Math.ceil(displaySize / cellSize);
    
    ctx.imageSmoothingEnabled = false;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sx = (x / cols) * img.width;
        const sy = (y / rows) * img.height;
        const sw = img.width / cols;
        const sh = img.height / rows;
        
        const dx = x * cellSize;
        const dy = y * cellSize;
        const dw = cellSize;
        const dh = cellSize;
        
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      }
    }
  }, [pixelation]);
  
  useEffect(() => {
    if (imageLoaded) {
      drawPixelated();
    }
  }, [pixelation, imageLoaded, drawPixelated]);
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ 
        width: '230px', 
        height: '230px'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '230px',
          height: '230px',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default NotableProjectsPixelation;
