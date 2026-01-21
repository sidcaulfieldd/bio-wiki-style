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
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInFocus, setIsInFocus] = useState(false);

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
      return; // Don't draw to canvas when in focus, let img show
    }

    // Round pixel size for consistent blocks
    const roundedPixelSize = Math.round(pixelSize);
    const scaledW = Math.max(1, Math.ceil(DISPLAY_WIDTH / roundedPixelSize));
    const scaledH = Math.max(1, Math.ceil(DISPLAY_HEIGHT / roundedPixelSize));

    // Create temp canvas if it doesn't exist
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement('canvas');
    }
    const tempCanvas = tempCanvasRef.current;
    
    // Only resize if needed
    if (tempCanvas.width !== scaledW || tempCanvas.height !== scaledH) {
      tempCanvas.width = scaledW;
      tempCanvas.height = scaledH;
    }

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw img scaled down to temp canvas (this creates the pixelation)
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.clearRect(0, 0, scaledW, scaledH);
    tempCtx.drawImage(img, 0, 0, scaledW, scaledH);

    // Draw temp canvas scaled up to main canvas (pixelated effect)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  };

  const updateView = () => {
    const pixelSize = getPixelSize();
    const shouldBeInFocus = pixelSize <= 1.5;
    
    setIsInFocus(shouldBeInFocus);

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
        className="absolute inset-0 w-full h-full rounded-lg transition-opacity duration-300"
        style={{
          objectFit: 'cover',
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
