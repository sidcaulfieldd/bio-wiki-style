import { useEffect, useRef, useState } from "react";
import notableSmallGif from "@/assets/notable-small.gif";

const NotableProjectsPixelation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 0 = full res, 1 = max pixelated
  const [pixelation, setPixelation] = useState(1);
  const pixelationRef = useRef(1);

  const [imageLoaded, setImageLoaded] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const requestRunningRef = useRef(false);

  // Fixed 9:16 display size (DO NOT CHANGE)
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
      console.error("Failed to load notable-small.gif");
      setImageLoaded(true);
    };

    img.src = notableSmallGif;
  }, []);

  // Scroll handler (rAF-wrapped) -> updates pixelationRef
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

        // Full resolution within ±100px of viewport center
        const buffer = 100;

        // Normalise out to the edges of the screen (keeps the "never change size" feel)
        const maxDistance = windowHeight / 2 + rect.height / 2;

        const effectiveDistance = Math.max(0, distanceFromCenter - buffer);
        const normalizedDistance = Math.min(
          effectiveDistance / Math.max(1, maxDistance - buffer),
          1
        );

        pixelationRef.current = normalizedDistance;
        setPixelation(normalizedDistance);
        requestRunningRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation loop for GIF (runs continuously; reads pixelationRef so it never "breaks" on scroll)
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
  }, [imageLoaded]);

  const drawPixelated = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Cell size: 1px (full res) to 200px (max pixelated)
    const maxCellSize = 200;
    const minCellSize = 1;
    const cellSize =
      minCellSize + (maxCellSize - minCellSize) * pixelationRef.current;

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback gradient if image doesn't load
      const gradient = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(0.5, "#764ba2");
      gradient.addColorStop(1, "#f093fb");
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

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sx = (x / cols) * imgW;
        const sy = (y / rows) * imgH;
        const sw = imgW / cols;
        const sh = imgH / rows;

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
        height: `${displayHeight}px`,
      }}
    >
      <canvas
        ref={canvasRef}
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
