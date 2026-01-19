import { useEffect, useRef } from "react";
import notableSmallGif from "@/assets/notable-small.gif";

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    ctx.clearRect(0, 0, w, h);

    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const scaledW = Math.ceil(w / pixelSize);
    const scaledH = Math.ceil(h / pixelSize);

    tempCanvas.width = scaledW;
    tempCanvas.height = scaledH;

    tempCtx.drawImage(img, 0, 0, scaledW, scaledH);

    ctx.imageSmoothingEnabled = false;
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
    const focusZone = 100;

    let pixelSize: number;
    if (distance <= focusZone) {
      pixelSize = 1;
    } else {
      const maxDistance = window.innerHeight;
      const normalizedDistance = Math.min(
        (distance - focusZone) / (maxDistance - focusZone),
        1
      );
      pixelSize = 1 + normalizedDistance * 99;
    }

    pixelate(pixelSize);
  };

  useEffect(() => {
    const animate = () => {
      updatePixelation();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

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
      <img
        ref={imgRef}
        src={notableSmallGif}
        alt="Notable project"
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        crossOrigin="anonymous"
      />
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
