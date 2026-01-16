import { useEffect, useRef, useState } from 'react';
import notableSmallGif from "@/assets/notable-small.gif";

const NotableProjectsPixelation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [pixelation, setPixelation] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const requestRunningRef = useRef(false);
  
  // 9:16 aspect ratio dimensions
  const displayWidth = 270;
  const displayHeight = 480;
  
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
  useEffect(() => {
    const handleScroll = () => {
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
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animation loop for GIF
  useEffect(() => {
    if (!imageLoaded) return;
    
    const animate = () => {
      drawPixelated();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [imageLoaded, pixelation]);
  
  const drawPixelated = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Cell size: 1px (full res) to 200px (very pixelated)
    const maxCellSize = 200;
    const minCellSize = 1;
    const cellSize = minCellSize + (maxCellSize - minCellSize) * pixelation;
    
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback gradient if image doesn't load
      const gradient = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      
      const cols = Math.ceil(displayWidth / cellSize);
      const rows = Math.ceil(displayHeight / cellSize);
      
      const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = Math.floor((x + 0.5) * cellSize);
          const py = Math.floor((y + 0.5) * cellSize);
          
          if (px < displayWidth && py < displayHeight) {
            const index = (py * displayWidth + px) * 4;
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
    
    const cols = Math.ceil(displayWidth / cellSize);
    const rows = Math.ceil(displayHeight / cellSize);
    
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
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ 
        width: `${displayWidth}px`, 
        height: `${displayHeight}px`
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default NotableProjectsPixelation;
