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
  const overlayStageRef = useRef<HTMLDivElement>(null);
  const gifPinRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPinRef = useRef<HTMLDivElement>(null);
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
      gifScrollMultiplier: 1.5,
      videoScrollMultiplier: 2.5,
      targetHeightFraction: 0.8,

      stripCount: 10,
      maxGap: 90
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const gifPin = gifPinRef.current!;
    const videoPin = videoPinRef.current!;
    const overlayStage = overlayStageRef.current!;
    const video = videoRef.current!;
    const muteOverlay = muteOverlayRef.current!;
    const unmuteLink = unmuteLinkRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;
    let videoDuration = 0;
    let userUnmuted = false;

    const state = { frameIndex: 0, gapProgress: 1 };

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
      const rect = overlayStage.getBoundingClientRect();
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
      const rect = overlayStage.getBoundingClientRect();
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
      const rect = overlayStage.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      if (!cw || !ch) return;

      ctx.clearRect(0, 0, cw, ch);

      const idx = Math.min(CONFIG.frameCount - 1, Math.max(0, Math.round(state.frameIndex)));
      const img = frames[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const { drawW, drawH, offsetX, offsetY } = computeBox(cw, ch, img.naturalWidth, img.naturalHeight);

      // Strip-splitting effect: slice the frame into horizontal strips with
      // a gap that closes linearly as scroll progresses through the gif,
      // fully joined (gap=0) by the last frame.
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

    function showCanvas() {
      canvas.style.opacity = "1";
      video.style.opacity = "0";
    }

    function showVideo() {
      canvas.style.opacity = "0";
      video.style.opacity = "1";
    }

    let videoMode: "playing" | "rewinding" = "playing";
    let prevVideoProgress = 0;
    let targetVideoTime = 0;
    let rewindRAF: number | null = null;
    const REWIND_EASE = 0.25;

    function stopRewindLoop() {
      if (rewindRAF !== null) {
        cancelAnimationFrame(rewindRAF);
        rewindRAF = null;
      }
    }

    function rewindLoopStep() {
      const diff = targetVideoTime - video.currentTime;
      if (Math.abs(diff) < 0.01) {
        video.currentTime = targetVideoTime;
        rewindRAF = null;
        return;
      }
      video.currentTime += diff * REWIND_EASE;
      rewindRAF = requestAnimationFrame(rewindLoopStep);
    }

    function startPlayingForward() {
      videoMode = "playing";
      stopRewindLoop();
      showVideo();
      if (!userUnmuted) video.muted = true;
      video.play().catch(() => {});
    }

    function rewindBy(deltaFraction: number) {
      if (!videoDuration) return;
      if (videoMode !== "rewinding") {
        targetVideoTime = video.currentTime;
      }
      videoMode = "rewinding";
      video.pause();
      const dt = deltaFraction * videoDuration;
      targetVideoTime = Math.max(0, Math.min(videoDuration, targetVideoTime - dt));
      if (rewindRAF === null) {
        rewindRAF = requestAnimationFrame(rewindLoopStep);
      }
    }

    let bouncingBack = false;

    function resetVideo() {
      stopRewindLoop();
      targetVideoTime = 0;
      video.pause();
      video.currentTime = 0;
      showCanvas();
    }

    function onWheel(e: WheelEvent) {
      if (videoST?.isActive && e.deltaY > 0) {
        e.preventDefault();
      }
    }
    let touchStartY = 0;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (!videoST?.isActive) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (dy > 0) {
        e.preventDefault();
      }
    }
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    let gifST: ScrollTrigger | null = null;
    let videoST: ScrollTrigger | null = null;

    function initScrollTriggers() {
      gifST = ScrollTrigger.create({
        trigger: gifPin,
        start: "top top",
        end: () => `+=${window.innerHeight * CONFIG.gifScrollMultiplier}`,
        pin: true,
        anticipatePin: 1,
        scrub: CONFIG.scrubSmoothness,
        onUpdate: (self) => {
          state.frameIndex = self.progress * (CONFIG.frameCount - 1);
          state.gapProgress = 1 - self.progress;
          drawCurrentFrame();
        }
      });

      videoST = ScrollTrigger.create({
        trigger: videoPin,
        start: "top top",
        end: () => `+=${window.innerHeight * CONFIG.videoScrollMultiplier}`,
        pin: true,
        scrub: CONFIG.scrubSmoothness,
        onEnter: () => {
          positionVideoBox();
          startPlayingForward();
        },
        onEnterBack: () => {
          positionVideoBox();
          startPlayingForward();
        },
        onLeaveBack: (self) => {
          if (targetVideoTime > 0.05) {
            bouncingBack = true;
            self.scroll(self.start);
            prevVideoProgress = 0;
            bouncingBack = false;
            return;
          }
          resetVideo();
        },
        onUpdate: (self) => {
          if (bouncingBack) return;
          const progress = self.progress;
          const scrollingUp = progress < prevVideoProgress;
          if (scrollingUp) {
            rewindBy(prevVideoProgress - progress);
          } else if (videoMode === "rewinding") {
            startPlayingForward();
          }
          prevVideoProgress = progress;
        }
      });

      ScrollTrigger.refresh();
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
    showCanvas();
    showMuteOverlay();

    preloadFrames().then(() => {
      resizeCanvas();
      hideLoader();
      initScrollTriggers();
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
      gifST?.kill();
      videoST?.kill();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        ref={muteOverlayRef}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 50,
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
          SID, YOU'RE ON MUTE
        </div>

        <div
          style={{
            ...sfPro,
            position: "absolute",
            top: "calc(10vh + 4.5em)",
            left: "75vw",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            pointerEvents: "none",
            color: "#000",
            whiteSpace: "nowrap"
          }}
        >
          <span>press</span>
          <span
            ref={unmuteLinkRef}
            style={{ textDecoration: "underline", cursor: "pointer", pointerEvents: "auto" }}
          >
            unmute
          </span>
        </div>
      </div>

      <div
        ref={overlayStageRef}
        style={{
          position: "fixed",
          inset: 0,
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
            pointerEvents: "none"
          }}
        />
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
        ref={loaderRef}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          transition: "opacity 0.4s ease",
          zIndex: 60
        }}
      >
        <div
          ref={loaderTextRef}
          style={{ fontSize: 13, letterSpacing: "0.04em", color: "#666" }}
        >
          Loading… 0%
        </div>
      </div>

      <div ref={gifPinRef} style={{ position: "relative", width: "100%", height: "100vh" }} />
      <div ref={videoPinRef} style={{ position: "relative", width: "100%", height: "100vh" }} />
    </div>
  );
}
