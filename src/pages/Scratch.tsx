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
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const CONFIG = {
      frameFolder: "/part2", // new frames + video live in their own subfolder to avoid colliding with the old set
      frameCount: 61,
      framePrefix: "frame_",
      frameDigits: 4,
      frameExt: "png",

      stripCount: 10,
      maxGap: 90,
      scrubSmoothness: 0.1,
      pinSpacerMultiplier: 1.5,
      targetHeightFraction: 0.8
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const stage = stageRef.current!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;

    const state = { frameIndex: 0, gapProgress: 1 };
    let inVideoMode = false;

    function padNumber(n: number, digits: number) {
      return String(n).padStart(digits, "0");
    }

    function frameUrl(index: number) {
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

      const idx = Math.min(CONFIG.frameCount - 1, Math.max(0, Math.round(state.frameIndex)));
      const img = frames[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      // Start small (targetHeightFraction of the page) and grow smoothly to
      // an exact "cover the whole page" size by the time scrolling finishes
      // — the same math CSS object-fit:cover uses for the video. Landing on
      // an identical scale/position means the hard cut to video is seamless.
      const sizeProgress = 1 - state.gapProgress; // 0 at start, 1 when fully assembled
      const scaleStart = (ch * CONFIG.targetHeightFraction) / img.naturalHeight;
      const scaleCover = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const scale = scaleStart + (scaleCover - scaleStart) * sizeProgress;

      const drawH = img.naturalHeight * scale;
      const drawW = img.naturalWidth * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;

      const strips = CONFIG.stripCount;
      const srcStripH = img.naturalHeight / strips;
      const dstStripH = drawH / strips;

      const desiredMaxGap = CONFIG.maxGap * (drawH / 900);
      const maxAvailableGap = strips > 1 ? Math.max(0, (ch - drawH) / (strips - 1)) : 0;
      const effectiveMaxGap = Math.min(desiredMaxGap, maxAvailableGap);
      const gapPx = effectiveMaxGap * state.gapProgress;

      const totalGap = gapPx * (strips - 1);
      const stackStartY = offsetY - totalGap / 2;

      for (let s = 0; s < strips; s++) {
        const srcY = s * srcStripH;
        const dstY = stackStartY + s * (dstStripH + gapPx);
        ctx.drawImage(img, 0, srcY, img.naturalWidth, srcStripH, offsetX, dstY, drawW, dstStripH);
      }
    }

    function enterVideoMode() {
      if (inVideoMode) return;
      inVideoMode = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      video.currentTime = 0;

      // The user has already interacted with the page (scrolling), so try
      // playing with sound first. Some browsers still block unmuted
      // autoplay regardless of prior interaction — fall back to muted
      // playback rather than showing nothing if that happens.
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {
          // Autoplay fully blocked; video will show its poster/first frame.
        });
      });
    }

    function exitVideoMode() {
      if (!inVideoMode) return;
      inVideoMode = false;
      videoWrap.style.opacity = "0";
      videoWrap.style.pointerEvents = "none";
      video.pause();
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

          if (self.progress >= 1) {
            enterVideoMode();
          } else {
            exitVideoMode();
            drawCurrentFrame();
          }
        },
        onRefresh: () => drawCurrentFrame()
      });
    }

    // Once fully assembled (video mode), block further downward scroll so the
    // page can't advance past this section. Scrolling up still works normally
    // and will naturally drop ScrollTrigger's progress below 1, which
    // reverses back into the strip animation via onUpdate above.
    function onWheel(e: WheelEvent) {
      if (inVideoMode && e.deltaY > 0) {
        e.preventDefault();
      }
    }

    // Best-effort touch equivalent: block upward finger drags (which scroll
    // the page down) while in video mode; allow downward drags (scroll up).
    let touchStartY = 0;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (!inVideoMode) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (dy > 0) {
        e.preventDefault();
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

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
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
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
            width: "100%",
            height: "100vh",
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
              display: "block"
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

        {/* Fullscreen video takeover — hidden until the strip animation
            fully assembles, then hard-cuts in at 100vw x 100vh. */}
        <div
          ref={videoWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10,
            background: "#000"
          }}
        >
          <video
            ref={videoRef}
            src="/part2/scratch-video.mp4"
            playsInline
            loop
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>
      </div>
    </div>
  );
}
