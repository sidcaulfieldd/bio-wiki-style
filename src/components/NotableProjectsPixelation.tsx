import { useEffect, useRef, useState } from "react";
import notableSmallGif from "@/assets/notable-small.gif";

const DISPLAY_WIDTH = 270;
const DISPLAY_HEIGHT = 480;
const FOCUS_ZONE_PX = 100;
const MAX_PIXEL_SIZE = 100;

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInFocus, setIsInFocus] = useState(false);
  const [currentPixelSize, setCurrentPixelSize] = useState(MAX_PIXEL_SIZE);

  const getPixelSize = () => {
    if (!containerRef.current) return MAX_PIXEL_SIZE;
    
    const rect = containerRef.current.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;
    const distance = Math.abs(elementCenter - screenCenter);

    if (distance <= FOCUS_ZONE_PX) return 1;
    
    const maxDistance = Math.max(window.innerHeight, FOCUS_ZONE_PX + 1);
    const normalized = Math.min(
      (distance - FOCUS_ZONE_PX) / (maxDistance - FOCUS_ZONE_PX),
      1
    );
    return 1 + normalized * (MAX_PIXEL_SIZE - 1);
  };

  const drawPixelatedImage = (pixelSize: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    if (pixelSize <= 1) {
      // Just draw normally if somehow we're at pixel size 1
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
      return;
    }

    // Calculate cover crop (same aspect ratio logic)
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const srcAspect = srcW / srcH;
    const destAspect = DISPLAY_WIDTH / DISPLAY_HEIGHT;
    
    let sx = 0, sy = 0, sWidth = srcW, sHeight = srcH;
    
    if (srcAspect > destAspect) {
      sWidth = srcH * destAspect;
      sx = (srcW - sWidth) / 2;
    } else {
      sHeight = srcW / destAspect;
      sy = (srcH - sHeight) / 2;
    }

    // Create pixelation effect
    const scaledW = Math.max(1, Math.ceil(DISPLAY_WIDTH / pixelSize));
    const scaledH = Math.max(1, Math.ceil(DISPLAY_HEIGHT / pixelSize));

    // Draw small then scale up for pixelation
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      img,
      sx, sy, sWidth, sHeight,
      0, 0, scaledW, scaledH
    );

    // Scale back up with no smoothing for pixelated effect
    const imageData = ctx.getImageData(0, 0, scaledW, scaledH);
    ctx.imageSmoothingEnabled = false;
    
    // Use a temporary canvas to avoid artifacts
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledW;
    tempCanvas.height = scaledH;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    }
  };

  const updateView = () => {
    const pixelSize = getPixelSize();
    const shouldBeInFocus = pixelSize <= 1.5; // Small threshold for floating point
    
    setIsInFocus(shouldBeInFocus);
    setCurrentPixelSize(pixelSize);

    // Update canvas when out of focus
    if (!shouldBeInFocus) {
      drawPixelatedImage(pixelSize);
    }
  };

  // Setup canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = DISPLAY_WIDTH * dpr;
    canvas.height = DISPLAY_HEIGHT * dpr;
    canvas.style.width = `${DISPLAY_WIDTH}px`;
    canvas.style.height = `${DISPLAY_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  // Initial draw when image loads
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      updateView();
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, []);

  // Scroll listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        updateView();
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg mx-auto"
      style={{ width: `${DISPLAY_WIDTH}px`, height: `${DISPLAY_HEIGHT}px` }}
    >
      {/* Native GIF - visible when in focus */}
      <img
        ref={imgRef}
        src={notableSmallGif}
        alt="Notable project"
        className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300"
        style={{
          opacity: isInFocus ? 1 : 0,
          pointerEvents: isInFocus ? 'auto' : 'none',
        }}
      />

      {/* Pixelated canvas - visible when out of focus */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-lg transition-opacity duration-300"
        style={{
          imageRendering: 'pixelated',
          opacity: isInFocus ? 0 : 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default NotableProjectsPixelation;
