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
  const muteTitleRef = useRef<HTMLDivElement>(null);
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

      gifScrubRate: 0.4 // how much scroll (as a fraction of the whole pin) it takes to traverse the entire gif — used as a rate, not a fixed boundary
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const stage = stageRef.current!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;
    const muteOverlay = muteOverlayRef.current!;
    const muteTitle = muteTitleRef.current!;
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
      // Fixed full-screen "cover" size — fills the entire viewport
      // (cropping overflow), constant from the very first frame. No growth,
      // no shrink-to-a-fraction — same fixed size for both the gif and the
      // video, on both desktop and mobile.
      const scale = Math.max(cw / naturalW, ch / naturalH);
      const drawW = naturalW * scale;
      const drawH = naturalH * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;
      return { drawW, drawH, offsetX, offsetY };
    }

    // Cached stage size — updated ONLY on real resize/orientation events,
    // never read fresh mid-scroll. iOS Safari's address bar collapses and
    // expands as you scroll, which transiently changes the real viewport
    // height; recalculating size from getBoundingClientRect() on every
    // single frame update picks up that fluctuation and makes the frame
    // visibly resize while scrolling, looking exactly like unwanted growth.
    let cachedCw = 0;
    let cachedCh = 0;

    function positionVideoBox() {
      const cw = cachedCw;
      const ch = cachedCh;
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
      // iOS Safari's 100vh includes space behind the collapsible address
      // bar and can misreport the real visible height at certain scroll
      // moments — setting an explicit pixel height from window.innerHeight
      // is more reliable than trusting the CSS value alone.
      const vh = `${window.innerHeight}px`;
      pinTarget.style.height = vh;
      stage.style.height = vh;

      const rect = stage.getBoundingClientRect();
      cachedCw = rect.width;
      cachedCh = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cachedCw * dpr);
      canvas.height = Math.round(cachedCh * dpr);
      canvas.style.width = cachedCw + "px";
      canvas.style.height = cachedCh + "px";
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
      const cw = cachedCw;
      const ch = cachedCh;
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
      resizeCanvas();
      // Retry sizing across the next several frames — on some mobile
      // browsers the container's layout isn't fully settled at the exact
      // instant we enter, so the first attempt can silently cache a 0x0
      // box and leave the video stuck at its tiny placeholder size even
      // though it's genuinely playing (audible but invisible). Calling
      // resizeCanvas() (not just positionVideoBox()) each retry is what
      // actually re-measures the real layout instead of reusing the same
      // stale cached value.
      let retries = 10;
      function retryPositioning() {
        resizeCanvas();
        retries--;
        if (retries > 0) requestAnimationFrame(retryPositioning);
      }
      requestAnimationFrame(retryPositioning);
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
    let gifVirtualProgress = 0; // single source of truth for gif frame — moves forward/backward symmetrically with scroll, in both directions

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
          const progress = self.progress;
          const delta = progress - prevProgress;

          if (!inVideoPhase) {
            // Gif is visible — accumulate the same way whether scrolling
            // forward or backward, so reversing is a perfect mirror of
            // playing forward, not a separate formula that can disagree
            // with this one at some boundary.
            gifVirtualProgress = Math.max(0, Math.min(1, gifVirtualProgress + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            state.gapProgress = 1 - gifVirtualProgress;
            drawCurrentFrame();

            if (gifVirtualProgress >= 1 && delta > 0) {
              // Fully assembled and still pushing forward — hand off to video.
              enterVideoPhase();
              startPlayingForward();
            }
          } else if (delta < 0) {
            // Scrolling up while in the video — instant revert to the last
            // gif frame, then immediately keep applying this same tick's
            // movement so it starts decreasing right away, no held frame.
            exitVideoPhase();
            gifVirtualProgress = Math.max(0, Math.min(1, 1 + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            state.gapProgress = 1 - gifVirtualProgress;
            drawCurrentFrame();
          }
          // else: in video phase, scrolling down (or still) — forward
          // scroll is blocked by onWheel/onTouchMove anyway; video just
          // keeps playing on its own.

          prevProgress = progress;
        },
        onRefresh: () => drawCurrentFrame()
      });
    }

    // Debounced — iOS can fire visualViewport 'resize' repeatedly with
    // intermediate values WHILE the address bar is still mid-animation
    // (not just once at the end), and reacting to every single one causes
    // visible resizing throughout the scroll gesture itself. Waiting for
    // the events to actually stop before applying anything means only the
    // final, settled size ever gets used.
    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        resizeCanvas();
        applyResponsiveTitle();
      }, 200);
    };

    // Mobile-only: allow the title to wrap onto multiple centered lines
    // instead of overflowing off-screen. Desktop is untouched — this only
    // kicks in below the breakpoint, so the wide-screen layout stays
    // pixel-identical to before.
    function applyResponsiveTitle() {
      const isMobile = window.innerWidth <= 600;
      muteTitle.style.whiteSpace = isMobile ? "normal" : "nowrap";
      muteTitle.style.width = isMobile ? "92vw" : "80vw";
    }
    window.addEventListener("resize", onResize);
    // Deliberately NOT listening to visualViewport 'resize' — on iOS that
    // fires repeatedly with intermediate values WHILE the address bar is
    // still mid-collapse during scroll, and reacting to those is exactly
    // what caused the visible "growing" effect. Measuring size once at
    // mount and only re-measuring on a genuine window resize (e.g. device
    // rotation) keeps it perfectly stable through every scroll gesture.

    function onLoadedMetadata() {
      videoDuration = video.duration || 0;
      positionVideoBox();
    }
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", positionVideoBox);
    video.addEventListener("canplay", positionVideoBox);

    resizeCanvas();
    applyResponsiveTitle();
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
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
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
            ref={muteTitleRef}
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
