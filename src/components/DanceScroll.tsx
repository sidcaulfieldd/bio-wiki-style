import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Frames + video live in /public/dance/
//   /dance/frame_000.png ... /dance/frame_012.png  (13 frames, 3-digit padding)
//   /dance/dance-vid.mp4
const CONFIG = {
  frameFolder: "/dance",
  frameCount: 13,
  framePrefix: "frame_",
  frameDigits: 3,
  frameExt: "png",
  videoSrc: "/dance/dance-vid.mp4",

  scrubSmoothness: 0.1,
  // How many viewport-heights of scroll the whole pin (gif-scrub + video) takes up.
  pinSpacerMultiplier: 2.5,
  // Fraction of the pin's scroll distance spent scrubbing through the gif
  // frames before the video takes over (0.4 = first 40%).
  gifScrubRate: 0.4,
};

export default function DanceScroll() {
  const pinRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const muteOverlayRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const unmuteHandlerRef = useRef<() => void>(() => {});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const box = boxRef.current!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;
    const muteOverlay = muteOverlayRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;
    let userUnmuted = false;
    let inVideoPhase = false;
    let cachedCw = 0;
    let cachedCh = 0;

    const state = { frameIndex: 0 };

    function padNumber(n: number, digits: number) {
      return String(n).padStart(digits, "0");
    }

    function frameUrl(index: number) {
      return `${CONFIG.frameFolder}/${CONFIG.framePrefix}${padNumber(index, CONFIG.frameDigits)}.${CONFIG.frameExt}`;
    }

    function computeBox(cw: number, ch: number, naturalW: number, naturalH: number) {
      const scale = Math.max(cw / naturalW, ch / naturalH);
      const drawW = naturalW * scale;
      const drawH = naturalH * scale;
      return { drawW, drawH, offsetX: (cw - drawW) / 2, offsetY: (ch - drawH) / 2 };
    }

    function resizeCanvas() {
      const rect = box.getBoundingClientRect();
      cachedCw = rect.width;
      cachedCh = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cachedCw * dpr);
      canvas.height = Math.round(cachedCh * dpr);
      canvas.style.width = cachedCw + "px";
      canvas.style.height = cachedCh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCurrentFrame();
    }

    function preloadFrames() {
      return new Promise<void>((resolve) => {
        let settled = 0;
        for (let i = 0; i < CONFIG.frameCount; i++) {
          const img = new Image();
          img.decoding = "async";
          const onDone = () => {
            settled++;
            framesLoaded = settled;
            if (loaderTextRef.current) {
              const pct = Math.round((framesLoaded / CONFIG.frameCount) * 100);
              loaderTextRef.current.textContent = `LOADING… ${pct}%`;
            }
            if (settled >= CONFIG.frameCount) resolve();
          };
          img.onload = onDone;
          img.onerror = onDone;
          img.src = frameUrl(i);
          frames[i] = img;
        }
      });
    }

    function preloadVideo() {
      return new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        // If the video never fires loadeddata/error (seen on some mobile
        // browsers/network conditions with large video files), don't let
        // it block ScrollTrigger init forever — fall back after a timeout.
        const timeout = setTimeout(() => resolve(), 4000);
        video.addEventListener(
          "loadeddata",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );
        video.addEventListener(
          "error",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );
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
      if (!cachedCw || !cachedCh) return;
      ctx.clearRect(0, 0, cachedCw, cachedCh);
      const idx = Math.min(CONFIG.frameCount - 1, Math.max(0, Math.round(state.frameIndex)));
      const img = frames[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const { drawW, drawH, offsetX, offsetY } = computeBox(cachedCw, cachedCh, img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offsetX, offsetY, drawW, drawH);
    }

    function showMuteOverlay() {
      if (!userUnmuted) muteOverlay.style.display = "flex";
    }
    function hideMuteOverlay() {
      muteOverlay.style.display = "none";
    }
    function onUnmuteClick() {
      userUnmuted = true;
      video.muted = false;
      hideMuteOverlay();
    }
    unmuteHandlerRef.current = onUnmuteClick;

    function enterVideoPhase() {
      if (inVideoPhase) return;
      inVideoPhase = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      if (!userUnmuted) video.muted = true;
      video.play().catch(() => {});
      showMuteOverlay();
    }

    function exitVideoPhase() {
      if (!inVideoPhase) return;
      inVideoPhase = false;
      videoWrap.style.opacity = "0";
      videoWrap.style.pointerEvents = "none";
      canvas.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
      hideMuteOverlay();
    }

    let prevProgress = 0;
    let gifVirtualProgress = 0;
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
          const progress = self.progress;
          const delta = progress - prevProgress;

          if (!inVideoPhase) {
            gifVirtualProgress = Math.max(0, Math.min(1, gifVirtualProgress + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            drawCurrentFrame();

            if (gifVirtualProgress >= 1 && delta > 0) {
              enterVideoPhase();
            }
          } else if (delta < 0) {
            exitVideoPhase();
            gifVirtualProgress = Math.max(0, Math.min(1, 1 + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            drawCurrentFrame();
          }

          prevProgress = progress;
        },
        onRefresh: () => drawCurrentFrame(),
      });
    }

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(resizeCanvas, 200);
    };
    window.addEventListener("resize", onResize);

    resizeCanvas();
    drawCurrentFrame();

    Promise.all([preloadFrames(), preloadVideo()]).then(() => {
      resizeCanvas();
      hideLoader();
      initScrollTrigger();
      // Other async-loading content on the page (e.g. the Mons Monday gif)
      // can still shift page height after this point, which would leave
      // ScrollTrigger's cached start/end positions stale. Force a recheck
      // once everything has actually settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    const onWindowLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onWindowLoad);
    // In case "load" already fired before this effect ran.
    if (document.readyState === "complete") onWindowLoad();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onWindowLoad);
      st?.kill();
    };
  }, []);

  return (
    <div
      ref={pinRef}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <div
        ref={boxRef}
        style={{
          position: "relative",
          width: 270,
          height: 480,
          overflow: "hidden",
          background: "transparent",
        }}
      >
        <div
          ref={videoWrapRef}
          style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", zIndex: 10 }}
        >
          <video
            ref={videoRef}
            src={CONFIG.videoSrc}
            playsInline
            preload="auto"
            muted
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          ref={muteOverlayRef}
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            zIndex: 20,
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onClick={() => unmuteHandlerRef.current()}
          >
            UNMUTE
          </div>
        </div>

        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />

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
            zIndex: 40,
          }}
        >
          <div
            ref={loaderTextRef}
            style={{
              fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
              background: "#ffffff",
              color: "#000000",
              border: "3px solid #000000",
              borderRadius: "999px",
              padding: "12px 28px",
              fontWeight: 800,
              fontSize: 16,
              boxShadow: "0 4px 0 0 #000000",
            }}
          >
            LOADING… 0%
          </div>
        </div>
      </div>
    </div>
  );
}