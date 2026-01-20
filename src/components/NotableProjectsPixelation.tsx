import { useEffect, useRef } from "react";
import notableSmallGif from "@/assets/notable-small.gif";

const DISPLAY_WIDTH = 270;
const DISPLAY_HEIGHT = 480;

const FOCUS_ZONE_PX = 100;
const MAX_PIXEL_SIZE = 100; // cells up to 100px

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  destW: number,
  destH: number
) {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  if (!srcW || !srcH) return;

  const srcAspect = srcW / srcH;
  const destAspect = destW / destH;

  let sx = 0;
  let sy = 0;
  let sWidth = srcW;
  let sHeight = srcH;

  // Crop source to match destination aspect ratio (cover)
  if (srcAspect > destAspect) {
    sWidth = srcH * destAspect;
    sx = (srcW - sWidth) / 2;
  } else {
    sHeight = srcW / destAspect;
    sy = (srcH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, destW, destH);
}

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setupCanvasForDpr = () => {
    const canvas = pixelCanvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(DISPLAY_WIDTH * dpr);
    canvas.height = Math.round(DISPLAY_HEIGHT * dpr);
    canvas.style.width = `${DISPLAY_WIDTH}px`;
    canvas.style.height = `${DISPLAY_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Work in CSS pixels; map to backing store with DPR.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getDistanceFromCenter = () => {
    if (!containerRef.current) return Infinity;
    const rect = containerRef.current.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;
    return Math.abs(elementCenter - screenCenter);
  };

  const pixelate = (pixelSize: number) => {
    const canvas = pixelCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear (in CSS-pixel coordinate space)
    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    // No pixelation
    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      drawImageCover(ctx, img, DISPLAY_WIDTH, DISPLAY_HEIGHT);
      return;
    }

    // Reuse a single temp canvas for performance
    if (!tempCanvasRef.current) tempCanvasRef.current = document.createElement("canvas");
    const tempCanvas = tempCanvasRef.current;

    const scaledW = Math.max(1, Math.ceil(DISPLAY_WIDTH / pixelSize));
    const scaledH = Math.max(1, Math.ceil(DISPLAY_HEIGHT / pixelSize));

    tempCanvas.width = scaledW;
    tempCanvas.height = scaledH;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.clearRect(0, 0, scaledW, scaledH);
    tempCtx.imageSmoothingEnabled = true;
    drawImageCover(tempCtx, img, scaledW, scaledH);

    // Pixelated upscale
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  };

  const updatePixelation = () => {
    const distance = getDistanceFromCenter();

    let pixelSize = 1;
    if (distance > FOCUS_ZONE_PX) {
      const maxDistance = Math.max(window.innerHeight, FOCUS_ZONE_PX + 1);
      const normalized = Math.min(
        (distance - FOCUS_ZONE_PX) / (maxDistance - FOCUS_ZONE_PX),
        1
      );
      pixelSize = 1 + normalized * (MAX_PIXEL_SIZE - 1);
    }

    pixelate(pixelSize);
  };

  useEffect(() => {
    setupCanvasForDpr();

    const onResize = () => {
      setupCanvasForDpr();
      updatePixelation();
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation loop: continuously redraw so the GIF keeps playing
  useEffect(() => {
    const start = () => {
      const animate = () => {
        updatePixelation();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    const img = imgRef.current;
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      start();
    } else {
      img.onload = () => start();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll listener for responsiveness (rAF loop does the work; this just avoids any "paused" feel)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updatePixelation();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* 
        Position the GIF off-screen but fully visible so browsers keep animating it.
        Using position:fixed ensures it's always rendered (not clipped by overflow:hidden).
      */}
      <img
        ref={imgRef}
        src={notableSmallGif}
        alt=""
        width={DISPLAY_WIDTH}
        height={DISPLAY_HEIGHT}
        decoding="async"
        loading="eager"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: -9999,
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
          pointerEvents: "none",
          visibility: "visible",
          opacity: 1,
        }}
      />

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg"
        style={{ width: `${DISPLAY_WIDTH}px`, height: `${DISPLAY_HEIGHT}px` }}
      >
        <canvas
          ref={pixelCanvasRef}
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </>
  );
};

export default NotableProjectsPixelation;
