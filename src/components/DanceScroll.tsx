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

  boxWidth: 270,
  boxHeight: 480,

  // How much real scroll distance (px) it takes to scrub through all the
  // frames once locked. Driven by GSAP ScrollTrigger's own scroll-position
  // tracking rather than accumulated wheel/touch deltas, which is what
  // made the old lock inconsistent across browsers/devices.
  scrubDistancePx: 900,

  // Extra scroll distance (px), on top of scrubDistancePx, required
  // after the video starts before it releases and the page is free to
  // keep scrolling. ~300px is roughly two normal wheel/trackpad gestures'
  // worth — a real, fixed scroll distance, not a timer guess.
  bufferDistancePx: 300,

  // GSAP's scrub smoothing factor (seconds) — ties frame/video progress
  // to scroll position with a slight lag instead of a raw 1:1 mapping,
  // matching the feel used on the blackbird application pages.
  scrubSmoothness: 0.1,

  // Hidden Spotify track played (audio only) once the person hits UNMUTE.
  spotifyTrackId: "5kDLJIAApnLKgdiTdAsd6P",
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
  const spotifyContainerRef = useRef<HTMLDivElement>(null);
  const unmuteHandlerRef = useRef<() => void>(() => {});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const pinTarget = pinRef.current!; // never transformed/fixed itself — always a trustworthy rect
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
    let isLocked = false;

    const state = { frameIndex: 0 };
    let prevProgress = 0;
    let gifVirtualProgress = 0;

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

    // The box itself is a fixed 270x480 — this only needs to run once
    // (plus on resize, for DPR changes), not on every scroll update.
    function resizeCanvas() {
      cachedCw = CONFIG.boxWidth;
      cachedCh = CONFIG.boxHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cachedCw * dpr);
      canvas.height = Math.round(cachedCh * dpr);
      canvas.style.width = cachedCw + "px";
      canvas.style.height = cachedCh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCurrentFrame();
    }

    // Vertical offset (from the top of a single viewport) that centers
    // the box — used identically whether the box is resting (absolute,
    // relative to pinTarget) or locked (fixed, relative to the viewport),
    // so there's no jump switching between the two.
    function centeredTopPx() {
      return Math.round((window.innerHeight - CONFIG.boxHeight) / 2);
    }

    // Resting state: box sits inside pinTarget's own box, positioned at
    // exactly the offset it'll need once locked — so the instant
    // pinTarget's top reaches the top of the viewport, it's already
    // sitting in the right spot and switching to position:fixed doesn't
    // visibly move it at all.
    function applyRestingPosition() {
      box.style.position = "absolute";
      box.style.top = `${centeredTopPx()}px`;
      box.style.left = "auto";
      box.style.right = "0px";
    }

    // Locked state: real position:fixed, computed from pinTarget's own
    // current rect. pinTarget is never itself transformed or fixed, so
    // this rect is always an accurate read of the column's actual
    // on-screen position — unlike trusting a percentage width under
    // position:fixed (which resolves against the viewport, not the
    // original parent, and was the actual cause of it centering on the
    // whole page instead of the column).
    function applyLockedPosition() {
      const rect = pinTarget.getBoundingClientRect();
      box.style.position = "fixed";
      box.style.top = `${centeredTopPx()}px`;
      box.style.left = `${Math.round(rect.right - CONFIG.boxWidth)}px`;
      box.style.right = "auto";
    }

    function syncBoxPosition(locked: boolean) {
      isLocked = locked;
      if (locked) applyLockedPosition();
      else applyRestingPosition();
    }

    // Reserves enough document space for the whole interaction: one
    // viewport's worth so the box can sit centered when pinTarget's top
    // first reaches the top of the viewport, plus the full scrub+buffer
    // distance so the page doesn't run out of room to scroll through
    // before that distance is used up.
    function resizePinTarget() {
      const totalPx = CONFIG.scrubDistancePx + CONFIG.bufferDistancePx;
      pinTarget.style.height = `${window.innerHeight + totalPx}px`;
      syncBoxPosition(isLocked);
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

    // Spotify IFrame Embed API — gives us a real controller.play() call
    // instead of relying on the "&autoplay=1" URL param, which browsers
    // don't reliably honor for a hidden cross-origin iframe.
    let spotifyController: { play: () => void; pause: () => void; addListener?: (event: string, cb: (e: any) => void) => void } | null = null;
    let spotifyHasStartedPlaying = false;
    function onSpotifyPlaybackUpdate(e: any) {
      const { isPaused, position } = e?.data ?? {};
      if (!isPaused && position > 0) {
        spotifyHasStartedPlaying = true;
        return;
      }
      // Spotify's embed pauses itself and resets position to 0 once a
      // single track finishes with nothing queued after it — treat that
      // as "ended" and let the person replay it via UNMUTE again.
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
        // API already loaded by something else on the page — reuse it.
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
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      if (!userUnmuted) video.muted = true;
      video.currentTime = 0;
      video.play().catch((err) => console.error("[DanceScroll] video.play() FAILED:", err));
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
      video.muted = true;
      hideMuteOverlay();
      spotifyController?.pause();
      // Treat every fresh entry into the video as a clean state — re-prompt
      // for UNMUTE next time rather than silently staying "unmuted" from a
      // previous pass.
      userUnmuted = false;
    }

    let st: ScrollTrigger | null = null;

    function initScrollTrigger() {
      const totalPx = CONFIG.scrubDistancePx + CONFIG.bufferDistancePx;

      st = ScrollTrigger.create({
        trigger: pinTarget,
        start: "top top",
        end: () => `+=${totalPx}`,
        // No pin:true — see the comments on applyLockedPosition/
        // applyRestingPosition for why: GSAP's own pin+spacer captures
        // dimensions in a way that fought this layout (nested flex
        // column next to a sidebar). GSAP is only used here for its
        // reliable scroll-position tracking; the actual fixed/absolute
        // positioning is computed and applied by us.
        scrub: CONFIG.scrubSmoothness,
        onToggle: (self) => {
          document.body.classList.toggle("dance-lock-active", self.isActive);
          syncBoxPosition(self.isActive);
        },
        onUpdate: (self) => {
          // Keep left/top correct if the window is resized mid-scrub.
          if (self.isActive) syncBoxPosition(true);

          const progress = self.progress; // 0 to 1 across totalPx
          const deltaPx = (progress - prevProgress) * totalPx;

          if (!inVideoPhase) {
            gifVirtualProgress = Math.max(0, Math.min(1, gifVirtualProgress + deltaPx / CONFIG.scrubDistancePx));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            drawCurrentFrame();
            if (gifVirtualProgress >= 1 && deltaPx > 0) {
              enterVideoPhase();
            }
          } else if (deltaPx < 0) {
            exitVideoPhase();
            gifVirtualProgress = Math.max(0, Math.min(1, 1 + deltaPx / CONFIG.scrubDistancePx));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            drawCurrentFrame();
          }
          // else: inVideoPhase && deltaPx > 0 — the buffer zone. Scroll
          // distance is still being consumed (moving progress toward 1,
          // which is what eventually releases the lock) but nothing else
          // happens until it does.

          prevProgress = progress;
        },
        onRefresh: () => {
          drawCurrentFrame();
          syncBoxPosition(isLocked);
        },
      });
    }

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        resizePinTarget();
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    resizePinTarget();
    resizeCanvas();
    drawCurrentFrame();

    Promise.all([preloadFrames(), preloadVideo()]).then(() => {
      resizeCanvas();
      hideLoader();
      initScrollTrigger();
    });

    return () => {
      window.removeEventListener("resize", onResize);
      st?.kill();
      document.body.classList.remove("dance-lock-active");
    };
  }, []);

  return (
    <>
      {/* While dance-lock-active is set on <body>, every iframe on the
          page (chiefly the sidebar's Spotify embed) stops receiving
          pointer events — a safety net alongside the scroll lock itself. */}
      <style>{`body.dance-lock-active iframe { pointer-events: none !important; }`}</style>
      <div
        ref={pinRef}
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <div
          ref={boxRef}
          className="rounded-lg"
          style={{
            position: "absolute",
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
              loop
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Hidden Spotify embed — audio only. The IFrame API injects its own
              iframe into this container with a real internal size (needed
              for it to actually init/play), clipped invisible by the
              zero-size overflow-hidden wrapper. Started on UNMUTE via a
              real click, using the API's controller.play(). */}
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
