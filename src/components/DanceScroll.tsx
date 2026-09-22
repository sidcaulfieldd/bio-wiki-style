import { useEffect, useRef } from "react";

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
  // frames once the box has scrolled up to the pin line. Lower = more
  // sensitive (less physical scrolling needed per frame).
  scrubDistancePx: 420,

  // Hidden Spotify track played (audio only) once the person hits UNMUTE.
  spotifyTrackId: "5kDLJIAApnLKgdiTdAsd6P",

  // How long a gap in forward-scroll input has to be, once the video
  // starts, before the current gesture is considered "finished" and the
  // next scroll is allowed to move the page. A single physical wheel/
  // trackpad swipe fires many small events in a burst; this swallows
  // the rest of that one gesture and releases right after it ends,
  // rather than requiring an entirely separate second gesture.
  bufferGestureGapMs: 150,

  // How close (px) the box's top has to be to its centered "pin line"
  // position before we proactively disable pointer-events on iframes.
  // This has to fire BEFORE the critical wheel/touch tick that would
  // otherwise engage the lock, because if the cursor happens to be over
  // an iframe (e.g. the sidebar Spotify embed) at that exact moment, the
  // wheel event never reaches window at all — there's no event to react
  // to. A plain `scroll` listener isn't gated by iframe hit-testing the
  // way wheel/touchmove are, so it's the only reliable place to flip
  // this class ahead of time. Matches stickyBufferPx below, since that's
  // the actual window we have to work with now.
  approachThresholdPx: 160,
};

// The box's own fixed size.
const BOX_WIDTH = 225;
const BOX_HEIGHT = 400;

// How much extra height (px, on top of the box's own height) the sticky
// wrapper gets on top and bottom combined. This is what gives `position:
// sticky` room to actually hold the box centered across a range of
// scroll positions — approaching from above or below — rather than the
// box just being centered for a single scroll-position instant (which is
// exactly the old bug: a fast scroll tick could skip past that instant
// entirely). Kept modest here specifically to stay close to the current
// compact layout rather than the more typical full-viewport-tall
// scrollytelling treatment.
const STICKY_BUFFER_PX = 180;
const STICKY_WRAPPER_HEIGHT = BOX_HEIGHT + STICKY_BUFFER_PX * 2;

export default function DanceScroll() {
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
    let scrubProgress = 0; // 0 to 1, driven directly by wheel/touch input once pinned
    let assetsReady = false;

    // Prefer visualViewport's height where available — on mobile,
    // window.innerHeight can include space that's about to be covered or
    // uncovered by the browser's address bar/toolbar as it shows/hides
    // mid-scroll, whereas visualViewport tracks the actually-visible
    // area. This only affects the precision of when our JS *detects* the
    // pin line — with sticky now handling the box's actual on-screen
    // position (see the JSX below), a small mismatch here can no longer
    // cause an off-center lock, only slightly early/late detection.
    function viewportHeight() {
      return window.visualViewport?.height ?? window.innerHeight;
    }

    // True right after the video starts, until forward-scroll input has
    // gone quiet for bufferGestureGapMs — swallows the rest of the one
    // gesture that triggered the video, releasing right after it ends.
    let awaitingBufferScroll = false;
    let bufferGestureTimer: ReturnType<typeof setTimeout> | null = null;

    // While locked (mid-scrub or in the video's up-reverse/buffer window),
    // every iframe on the page loses pointer-events via this body class,
    // so a cursor sitting over e.g. the sidebar's Spotify embed can't
    // swallow the wheel event before it ever reaches our listeners.
    function updateBodyLockClass() {
      document.body.classList.toggle("dance-lock-active", scrubProgress > 0 || inVideoPhase);
    }

    // Tracks whether the proactive "approaching" state is currently
    // applied, purely so we don't call classList.toggle on every single
    // scroll tick once we're already in the desired state.
    let approachingLock = false;

    // Proactively disables iframe pointer-events once the box is getting
    // close to its pin line, well before the lock would otherwise engage.
    // This is what actually fixes the "doesn't work when the mouse is
    // over the sidebar" bug: by the time the box reaches the pin line,
    // iframes have already stopped intercepting wheel/touch input, so the
    // critical tick that would call advanceScrub()/enterVideoPhase() is
    // guaranteed to reach our listeners.
    function updateApproachingLock() {
      // A desynced lock (scrubProgress stuck > 0 while the box is nowhere
      // near center) would otherwise cause this to bail out below and
      // never re-evaluate proximity until the next wheel/touch tick —
      // check it here too so recovery isn't gated on scroll input type.
      validateLockPosition();
      // Once actually locked, updateBodyLockClass() owns the class —
      // don't fight it.
      if (scrubProgress > 0 || inVideoPhase) return;
      const rect = box.getBoundingClientRect();
      const centeredTop = Math.max(0, (viewportHeight() - rect.height) / 2);
      const distance = Math.abs(rect.top - centeredTop);
      const isApproaching = distance < CONFIG.approachThresholdPx;
      if (isApproaching !== approachingLock) {
        approachingLock = isApproaching;
        document.body.classList.toggle("dance-lock-active", isApproaching);
      }
    }

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

    // video.play() returns a promise that can be rejected — most commonly
    // because pause() was called (an AbortError) before it resolved, which
    // happens easily here if the person scrolls back and forth fast enough
    // to flip enterVideoPhase/exitVideoPhase before the previous play()
    // settled. The original code just logged that and gave up, leaving the
    // video silently paused — which is exactly the "only sometimes
    // playing" symptom. playAttemptToken lets a stale retry recognize it's
    // no longer relevant (phase changed again since it was scheduled) and
    // bail instead of fighting a newer request.
    let playAttemptToken = 0;
    function attemptVideoPlay(token: number) {
      video
        .play()
        .then(() => {
          if (token !== playAttemptToken) return; // superseded, ignore
        })
        .catch((err) => {
          if (token !== playAttemptToken || !inVideoPhase) return; // superseded or already exited
          console.error("[DanceScroll] video.play() FAILED, retrying:", err);
          setTimeout(() => attemptVideoPlay(token), 60);
        });
    }

    // Backstop: even a "successful" play() can end up silently paused
    // again (e.g. a stray pause from something else on the page), so
    // periodically confirm it's actually playing for as long as we're
    // meant to be in the video phase, and re-trigger play() if not.
    let videoWatchdogTimer: ReturnType<typeof setInterval> | null = null;
    function startVideoWatchdog() {
      stopVideoWatchdog();
      videoWatchdogTimer = setInterval(() => {
        if (inVideoPhase && video.paused) {
          attemptVideoPlay(playAttemptToken);
        }
      }, 250);
    }
    function stopVideoWatchdog() {
      if (videoWatchdogTimer !== null) {
        clearInterval(videoWatchdogTimer);
        videoWatchdogTimer = null;
      }
    }

    function enterVideoPhase() {
      if (inVideoPhase) return;
      inVideoPhase = true;
      awaitingBufferScroll = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      if (!userUnmuted) video.muted = true;
      video.currentTime = 0;
      playAttemptToken++;
      attemptVideoPlay(playAttemptToken);
      startVideoWatchdog();
      showMuteOverlay();
    }

    function exitVideoPhase() {
      if (!inVideoPhase) return;
      inVideoPhase = false;
      awaitingBufferScroll = false;
      playAttemptToken++; // invalidate any in-flight retry from this session
      stopVideoWatchdog();
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
      // Treat every fresh entry into the video as a clean state — re-prompt
      // for UNMUTE next time rather than silently staying "unmuted" from a
      // previous pass.
      userUnmuted = false;
    }

    // True once the box has scrolled up far enough that locking now would
    // land it centered in the current viewport — the cue to start
    // intercepting scroll input for the frame scrub instead of letting
    // the page keep scrolling. Computed live off window.innerHeight
    // (rather than a fixed px constant) so it centers correctly whatever
    // the viewport height happens to be, including on resize.
    function reachedPinLine() {
      const rect = box.getBoundingClientRect();
      const centeredTop = Math.max(0, (viewportHeight() - rect.height) / 2);
      return rect.top <= centeredTop;
    }

    // The mirror image of reachedPinLine(), for the video-phase reverse
    // trigger. reachedPinLine() alone won't work here: once the box has
    // scrolled up past the pin line (top < centeredTop), it stays true
    // for the *entire* remainder of the downward scroll, since the box
    // only gets further above the line, not closer to it. What we
    // actually need while inVideoPhase is a check for the box's top
    // coming back UP to the centered line as the person scrolls up —
    // i.e. approaching it from above rather than from below.
    function returnedToPinLine() {
      const rect = box.getBoundingClientRect();
      const centeredTop = Math.max(0, (viewportHeight() - rect.height) / 2);
      return rect.top >= centeredTop;
    }

    // With the box's centered position now guaranteed by CSS `position:
    // sticky` (see the JSX below) rather than approximated by polling
    // getBoundingClientRect() mid-scroll, there's no overshoot to correct
    // for anymore: by the time any wheel/touch tick detects the box has
    // reached the pin line, the browser has already pinned it exactly
    // there — regardless of how fast the scroll was. The old overshoot-
    // into-scrubProgress correction that lived here is no longer needed.

    function advanceScrub(deltaPx: number) {
      if (inVideoPhase) {
        if (deltaPx < 0) exitVideoPhase();
        else return; // scrolling down during video: no lock, let the page scroll
      }
      scrubProgress = Math.max(0, Math.min(1, scrubProgress + deltaPx / CONFIG.scrubDistancePx));
      state.frameIndex = scrubProgress * (CONFIG.frameCount - 1);
      drawCurrentFrame();
      if (scrubProgress >= 1 && deltaPx > 0) {
        enterVideoPhase();
      }
      updateBodyLockClass();
    }

    // Inertia: once the person stops actively scrolling/swiping, keep
    // scrubbing for a bit at a decaying "velocity" instead of stopping
    // dead, the way normal page-scroll momentum feels.
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
      if (momentumFrame !== null) return; // already coasting
      function step() {
        if (inVideoPhase || Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
          momentumFrame = null;
          return;
        }
        if (scrubProgress <= 0 && velocity < 0) {
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

    // Called after every real wheel/touch input: records velocity and
    // (re)schedules momentum to kick in once input goes quiet.
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

    // scrubProgress is meant to only be nonzero while the box is sitting
    // at (or very near) its pin line. But nothing was ever re-verifying
    // that against the box's actual position — if a stray wheel/touch
    // event slipped through before interception kicked in (e.g. one
    // event in a fast multi-event burst, or a forward-scroll tick during
    // the video's buffer window that wasn't cleanly swallowed), the real
    // page scroll could move out from under scrubProgress, leaving it
    // stuck at some value between 0 and 1 with the box nowhere near
    // center. From that point on, `return true` below fired unconditionally
    // for any scrubProgress > 0 regardless of where the box actually was —
    // which is exactly the "locks even after scrolling well past it" bug.
    //
    // This makes the lock self-healing: before trusting scrubProgress,
    // check whether the box has drifted implausibly far from the pin
    // line for a value that should only exist near it, and if so, treat
    // it as a stale/desynced lock and clear it so the page scrolls
    // normally again.
    function validateLockPosition() {
      if (scrubProgress <= 0 || inVideoPhase) return;
      const rect = box.getBoundingClientRect();
      const centeredTop = Math.max(0, (viewportHeight() - rect.height) / 2);
      const distance = Math.abs(rect.top - centeredTop);
      // One viewport height of drift is well beyond anything a genuine
      // scrub session should ever produce (scrubDistancePx maps to the
      // box staying pinned), so past that we know the lock desynced.
      if (distance > viewportHeight()) {
        scrubProgress = 0;
        state.frameIndex = 0;
        drawCurrentFrame();
        updateBodyLockClass();
      }
    }

    // Only intercept scroll input once assets are loaded, and either:
    //  - the frames aren't finished yet and the box has scrolled up to
    //    the pin line (or we're already mid-scrub), or
    //  - we're in the video phase and the person is scrolling UP, which
    //    should reverse back into the frames instead of scrolling the page.
    function shouldIntercept(deltaPositive: boolean) {
      if (!assetsReady) return false;
      validateLockPosition();
      if (inVideoPhase) {
        // Reverse (scroll up) only re-engages the lock once the box has
        // actually scrolled back up to the same centered line used going
        // down — not on any upward scroll while the video happens to be
        // playing, which could be while the box is far off-screen.
        if (!deltaPositive) return returnedToPinLine();
        return awaitingBufferScroll; // forward scroll: keep swallowing until the buffered gesture goes quiet
      }
      if (scrubProgress <= 0 && !deltaPositive) return false; // let them scroll back up, away from the pin line
      if (!reachedPinLine() && scrubProgress <= 0) return false;
      return true;
    }

    // Called for every forward-scroll event swallowed by the buffer.
    // Keeps re-arming the quiet-gap timer, so a whole burst of wheel/
    // touch events from one physical gesture gets absorbed together —
    // only once input actually stops for bufferGestureGapMs does the
    // buffer clear and let the next gesture through.
    function noteBufferedInput() {
      if (bufferGestureTimer !== null) clearTimeout(bufferGestureTimer);
      bufferGestureTimer = setTimeout(() => {
        awaitingBufferScroll = false;
        bufferGestureTimer = null;
      }, CONFIG.bufferGestureGapMs);
    }

    function onWheel(e: WheelEvent) {
      const deltaPositive = e.deltaY > 0;
      if (!shouldIntercept(deltaPositive)) return;
      e.preventDefault();
      if (inVideoPhase && deltaPositive) {
        noteBufferedInput();
        return;
      }
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
      const currentY = e.touches[0].clientY;
      const dy = touchStartY - currentY; // positive = finger moving up = scrolling down
      const deltaPositive = dy > 0;
      if (!shouldIntercept(deltaPositive)) return;
      e.preventDefault();
      if (inVideoPhase && deltaPositive) {
        noteBufferedInput();
        touchStartY = currentY;
        return;
      }
      advanceScrub(dy);
      registerInput(dy, false);
      touchStartY = currentY;
    }
    function onTouchEnd() {
      // Finger lifted — coast immediately rather than waiting out the idle timer.
      registerInput(velocity, true);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", updateApproachingLock, { passive: true });
    window.addEventListener("resize", updateApproachingLock, { passive: true });

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(resizeCanvas, 200);
    };
    window.addEventListener("resize", onResize);

    resizeCanvas();
    drawCurrentFrame();
    updateApproachingLock();

    Promise.all([preloadFrames(), preloadVideo()]).then(() => {
      resizeCanvas();
      hideLoader();
      assetsReady = true;
    });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", updateApproachingLock);
      window.removeEventListener("resize", updateApproachingLock);
      window.removeEventListener("resize", onResize);
      cancelMomentum();
      stopVideoWatchdog();
      if (bufferGestureTimer !== null) clearTimeout(bufferGestureTimer);
      document.body.classList.remove("dance-lock-active");
    };
  }, []);

  return (
    <>
    {/* While dance-lock-active is set on <body>, every iframe on the page
        (chiefly the sidebar's Spotify embed) stops receiving pointer
        events, so hovering it can't swallow a wheel/touch event before
        it ever reaches this component's window-level listeners. */}
    <style>{`body.dance-lock-active iframe { pointer-events: none !important; }`}</style>
    {/* Outer wrapper: sized to give the sticky child below room to hold
        centered across a range of scroll positions (STICKY_BUFFER_PX on
        each side), rather than the box only being exactly centered for a
        single scroll-position instant. Kept just tall enough for that —
        not the more typical full-viewport-height scrollytelling treatment
        — to stay close to the page's existing compact layout. */}
    <div
      style={{
        position: "relative",
        width: "100%",
        height: STICKY_WRAPPER_HEIGHT,
      }}
    >
      {/* This is what actually guarantees centering: `position: sticky`
          is computed by the browser's compositor on every scroll frame,
          so the box snaps to exactly this offset the instant it would
          otherwise scroll past it — no matter how fast the scroll was.
          Our JS never has to poll/approximate this position anymore; it
          only detects (via getBoundingClientRect(), which will now read
          back this exact value while stuck) when to engage the hard lock
          on top of it. `dvh` (rather than `vh`) tracks the actual visible
          viewport on mobile as browser toolbars show/hide. */}
      <div
        style={{
          position: "sticky",
          top: `calc(50dvh - ${BOX_HEIGHT / 2}px)`,
          display: "flex",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          ref={boxRef}
          className="rounded-lg"
          style={{
            position: "relative",
            // Capped at 225x400 (still exact 9:16) instead of 270x480 —
            // matches NotableProjectsPixelation's cap, and sits closer to
            // the height of the caption text beside it. resizeCanvas()
            // reads this box's actual rect at runtime, so the video/canvas
            // scale to fit automatically — nothing else needs to change.
            width: BOX_WIDTH,
            height: BOX_HEIGHT,
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
          <button
            type="button"
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
              border: "none",
              font: "inherit",
            }}
            onClick={() => unmuteHandlerRef.current()}
            aria-label="Unmute video and play music"
          >
            UNMUTE
          </button>
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
    </div>
    </>
  );
}
