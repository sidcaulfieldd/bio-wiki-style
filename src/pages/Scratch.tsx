import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Standalone scratch page.
// No links, nav, or references to any other page on the site.
export default function Scratch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const CONFIG = {
      frameFolder: "", // frames sit directly in /public, served at site root
      frameCount: 100,
      framePrefix: "frame_",
      frameDigits: 4,
      frameExt: "jpg",

      stripCount: 10,
      maxGap: 90,           // desired gap; auto-clamped so it always fits vertically
      scrubSmoothness: 0.1,
      pinSpacerMultiplier: 1.5,
      portraitScale: 0.33
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const stage = stageRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;

    const state = { frameIndex: 0, gapProgress: 1 };

    function padNumber(n: number, digits: number) {
      return String(n).padStart(digits, "0");
    }

    function frameUrl(index: number) {
      // frameFolder is "", so this resolves to "/frame_0001.jpg" etc. — root of /public
      return `${CONFIG.frameFolder}/${CONFIG.framePrefix}${padNumber(index, CONFIG.frameDigits)}.${CONFIG.frameExt}`;
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = stage.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCurrentFrame();
    }

    function preloadFrames() {
      return new Promise<void>((resolve) => {
        let settled = 0;
        for (let i = 1; i <= CONFIG.frameCount; i++) {
          const img = new Image();
          img.decoding = "async";
          const onDone = () => {
            settled++;
            framesLoaded = settled;
            if (loaderTextRef.current) {
              const pct = Math.round((framesLoaded / CONFIG.frameCount) * 100);
              loaderTextRef.current.textContent = `Loading… ${pct}%`;
            }
            if (settled >= CONFIG.frameCount) resolve();
          };
          img.onload = onDone;
          img.onerror = onDone;
          img.src = frameUrl(i);
          frames[i - 1] = img;
        }
      });
    }

    function hideLoader() {
      if (loaderRef.current) {
        loaderRef.current.style.opacity = "0";
        setTimeout(() => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
        }, 400);
      }
    }

    function drawCurrentFrame() {
      const rect = stage.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      if (!cw || !ch) return;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);

      const idx = Math.min(CONFIG.frameCount - 1, Math.max(0, Math.round(state.frameIndex)));
      const img = frames[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      let baseW, baseH;
      if (imgRatio > canvasRatio) {
        baseW = cw;
        baseH = cw / imgRatio;
      } else {
        baseH = ch;
        baseW = ch * imgRatio;
      }

      const drawW = baseW * CONFIG.portraitScale;
      const drawH = baseH * CONFIG.portraitScale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;

      const strips = CONFIG.stripCount;
      const srcStripH = img.naturalHeight / strips;
      const dstStripH = drawH / strips;

      // Desired gap, scaled to the portrait's own height.
      const desiredGap = CONFIG.maxGap * (drawH / 900) * state.gapProgress;

      // Hard clamp: total spread (drawH + totalGap) must never exceed the
      // stage height, so the most-elongated (initial) frame always fits
      // fully within the viewport, however the config is tuned.
      const maxAvailableGap = strips > 1 ? Math.max(0, (ch - drawH) / (strips - 1)) : 0;
      const gapPx = Math.min(desiredGap, maxAvailableGap);

      const totalGap = gapPx * (strips - 1);
      const stackStartY = offsetY - totalGap / 2;

      for (let s = 0; s < strips; s++) {
        const srcY = s * srcStripH;
        const dstY = stackStartY + s * (dstStripH + gapPx);
        ctx.drawImage(img, 0, srcY, img.naturalWidth, srcStripH, offsetX, dstY, drawW, dstStripH);
      }
    }

    let st: ScrollTrigger | null = null;

    function initScrollTrigger() {
      st = ScrollTrigger.create({
        trigger: pinTarget,
        start: "top top",
        end: () => `+=${window.innerHeight * CONFIG.pinSpacerMultiplier}`,
        pin: true,
        anticipatePin: 1,
        scrub: CONFIG.scrubSmoothness,
        onUpdate: (self) => {
          state.frameIndex = self.progress * (CONFIG.frameCount - 1);
          state.gapProgress = 1 - self.progress;
          drawCurrentFrame();
        },
        onRefresh: () => drawCurrentFrame()
      });
    }

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    resizeCanvas();
    drawCurrentFrame();

    preloadFrames().then(() => {
      resizeCanvas();
      hideLoader();
      initScrollTrigger();
    });

    return () => {
      window.removeEventListener("resize", onResize);
      st?.kill();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        ref={pinRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "min(96vw, 177.78vh)",
            height: "min(54vw, 100vh)",
            transform: "translate(-50%, -50%)"
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "block",
              background: "#ffffff"
            }}
          />
        </div>

        <div
          ref={loaderRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            transition: "opacity 0.4s ease",
            zIndex: 5
          }}
        >
          <div
            ref={loaderTextRef}
            style={{ fontSize: 13, letterSpacing: "0.04em", color: "#666" }}
          >
            Loading… 0%
          </div>
        </div>
      </div>
    </div>
  );
}
