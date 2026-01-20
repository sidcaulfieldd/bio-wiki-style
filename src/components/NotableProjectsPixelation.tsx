import { useEffect, useRef } from "react";
import notableSmallGif from "@/assets/notable-small.gif";
import { decompressFrames, parseGIF } from "gifuct-js";

const DISPLAY_WIDTH = 270;
const DISPLAY_HEIGHT = 480;

const FOCUS_ZONE_PX = 100;
const MAX_PIXEL_SIZE = 100; // cells up to 100px

type RasterSource = HTMLCanvasElement | HTMLImageElement;

function getSourceSize(source: RasterSource) {
  if (source instanceof HTMLImageElement) {
    return { w: source.naturalWidth, h: source.naturalHeight };
  }
  return { w: source.width, h: source.height };
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  source: RasterSource,
  destW: number,
  destH: number
) {
  const { w: srcW, h: srcH } = getSourceSize(source);
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

  ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, destW, destH);
}

const getDelayMs = (frame: any) => {
  // gifuct-js stores delay in hundredths of a second; 0 is common and should be treated as ~10.
  const delayCs = typeof frame?.delay === "number" ? frame.delay : 10;
  const ms = delayCs * 10;
  return Math.max(20, ms || 0);
};

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Decoded GIF playback (manual, so it never "freezes" when obscured)
  const gifFramesRef = useRef<any[]>([]);
  const gifFrameIndexRef = useRef(0);
  const gifNextFrameAtRef = useRef(0);
  const gifSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gifSourceCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gifPrevFrameRef = useRef<any | null>(null);
  const gifRestoreRef = useRef<ImageData | null>(null);

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

  const applyGifDisposal = (ctx: CanvasRenderingContext2D, prevFrame: any) => {
    if (!prevFrame) return;

    const disposal = prevFrame.disposalType;
    const dims = prevFrame.dims;

    if (disposal === 2 && dims) {
      // Restore to background: clear the previous frame's region
      ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
      return;
    }

    if (disposal === 3 && gifRestoreRef.current) {
      // Restore to previous
      ctx.putImageData(gifRestoreRef.current, 0, 0);
      return;
    }
  };

  const renderGifFrame = (frameIndex: number) => {
    const frames = gifFramesRef.current;
    const sourceCanvas = gifSourceCanvasRef.current;
    const sourceCtx = gifSourceCtxRef.current;
    if (!frames.length || !sourceCanvas || !sourceCtx) return;

    // Apply disposal of previous frame before drawing the next one
    applyGifDisposal(sourceCtx, gifPrevFrameRef.current);

    const frame = frames[frameIndex];
    if (!frame?.dims || !frame?.patch) return;

    // If current frame wants "restore to previous", snapshot the full canvas before drawing it
    if (frame.disposalType === 3) {
      gifRestoreRef.current = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    } else {
      gifRestoreRef.current = null;
    }

    const { width, height, left, top } = frame.dims;
    const imageData = sourceCtx.createImageData(width, height);
    imageData.data.set(frame.patch);
    sourceCtx.putImageData(imageData, left, top);

    gifPrevFrameRef.current = frame;
  };

  const tickGif = (now: number) => {
    const frames = gifFramesRef.current;
    if (!frames.length || !gifSourceCanvasRef.current || !gifSourceCtxRef.current) return;

    if (now < gifNextFrameAtRef.current) return;

    const currentIndex = gifFrameIndexRef.current;
    const nextIndex = (currentIndex + 1) % frames.length;

    renderGifFrame(nextIndex);
    gifFrameIndexRef.current = nextIndex;
    gifNextFrameAtRef.current = now + getDelayMs(frames[nextIndex]);
  };

  const pixelate = (pixelSize: number) => {
    const canvas = pixelCanvasRef.current;
    const sourceCanvas = gifSourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear (in CSS-pixel coordinate space)
    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    // No pixelation
    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      drawImageCover(ctx, sourceCanvas, DISPLAY_WIDTH, DISPLAY_HEIGHT);
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
    drawImageCover(tempCtx, sourceCanvas, scaledW, scaledH);

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

  // Decode GIF into frames once, then we control playback ourselves.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(notableSmallGif);
        const buf = await res.arrayBuffer();
        if (cancelled) return;

        const gif = parseGIF(buf);
        const frames = decompressFrames(gif, true);

        const w = gif?.lsd?.width;
        const h = gif?.lsd?.height;
        if (!w || !h || !frames?.length) return;

        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = w;
        sourceCanvas.height = h;
        const sourceCtx = sourceCanvas.getContext("2d");
        if (!sourceCtx) return;

        gifSourceCanvasRef.current = sourceCanvas;
        gifSourceCtxRef.current = sourceCtx;
        gifFramesRef.current = frames;

        // Render first frame and schedule next
        gifFrameIndexRef.current = 0;
        gifPrevFrameRef.current = null;
        gifRestoreRef.current = null;
        renderGifFrame(0);
        gifNextFrameAtRef.current = performance.now() + getDelayMs(frames[0]);

        // Draw immediately once frames are ready
        updatePixelation();
      } catch (e) {
        // If decode fails, we just won't render (better than a broken frozen frame).
        console.error("Failed to decode notable-small.gif", e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation loop: advance GIF frames + redraw pixelation.
  useEffect(() => {
    const animate = (now: number) => {
      tickGif(now);
      updatePixelation();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

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
  );
};

export default NotableProjectsPixelation;

