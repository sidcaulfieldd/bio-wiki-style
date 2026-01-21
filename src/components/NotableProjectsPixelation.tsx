import { useEffect, useRef } from "react";
import notableSmallGif from "@/assets/notable-small.gif";
import { decompressFrames, parseGIF } from "gifuct-js";

const DISPLAY_WIDTH = 270;
const DISPLAY_HEIGHT = 480;
const FOCUS_ZONE_PX = 100;
const MAX_PIXEL_SIZE = 100;

const NotableProjectsPixelation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // GIF state refs
  const gifFramesRef = useRef<any[]>([]);
  const gifSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gifSourceCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gifPrevFrameRef = useRef<any | null>(null);
  const gifRestoreRef = useRef<ImageData | null>(null);
  
  // Cache for pixelation
  const lastPixelSizeRef = useRef<number>(-1);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef<number>(1);

  // Simple playback state
  const gifFrameIndexRef = useRef(0);
  const gifIntervalRef = useRef<number | null>(null);

  const setupCanvasForDpr = () => {
    const canvas = pixelCanvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    canvas.width = Math.round(DISPLAY_WIDTH * dpr);
    canvas.height = Math.round(DISPLAY_HEIGHT * dpr);
    canvas.style.width = `${DISPLAY_WIDTH}px`;
    canvas.style.height = `${DISPLAY_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getPixelSize = () => {
    if (!containerRef.current) return 1;
    const rect = containerRef.current.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;
    const distance = Math.abs(elementCenter - screenCenter);

    if (distance <= FOCUS_ZONE_PX) return 1;
    
    const maxDistance = Math.max(window.innerHeight, FOCUS_ZONE_PX + 1);
    const normalized = Math.min((distance - FOCUS_ZONE_PX) / (maxDistance - FOCUS_ZONE_PX), 1);
    return 1 + normalized * (MAX_PIXEL_SIZE - 1);
  };

  const applyGifDisposal = (ctx: CanvasRenderingContext2D, prevFrame: any) => {
    if (!prevFrame) return;
    const disposal = prevFrame.disposalType;
    const dims = prevFrame.dims;

    if (disposal === 2 && dims) {
      ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (disposal === 3 && gifRestoreRef.current) {
      ctx.putImageData(gifRestoreRef.current, 0, 0);
    }
  };

  const renderGifFrame = (frameIndex: number) => {
    const frames = gifFramesRef.current;
    const sourceCanvas = gifSourceCanvasRef.current;
    const sourceCtx = gifSourceCtxRef.current;
    if (!frames.length || !sourceCanvas || !sourceCtx) return;

    applyGifDisposal(sourceCtx, gifPrevFrameRef.current);

    const frame = frames[frameIndex];
    if (!frame?.dims || !frame?.patch) return;

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

  const drawToCanvas = (pixelSize: number) => {
    const canvas = pixelCanvasRef.current;
    const sourceCanvas = gifSourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    const srcW = sourceCanvas.width;
    const srcH = sourceCanvas.height;
    const destW = DISPLAY_WIDTH;
    const destH = DISPLAY_HEIGHT;
    
    // Calculate cover crop
    const srcAspect = srcW / srcH;
    const destAspect = destW / destH;
    let sx = 0, sy = 0, sWidth = srcW, sHeight = srcH;
    
    if (srcAspect > destAspect) {
      sWidth = srcH * destAspect;
      sx = (srcW - sWidth) / 2;
    } else {
      sHeight = srcW / destAspect;
      sy = (srcH - sHeight) / 2;
    }

    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(sourceCanvas, sx, sy, sWidth, sHeight, 0, 0, destW, destH);
      return;
    }

    // Round pixel size for consistent grid
    const roundedPixelSize = Math.round(pixelSize);
    const scaledW = Math.max(1, Math.ceil(destW / roundedPixelSize));
    const scaledH = Math.max(1, Math.ceil(destH / roundedPixelSize));

    // Reuse temp canvas
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement("canvas");
    }
    const tempCanvas = tempCanvasRef.current;
    
    // Only resize if needed
    if (tempCanvas.width !== scaledW || tempCanvas.height !== scaledH) {
      tempCanvas.width = scaledW;
      tempCanvas.height = scaledH;
    }

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.drawImage(sourceCanvas, sx, sy, sWidth, sHeight, 0, 0, scaledW, scaledH);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, destW, destH);
  };

  const startGifPlayback = () => {
    if (gifIntervalRef.current) return;
    
    const frames = gifFramesRef.current;
    if (!frames.length) return;

    const playNextFrame = () => {
      const currentFrame = frames[gifFrameIndexRef.current];
      const delayMs = currentFrame?.delay ?? 50;

      gifFrameIndexRef.current = (gifFrameIndexRef.current + 1) % frames.length;
      renderGifFrame(gifFrameIndexRef.current);
      
      // Draw with current pixel size
      const pixelSize = getPixelSize();
      drawToCanvas(pixelSize);

      gifIntervalRef.current = window.setTimeout(playNextFrame, delayMs);
    };

    playNextFrame();
  };

  const stopGifPlayback = () => {
    if (gifIntervalRef.current) {
      clearTimeout(gifIntervalRef.current);
      gifIntervalRef.current = null;
    }
  };

  useEffect(() => {
    setupCanvasForDpr();
    const onResize = () => {
      setupCanvasForDpr();
      lastPixelSizeRef.current = -1;
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Decode GIF once
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

        // Debug: Log first few frames to see the structure
        console.log('GIF loaded:', frames.length, 'frames');
        console.log('First frame:', frames[0]);
        console.log('Frame delays:', frames.slice(0, 5).map(f => ({ delay: f.delay, delayMs: f.delay * 10 })));

        // Start on first frame
        renderGifFrame(0);
        drawToCanvas(getPixelSize());
        
        // Start playing immediately
        startGifPlayback();
      } catch (e) {
        console.error("Failed to decode notable-small.gif", e);
      }
    })();

    return () => { 
      cancelled = true;
      stopGifPlayback();
    };
  }, []);

  // Simple scroll-based animation loop
  useEffect(() => {
    const animate = () => {
      const pixelSize = getPixelSize();
      const pixelBucket = Math.max(1, Math.round(pixelSize));
      const pixelBucketChanged = pixelBucket !== lastPixelSizeRef.current;

      // Redraw when pixel size changes (GIF keeps playing regardless)
      if (pixelBucketChanged) {
        lastPixelSizeRef.current = pixelBucket;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopGifPlayback();
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
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
    </div>
  );
};

export default NotableProjectsPixelation;
