import { useEffect, useRef } from "react";
import notableSmallGif from "@/assets/notable-small.gif";

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Fixed dimensions matching the GIF
  const displayWidth = 270;
  const displayHeight = 480;

  const pixelate = (pixelSize: number) => {
    const pixelCanvas = pixelCanvasRef.current;
    const img = imgRef.current;
    if (!pixelCanvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = pixelCanvas.getContext("2d");
    if (!ctx) return;

    const w = displayWidth;
    const h = displayHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, w, h);

    // If pixel size is 1 or less, draw the image directly (no pixelation)
    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }

    // Create temp canvas for scaled-down version
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const scaledW = Math.ceil(w / pixelSize);
    const scaledH = Math.ceil(h / pixelSize);

    tempCanvas.width = scaledW;
    tempCanvas.height = scaledH;

    // Draw the img to temp canvas at reduced size
    tempCtx.drawImage(img, 0, 0, scaledW, scaledH);

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw the small image back to pixel canvas, scaled up
    ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
  };

  const getDistanceFromCenter = () => {
    if (!containerRef.current) return Infinity;

    const rect = containerRef.current.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;
    return Math.abs(elementCenter - screenCenter);
  };

  const updatePixelation = () => {
    const distance = getDistanceFromCenter();
    const focusZone = 100; // pixels from center where it's fully focused

    let pixelSize: number;
    if (distance <= focusZone) {
      // Fully in focus
      pixelSize = 1;
    } else {
      // Calculate pixel size based on distance
      // Max pixel size is 150, achieved when far from center
      const maxDistance = window.innerHeight;
      const normalizedDistance = Math.min(
        (distance - focusZone) / (maxDistance - focusZone),
        1
      );
      pixelSize = 1 + normalizedDistance * 149; // 1 to 150
    }

    pixelate(pixelSize);
  };

  // Animation loop to continuously update GIF frames and pixelation
  useEffect(() => {
    const animate = () => {
      updatePixelation();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Wait for image to load before starting animation
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        animate();
      } else {
        img.onload = () => animate();
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Scroll listener for more responsive updates
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePixelation();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
      }}
    >
      {/* Hidden source image - the actual GIF */}
      <img
        ref={imgRef}
        src={notableSmallGif}
        alt="Notable project"
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        crossOrigin="anonymous"
      />
      {/* Visible pixelation canvas - shows the pixelated GIF */}
      <canvas
        ref={pixelCanvasRef}
        width={displayWidth}
        height={displayHeight}
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export default NotableProjectsPixelation;
