import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const arial = {
  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
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
  const unmuteHandlerRef = useRef<() => void>(() => {});
  const revealSectionRef = useRef<HTMLDivElement>(null);
  const revealImgRef = useRef<HTMLImageElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const initScrollTriggerRef = useRef<() => void>(() => {});

  // "pending" = gate showing, not yet chosen. "correct" = Joel picked
  // Joel (current experience, unchanged). "wrong" = Joel picked Becca
  // (heads-up message, then same experience).
  const [gateChoice, setGateChoice] = useState<"pending" | "correct" | "wrong">("pending");
  const [unmuted, setUnmuted] = useState(false);

  // Lock page scroll while the gate is up, so nobody can scroll into the
  // pinned experience invisibly behind it before choosing a name.
  useEffect(() => {
    document.body.style.overflow = gateChoice === "pending" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gateChoice]);

  // Whenever gate choice changes, the wrong path inserts two full-height
  // sections before the pinned experience — shifting its position in the
  // document. GSAP's pin physically wraps the pinned element in a node it
  // inserts itself, which is incompatible with React inserting new
  // siblings before it afterward — so for the wrong path specifically,
  // the pin is killed synchronously in the button's own click handler
  // (before the state change that inserts those siblings), and recreated
  // here once the new layout has actually settled.
  useEffect(() => {
    if (gateChoice === "wrong") {
      requestAnimationFrame(() => {
        initScrollTriggerRef.current();
      });
    } else {
      ScrollTrigger.refresh();
    }
  }, [gateChoice]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "scratch-cursor-override";
    style.textContent = `
      html, body, * { cursor: auto !important; }
      img[src="/mouse.png"] { display: none !important; }
      .cursor-trail-rect { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Gate button hover style — offset black "shadow" pill behind the
  // button that tucks away (button slides into it) on hover.
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "scratch-gate-button-style";
    style.textContent = `
      .gate-btn {
        background: #fff;
        color: #000;
        border: 3px solid #000;
        border-radius: 999px;
        padding: 16px 36px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 7px 7px 0 0 #000;
        transform: translate(0, 0);
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      }
      .gate-btn:hover {
        transform: translate(7px, 7px);
        box-shadow: 0 0 0 0 #000;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Wrong-path only: as the person scrolls through the reveal section,
  // slide the frozen first frame up from below the viewport into its
  // exact "docked" position — the same cover-fit box the main experience
  // uses — so by the time this section's top reaches the top of the
  // viewport, it lines up pixel-perfect with where the pinned experience
  // takes over immediately after it in the document.
  useEffect(() => {
    if (gateChoice !== "wrong") return;

    gsap.registerPlugin(ScrollTrigger);

    const section = revealSectionRef.current;
    const img = revealImgRef.current;
    if (!section || !img) return;

    function sizeImage() {
      if (!img) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const naturalW = img.naturalWidth || 1920;
      const naturalH = img.naturalHeight || 960;
      const scale = Math.max(cw / naturalW, ch / naturalH);
      img.style.width = `${naturalW * scale}px`;
      img.style.height = `${naturalH * scale}px`;
    }

    if (img.complete) sizeImage();
    img.addEventListener("load", sizeImage);
    window.addEventListener("resize", sizeImage);

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const offsetVh = (1 - self.progress) * 100;
        img.style.transform = `translate(-50%, -50%) translateY(${offsetVh}vh)`;
      }
    });

    return () => {
      img.removeEventListener("load", sizeImage);
      window.removeEventListener("resize", sizeImage);
      st.kill();
    };
  }, [gateChoice]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const CONFIG = {
      frameFolder: "/part3",
      frameCount: 61,
      framePrefix: "frame_",
      frameDigits: 4,
      frameExt: "png",

      scrubSmoothness: 0.1,
      pinSpacerMultiplier: 3,

      gifScrubRate: 0.4
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pinTarget = pinRef.current!;
    const stage = stageRef.current!;
    const video = videoRef.current!;
    const videoWrap = videoWrapRef.current!;
    const muteOverlay = muteOverlayRef.current!;
    const muteTitle = muteTitleRef.current!;

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
      const scale = Math.max(cw / naturalW, ch / naturalH);
      const drawW = naturalW * scale;
      const drawH = naturalH * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;
      return { drawW, drawH, offsetX, offsetY };
    }

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
    // Stored in a ref rather than addEventListener directly on the DOM
    // node — the mute text (and its "UNMUTE" span) swaps between two
    // different JSX variants depending on gate choice, which means React
    // may replace that DOM node. A ref-based callback always calls
    // whatever the current handler is, regardless of which node is
    // currently rendered — no stale/detached listener risk.
    unmuteHandlerRef.current = onUnmuteClick;

    function enterVideoPhase() {
      if (inVideoPhase) return;
      inVideoPhase = true;
      videoWrap.style.opacity = "1";
      videoWrap.style.pointerEvents = "auto";
      canvas.style.opacity = "0";
      resizeCanvas();
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
    let gifVirtualProgress = 0;

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
            gifVirtualProgress = Math.max(0, Math.min(1, gifVirtualProgress + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            state.gapProgress = 1 - gifVirtualProgress;
            drawCurrentFrame();

            if (gifVirtualProgress >= 1 && delta > 0) {
              enterVideoPhase();
              startPlayingForward();
            }
          } else if (delta < 0) {
            exitVideoPhase();
            gifVirtualProgress = Math.max(0, Math.min(1, 1 + delta / CONFIG.gifScrubRate));
            state.frameIndex = gifVirtualProgress * (CONFIG.frameCount - 1);
            state.gapProgress = 1 - gifVirtualProgress;
            drawCurrentFrame();
          }

          prevProgress = progress;
        },
        onRefresh: () => drawCurrentFrame()
      });
      // Exposed via refs so code outside this effect (the gate buttons) can
      // kill and recreate this pin around DOM structure changes — GSAP's
      // pin physically wraps pinTarget in a "pin-spacer" node it inserts
      // itself, which conflicts with React later inserting new siblings
      // before it unless the pin is torn down first.
      scrollTriggerRef.current = st;
      initScrollTriggerRef.current = initScrollTrigger;
    }

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        resizeCanvas();
        applyResponsiveTitle();
      }, 200);
    };

    function applyResponsiveTitle() {
      const isMobile = window.innerWidth <= 600;
      muteTitle.style.whiteSpace = isMobile ? "normal" : "nowrap";
      muteTitle.style.width = isMobile ? "92vw" : "80vw";
    }
    window.addEventListener("resize", onResize);

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
      st?.kill();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {gateChoice === "pending" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#369FDC",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-8%", left: "-6%", width: "38vw", height: "38vw", borderRadius: "50%", background: "#FF99CC" }} />
          <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: "44vw", height: "44vw", borderRadius: "50%", background: "#FFB400" }} />
          <div style={{ position: "absolute", top: "18%", right: "6%", width: "16vw", height: "16vw", borderRadius: "12%", background: "#FF451F", transform: "rotate(12deg)" }} />
          <div style={{ position: "absolute", bottom: "10%", left: "8%", width: "14vw", height: "14vw", borderRadius: "12%", background: "#C03380", transform: "rotate(-10deg)" }} />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
              padding: 24,
              textAlign: "center"
            }}
          >
            <div
              style={{
                maxWidth: 640,
                fontSize: "clamp(28px, 5vw, 52px)",
                lineHeight: 1.25,
                color: "#000",
                ...arial,
                fontWeight: 800
              }}
            >
              Who are you?
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="gate-btn"
                onClick={() => setGateChoice("correct")}
                style={{ ...arial, fontSize: 20 }}
              >
                I'm Joel
              </button>
              <button
                className="gate-btn"
                onClick={() => {
                  // Kill the pin BEFORE the state change inserts new
                  // siblings before it — see note above the [gateChoice]
                  // effect for why this ordering matters.
                  scrollTriggerRef.current?.kill();
                  scrollTriggerRef.current = null;
                  setGateChoice("wrong");
                }}
                style={{ ...arial, fontSize: 20 }}
              >
                I'm Becca
              </button>
            </div>
          </div>
        </div>
      )}

      {gateChoice === "wrong" && (
        <>
          <div
            style={{
              height: "100vh",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 24
            }}
          >
            <div style={{ ...arial, maxWidth: 640 }}>
              <div style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.25 }}>
                You're not Becca, but you can see what I sent to her if you like.
              </div>
              <div style={{ fontSize: "clamp(14px, 1.6vw, 20px)", marginTop: "0.6em" }}>
                Scroll down and{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => {
                    unmuteHandlerRef.current();
                    setUnmuted(true);
                  }}
                >
                  unmute
                </span>
              </div>
            </div>
          </div>

          <div
            ref={revealSectionRef}
            style={{
              height: "100vh",
              position: "relative",
              background: "#ffffff",
              overflow: "hidden"
            }}
          >
            <img
              ref={revealImgRef}
              src="/part3/frame_0001.png"
              alt=""
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) translateY(100vh)"
              }}
            />
          </div>
        </>
      )}

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
              height: "100%",
              maxWidth: "none",
              maxHeight: "none"
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
              ...arial,
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
              pointerEvents: "none",
              display: gateChoice === "wrong" ? "none" : "block"
            }}
          >
            SID, YOU'RE ON MUTE. PRESS{" "}
            <span
              style={{ textDecoration: "underline", cursor: "pointer", pointerEvents: "auto" }}
              onClick={() => unmuteHandlerRef.current()}
            >
              UNMUTE
            </span>
            .
          </div>
        </div>

        {/* Wrong-path message now lives in a normal-flow section BEFORE
            this pinned experience (see above) rather than as an overlay
            on top of it. */}

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
