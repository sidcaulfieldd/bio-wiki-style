import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

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
  const muteOverlayRef = useRef<HTMLDivElement>(null);
  const unmuteLinkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const CONFIG = {
      frameFolder: "/part2",
      frameCount: 61,
      framePrefix: "frame_",
      frameDigits: 4,
      frameExt: "png",

      scrubSmoothness: 0.1,
      pinSpacerMultiplier: 3,
      targetHeightFraction: 0.8,

      gifPhaseFraction: 0.4
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const stage = stageRef.current!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;
    const muteOverlay = muteOverlayRef.current!;
    const unmuteLink = unmuteLinkRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;
    let videoDuration = 0;
    let userUnmuted = false;

    const state = { frameIndex: 0, gapProgress: 1 };
    let inVideoPhase = false;

    function padNumber(n: number, digits: number) {
      return String(n).padStart(digits, "0");
    }

    function frameUrl(index: number) {
      return `${CONFIG.frameFolder}/${CONFIG.framePrefix}${padNumber(index, CONFIG.frameDigits)}.${CONFIG.frameExt}`;
    }

    function computeBox(cw: number, ch: number, naturalW: number, naturalH: number) {
      const scale = (ch * CONFIG.targetHeightFraction) / naturalH;
      const drawW = naturalW * scale;
      const drawH = naturalH * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;
      return { drawW, drawH, offsetX, offsetY };
    }

    function positionVideoBox() {
      const rect = stage.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const naturalW = video.videoWidth || 1920;
      const naturalH = video.videoHeight || 960;
      if (!cw || !ch) return;

      const { drawW, drawH, offsetX, offsetY } = computeBox(cw, ch, naturalW, naturalH);
      video.style.width = `${drawW}px`;
      video.style.height = `${drawH}px`;
      video.style.left = `${offsetX}px`;
      video.style.top = `${offsetY}px`;
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
      positionVideoBox();
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

      const { drawW, drawH, offsetX, offsetY } = computeBox(cw, ch, img.naturalWidth, img.naturalHeight);

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offsetX, offsetY, drawW, drawH);
    }

    function showMuteOverlay() {
      if (!userUnmuted) {
        muteOverlay.style.display = "block";
      }
    }

    function hideMuteOverlay() {
      muteOverlay.style.display = "none";
    }

    function onUnmuteClick() {
      userUnmuted = true;
      video.muted = false;
      hideMuteOverlay();
    }
    unmuteLink.addEventListener("click", onUnmuteClick);

    function enterVideoPhase() {
      if (inVideoPhase) return;
      inVideoPhase = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      positionVideoBox();
      if (!userUnmuted) {
        video.muted = true;
      }
    }

    function exitVideoPhase() {
      if (!inVideoPhase) return;
      inVideoPhase = false;
      videoWrap.style.opacity = "0";
      videoWrap.style.pointerEvents = "none";
      canvas.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
    }

    let prevProgress = 0;
    let revertedAboveSplit = false;
    let revertStartProgress = 0;

    function startPlayingForward() {
      video.play().catch(() => {});
    }

    function onWheel(e: WheelEvent) {
      if (inVideoPhase && e.deltaY > 0) {
        e.preventDefault();
      }
    }
    let touchStartY = 0;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (!inVideoPhase) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (dy > 0) {
        e.preventDefault();
      }
    }
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

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
          const split = CONFIG.gifPhaseFraction;
          const progress = self.progress;
          const scrollingUp = progress < prevProgress;

          if (progress <= split) {
            // Fully back in the gif's own natural range — clear the revert
            // flag so a future forward scroll can re-enter the video normally.
            revertedAboveSplit = false;
            exitVideoPhase();
            const gifProgress = progress / split;
            state.frameIndex = gifProgress * (CONFIG.frameCount - 1);
            state.gapProgress = 1 - gifProgress;
            drawCurrentFrame();
          } else if (inVideoPhase && scrollingUp) {
            // Instant revert — snap to the last gif frame and remember
            // exactly where this happened. Using THIS point as a fresh
            // reference (rather than the original progress/split formula,
            // which stays clamped at 1 for any progress still above split)
            // is what makes the frame start decreasing immediately on the
            // very next scroll tick instead of "holding" until progress
            // drops all the way down to the original boundary.
            revertedAboveSplit = true;
            revertStartProgress = progress;
            exitVideoPhase();
            state.frameIndex = CONFIG.frameCount - 1;
            state.gapProgress = 0;
            drawCurrentFrame();
          } else if (revertedAboveSplit) {
            if (scrollingUp) {
              // Immediate, linear continuation from the revert point —
              // same per-scroll-unit rate as normal gif scrubbing, just
              // measured from where the revert happened instead of from
              // the original split boundary.
              const gifProgress = Math.max(0, Math.min(1, 1 - (revertStartProgress - progress) / split));
              state.frameIndex = gifProgress * (CONFIG.frameCount - 1);
              state.gapProgress = 1 - gifProgress;
              drawCurrentFrame();
            } else {
              // Genuinely reversed direction back to scrolling down —
              // allow re-entry into the video.
              revertedAboveSplit = false;
              enterVideoPhase();
              startPlayingForward();
            }
          } else {
            const justEntered = !inVideoPhase;
            enterVideoPhase();
            if (justEntered) {
              startPlayingForward();
            }
          }

          prevProgress = progress;
        },
        onRefresh: () => drawCurrentFrame()
      });
    }

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    function onLoadedMetadata() {
      videoDuration = video.duration || 0;
      positionVideoBox();
    }
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", positionVideoBox);
    video.addEventListener("canplay", positionVideoBox);

    resizeCanvas();
    drawCurrentFrame();
    showMuteOverlay();

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
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", positionVideoBox);
      video.removeEventListener("canplay", positionVideoBox);
      unmuteLink.removeEventListener("click", onUnmuteClick);
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
          ref={videoWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <video
            ref={videoRef}
            src="/part2/scratch-video.mp4"
            playsInline
            preload="auto"
            muted
            style={{
              position: "absolute",
              width: "1px",
              height: "1px"
            }}
          />
        </div>

        <div
          ref={muteOverlayRef}
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none"
          }}
        >
          <div
            style={{
              ...sfPro,
              position: "absolute",
              top: "10vh",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80vw",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#000",
              fontSize: "clamp(24px, 5vw, 56px)",
              textAlign: "center",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              pointerEvents: "none"
            }}
          >
            SID, YOU'RE ON MUTE. PRESS{" "}
            <span
              ref={unmuteLinkRef}
              style={{ textDecoration: "underline", cursor: "pointer", pointerEvents: "auto" }}
            >
              UNMUTE
            </span>
            .
          </div>
        </div>

        <div
          ref={stageRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100vh",
            transform: "translate(-50%, -50%)",
            zIndex: 30,
            pointerEvents: "none"
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
              pointerEvents: "none",
              opacity: 1
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
            zIndex: 40
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
