import { useEffect, useRef, type RefObject } from "react";

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

  // How many px of wheel/touch input it takes to scrub through all the
  // frames once the cursor is over the box.
  scrubDistancePx: 900,

  // Hidden Spotify track played (audio only) once the person hits UNMUTE.
  spotifyTrackId: "5kDLJIAApnLKgdiTdAsd6P",

  // How long a gap in forward-scroll input has to be, once the video
  // starts, before the buffered gesture is considered "finished" and the
  // next scroll is allowed to move the page. A single physical wheel/
  // trackpad swipe fires many small events in a burst, so this swallows
  // the whole burst rather than just its first event.
  bufferGestureGapMs: 150,
};

export default function DanceScroll({ cardRef }: { cardRef: RefObject<HTMLElement> }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const muteOverlayRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const spotifyContainerRef = useRef<HTMLDivElement>(null);
  const unmuteHandlerRef = useRef<() => void>(() => {});

  useEffect(() => {
    const box = boxRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;
    const muteOverlay = muteOverlayRef.current!;
    const spotifyContainer = spotifyContainerRef.current!;

    const frames: HTMLImageElement[] = [];
    let framesLoaded = 0;
    let userUnmuted = false;
    let inVideoPhase = false;
    let cachedCw = 0;
    let cachedCh = 0;
    let scrubProgress = 0; // 0 to 1, driven by wheel/touch input while cursor is over box
    let assetsReady = false;

    // True right after the video starts, until forward-scroll input has
    // gone quiet for bufferGestureGapMs — swallows exactly one scroll
    // gesture so the page can't jump the instant the video begins.
    let awaitingBufferScroll = false;
    let bufferGestureTimer: ReturnType<typeof setTimeout> | null = null;

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

    // Spotify IFrame Embed API
    let spotifyController: { play: () => void; pause: () => void; addListener?: (event: string, cb: (e: any) => void) => void } | null = null;
    let spotifyHasStartedPlaying = false;
    function onSpotifyPlaybackUpdate(e: any) {
      const { isPaused, position } = e?.data ?? {};
      if (!isPaused && position > 0) {
        spotifyHasStartedPlaying = true;
        return;
      }
      if (spotifyHasStartedPlaying && isPaused && position === 0) {
        spotifyHasStartedPlaying = false;
        if (inVideoPhase) {
          userUnmuted = false;
          muteOverlay.style.display = "flex";
        }
      }
    }
    function setUpSpotify() {
      const w = window as any;
      const createController = (IFrameAPI: any) => {
        IFrameAPI.createController(
          spotifyContainer,
          { uri: `spotify:track:${CONFIG.spotifyTrackId}` },
          (EmbedController: any) => {
            spotifyController = EmbedController;
            EmbedController.addListener?.("playback_update", onSpotifyPlaybackUpdate);
          }
        );
      };
      if (w.Spotify?.Player || w.__spotifyIframeAPI) {
        if (w.__spotifyIframeAPI) createController(w.__spotifyIframeAPI);
        return;
      }
      const prevReady = w.onSpotifyIframeApiReady;
      w.onSpotifyIframeApiReady = (IFrameAPI: any) => {
        w.__spotifyIframeAPI = IFrameAPI;
        prevReady?.(IFrameAPI);
        createController(IFrameAPI);
      };
      if (!document.getElementById("spotify-iframe-api-script")) {
        const script = document.createElement("script");
        script.id = "spotify-iframe-api-script";
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);
      }
    }
    setUpSpotify();

    function onUnmuteClick() {
      userUnmuted = true;
      video.muted = false;
      hideMuteOverlay();
      spotifyController?.play();
    }
    unmuteHandlerRef.current = onUnmuteClick;

    function enterVideoPhase() {
      if (inVideoPhase) return;
      inVideoPhase = true;
      awaitingBufferScroll = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      if (!userUnmuted) video.muted = true;
      video.currentTime = 0;
      video.play()
        .then(() => console.log("[DanceScroll] video.play() succeeded"))
        .catch((err) => console.error("[DanceScroll] video.play() FAILED:", err));
      showMuteOverlay();
    }

    function exitVideoPhase() {
      if (!inVideoPhase) return;
      inVideoPhase = false;
      awaitingBufferScroll = false;
      if (bufferGestureTimer !== null) {
        clearTimeout(bufferGestureTimer);
        bufferGestureTimer = null;
      }
      videoWrap.style.opacity = "0";
      videoWrap.style.pointerEvents = "none";
      canvas.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      hideMuteOverlay();
      spotifyController?.pause();
      userUnmuted = false;
    }

    function advanceScrub(deltaPx: number) {
      if (inVideoPhase) {
        return;
      }
      scrubProgress = Math.max(0, Math.min(1, scrubProgress + deltaPx / CONFIG.scrubDistancePx));
      state.frameIndex = scrubProgress * (CONFIG.frameCount - 1);
      drawCurrentFrame();
      if (scrubProgress >= 1 && deltaPx > 0) {
        enterVideoPhase();
      }
    }

    // Inertia
    let velocity = 0;
    let momentumFrame: number | null = null;
    let momentumIdleTimer: ReturnType<typeof setTimeout> | null = null;
    const MOMENTUM_FRICTION = 0.94;
    const MOMENTUM_MIN_VELOCITY = 0.05;
    const MOMENTUM_IDLE_MS = 70;

    function cancelMomentum() {
      if (momentumFrame !== null) {
        cancelAnimationFrame(momentumFrame);
        momentumFrame = null;
      }
      if (momentumIdleTimer !== null) {
        clearTimeout(momentumIdleTimer);
        momentumIdleTimer = null;
      }
    }

    function runMomentum() {
      if (momentumFrame !== null) return;
      function step() {
        if (inVideoPhase || Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
          momentumFrame = null;
          return;
        }
        if (scrubProgress >= 1 && velocity > 0) {
          momentumFrame = null;
          return;
        }
        advanceScrub(velocity);
        velocity *= MOMENTUM_FRICTION;
        momentumFrame = requestAnimationFrame(step);
      }
      momentumFrame = requestAnimationFrame(step);
    }

    function registerInput(deltaPx: number, kickOffMomentumNow: boolean) {
      velocity = deltaPx;
      if (momentumIdleTimer !== null) clearTimeout(momentumIdleTimer);
      if (kickOffMomentumNow) {
        momentumIdleTimer = null;
        runMomentum();
      } else {
        momentumIdleTimer = setTimeout(runMomentum, MOMENTUM_IDLE_MS);
      }
    }

    function noteBufferedInput() {
      if (bufferGestureTimer !== null) clearTimeout(bufferGestureTimer);
      bufferGestureTimer = setTimeout(() => {
        awaitingBufferScroll = false;
        bufferGestureTimer = null;
      }, CONFIG.bufferGestureGapMs);
    }

    // -----------------------------------------------------------------
    // All listeners are now on `box` instead of `window`, so they only
    // fire when the cursor/touch is physically over the dance container.
    // No global scroll hijacking — scrolling anywhere else on the page
    // works completely normally.
    // -----------------------------------------------------------------

    function onWheel(e: WheelEvent) {
      if (!assetsReady) return;

      // Scrolling up while not mid-scrub: let the page scroll normally
      // While in scrub or video phase, eat all scroll inside the box
      if (inVideoPhase) {
        e.preventDefault();
        noteBufferedInput();
        return;
      }

      // Scrolling up before scrub has started: let page scroll normally
      if (scrubProgress <= 0 && e.deltaY < 0) return;

      e.preventDefault();
      cancelMomentum();
      advanceScrub(e.deltaY);
      registerInput(e.deltaY, false);
    }

    let touchStartY = 0;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
      cancelMomentum();
    }
    function onTouchMove(e: TouchEvent) {
      if (!assetsReady) return;
      const currentY = e.touches[0].clientY;
      const dy = touchStartY - currentY;

      // While in scrub or video phase, eat all scroll inside the box
      if (inVideoPhase) {
        e.preventDefault();
        noteBufferedInput();
        touchStartY = currentY;
        return;
      }

      // Scrolling up before scrub has started: let page scroll normally
      if (scrubProgress <= 0 && dy < 0) return;

      e.preventDefault();
      advanceScrub(dy);
      registerInput(dy, false);
      touchStartY = currentY;
    }
    function onTouchEnd() {
      registerInput(velocity, true);
    }

    // Attach to the box element, not window
    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchmove", onTouchMove, { passive: false });
    box.addEventListener("touchend", onTouchEnd, { passive: true });

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
      assetsReady = true;
    });

    return () => {
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchmove", onTouchMove);
      box.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      cancelMomentum();
      if (bufferGestureTimer !== null) clearTimeout(bufferGestureTimer);
    };
  }, []);

  return (
    <>
    <div
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
        className="rounded-lg"
        style={{
          position: "relative",
          width: 225,
          height: 400,
          overflow: "hidden",
          background: "transparent",
          // Cursor hint: pointer while there's still scrubbing to do,
          // so the user knows this box is interactive.
          cursor: "ns-resize",
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
            loop
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Hidden Spotify embed — audio only */}
        <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <div ref={spotifyContainerRef} style={{ width: 300, height: 80 }} />
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
    </>
  );
}
