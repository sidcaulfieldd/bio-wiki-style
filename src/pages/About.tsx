import { useEffect, useRef, useState, useCallback } from "react";
import profilePic from "@/assets/profile_pic.gif";
import { Link } from "react-router-dom";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

type Pos = { x: number; y: number };

// ───────────────────────── Title drag (unchanged) ─────────────────────────
// The heading is plain drag-only — no gravity, no collision. Kept exactly
// as it was.
const useDraggable = (initial: Pos) => {
  const [pos, setPos] = useState<Pos>(initial);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef<Pos>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragging.current = true;
  };

  return { ref, pos, setPos, onPointerDown };
};

// Skewed random: bias toward extremes rather than centre (used when placing
// newly-added gifs).
const skewedRandom = () => {
  const r = Math.random();
  return Math.random() < 0.5 ? Math.pow(r, 0.3) : 1 - Math.pow(r, 0.3);
};

// ───────────────────── Shared transparency-aware mask ─────────────────────
// Every gif on the page is the same source image, so we only need to build
// this once: a coarse opacity grid sampled from the actual gif's alpha
// channel. Collision checks below use this instead of the rectangular
// bounding box, so two gifs only "touch" where their visible silhouettes
// actually overlap — the transparent padding around the figure doesn't
// count.
const MASK_COLS = 28;
let maskGrid: Uint8Array | null = null;
let maskRows = 0;
let maskAspect = 1; // naturalHeight / naturalWidth, used to size every gif
let maskLoadStarted = false;

function loadMask(onReady: () => void) {
  if (maskGrid) {
    onReady();
    return;
  }
  if (maskLoadStarted) return;
  maskLoadStarted = true;

  const img = new Image();
  img.onload = () => {
    maskAspect = img.naturalHeight / img.naturalWidth;
    maskRows = Math.max(1, Math.round(MASK_COLS * maskAspect));

    const canvas = document.createElement("canvas");
    canvas.width = MASK_COLS;
    canvas.height = maskRows;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onReady();
      return;
    }
    ctx.drawImage(img, 0, 0, MASK_COLS, maskRows);
    const { data } = ctx.getImageData(0, 0, MASK_COLS, maskRows);
    const grid = new Uint8Array(MASK_COLS * maskRows);
    for (let i = 0; i < MASK_COLS * maskRows; i++) {
      grid[i] = data[i * 4 + 3] > 40 ? 1 : 0; // alpha threshold
    }
    maskGrid = grid;
    onReady();
  };
  img.onerror = () => onReady(); // fall back to plain rectangle collision
  img.src = profilePic;
}

function isOpaqueAtUV(u: number, v: number): boolean {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  if (!maskGrid) return true; // mask not ready yet — treat as a solid rectangle
  const col = Math.min(MASK_COLS - 1, Math.floor(u * MASK_COLS));
  const row = Math.min(maskRows - 1, Math.floor(v * maskRows));
  return maskGrid[row * MASK_COLS + col] === 1;
}

// ───────────────────────────── Gif physics ─────────────────────────────
type PhysicsGif = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  // Its own personal "rest" point — where it spawned, or the last place it
  // was dropped after a drag. Gravity pulls it back here, not to the
  // screen's centre.
  homeX: number;
  homeY: number;
};

// Tunable feel — all in px/frame terms at ~60fps.
const GRAVITY = 0.0012; // pull toward its own home point, per frame (slow, gentle drift back)
const DAMPING = 0.9; // velocity kept per frame (friction/settling)
const PUSH_STRENGTH = 0.5; // how much of the dragger's speed transfers as a shove
const MIN_PUSH = 2; // guaranteed minimum nudge even on a slow bump
const SEPARATION = 3; // px nudged out of overlap per frame while touching
const COLLISION_SAMPLES = 6; // NxN sample grid inside any overlap box
const MAX_SPEED = 40; // velocity clamp so a hard hit can't blow up

function resolveCollision(dragged: PhysicsGif, other: PhysicsGif) {
  const overlapLeft = Math.max(dragged.x, other.x);
  const overlapTop = Math.max(dragged.y, other.y);
  const overlapRight = Math.min(dragged.x + dragged.width, other.x + other.width);
  const overlapBottom = Math.min(dragged.y + dragged.height, other.y + other.height);
  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) return;

  let touched = false;
  for (let sx = 0; sx < COLLISION_SAMPLES && !touched; sx++) {
    for (let sy = 0; sy < COLLISION_SAMPLES; sy++) {
      const px = overlapLeft + ((sx + 0.5) / COLLISION_SAMPLES) * (overlapRight - overlapLeft);
      const py = overlapTop + ((sy + 0.5) / COLLISION_SAMPLES) * (overlapBottom - overlapTop);
      const au = (px - dragged.x) / dragged.width;
      const av = (py - dragged.y) / dragged.height;
      const bu = (px - other.x) / other.width;
      const bv = (py - other.y) / other.height;
      if (isOpaqueAtUV(au, av) && isOpaqueAtUV(bu, bv)) {
        touched = true;
        break;
      }
    }
  }
  if (!touched) return;

  const acx = dragged.x + dragged.width / 2;
  const acy = dragged.y + dragged.height / 2;
  const bcx = other.x + other.width / 2;
  const bcy = other.y + other.height / 2;
  let dx = bcx - acx;
  let dy = bcy - acy;
  const dist = Math.hypot(dx, dy) || 1;
  dx /= dist;
  dy /= dist;

  const dragSpeed = Math.hypot(dragged.vx, dragged.vy);
  const kick = MIN_PUSH + dragSpeed * PUSH_STRENGTH;
  other.vx += dx * kick;
  other.vy += dy * kick;

  // Nudge it out of the overlap directly too, so a fast drag doesn't
  // visually pass through it before the velocity kick catches up.
  other.x += dx * SEPARATION;
  other.y += dy * SEPARATION;
}

const About = () => {
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [maskReady, setMaskReady] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const standalone = (window.navigator as any).standalone === true;
    setIsIos(ios && !standalone);
  }, []);

  useEffect(() => {
    loadMask(() => setMaskReady(true));
  }, []);

  const title = useDraggable({ x: 0, y: 32 });
  const [titleInitialized, setTitleInitialized] = useState(false);

  const [gifs, setGifs] = useState<PhysicsGif[]>([]);
  const nextId = useRef(1);
  const draggingIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<Pos>({ x: 0, y: 0 });
  const lastPointerRef = useRef<Pos>({ x: 0, y: 0 });

  // Once the mask (and with it, the real aspect ratio) is ready, place the
  // title and spawn the hero gif centred on screen. The hero's spawn spot
  // becomes its home too.
  useEffect(() => {
    if (!maskReady || titleInitialized) return;
    const titleEl = title.ref.current;
    if (!titleEl) return;
    const tw = titleEl.offsetWidth;
    title.setPos({ x: (window.innerWidth - tw) / 2, y: 32 });

    const heroWidth = Math.min(window.innerWidth * 0.8, (window.innerHeight * 0.7) / maskAspect);
    const heroHeight = heroWidth * maskAspect;
    const heroX = (window.innerWidth - heroWidth) / 2;
    const heroY = (window.innerHeight - heroHeight) / 2;
    setGifs([
      {
        id: 0,
        x: heroX,
        y: heroY,
        vx: 0,
        vy: 0,
        width: heroWidth,
        height: heroHeight,
        homeX: heroX,
        homeY: heroY,
      },
    ]);
    nextId.current = 1;
    setTitleInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maskReady, titleInitialized]);

  // Pointer tracking for whichever gif is currently grabbed. On release,
  // the dragged gif's home updates to wherever it was just dropped — so
  // gravity from then on pulls it back there, not to its original spawn.
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      const droppedId = draggingIdRef.current;
      if (droppedId !== null) {
        setGifs((prev) =>
          prev.map((g) => (g.id === droppedId ? { ...g, homeX: g.x, homeY: g.y } : g))
        );
      }
      draggingIdRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const handleGifPointerDown = useCallback((id: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    draggingIdRef.current = id;
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Main physics loop: gravity (toward each gif's own home point) + damping
  // for everything, direct pointer control for whichever gif is grabbed,
  // and collision only from the grabbed gif outward onto the rest.
  useEffect(() => {
    let rafId: number;

    const step = () => {
      setGifs((prev) => {
        if (prev.length === 0) {
          rafId = requestAnimationFrame(step);
          return prev;
        }

        const next = prev.map((g) => ({ ...g }));
        const draggingId = draggingIdRef.current;

        let dragged: PhysicsGif | undefined;
        if (draggingId !== null) {
          dragged = next.find((g) => g.id === draggingId);
          if (dragged) {
            const targetX = lastPointerRef.current.x - dragOffsetRef.current.x;
            const targetY = lastPointerRef.current.y - dragOffsetRef.current.y;
            dragged.vx = targetX - dragged.x;
            dragged.vy = targetY - dragged.y;
            dragged.x = targetX;
            dragged.y = targetY;
          }
        }

        for (const g of next) {
          if (g === dragged) continue;

          // Spring toward its own home position, not the screen centre.
          g.vx += (g.homeX - g.x) * GRAVITY;
          g.vy += (g.homeY - g.y) * GRAVITY;

          g.vx *= DAMPING;
          g.vy *= DAMPING;

          const speed = Math.hypot(g.vx, g.vy);
          if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            g.vx *= scale;
            g.vy *= scale;
          }

          g.x += g.vx;
          g.y += g.vy;
        }

        if (dragged) {
          for (const other of next) {
            if (other === dragged) continue;
            resolveCollision(dragged, other);
          }
        }

        return next;
      });

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const addGif = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const hero = gifs.find((g) => g.id === 0);
    const originalWidth = hero ? hero.width : Math.min(vw, vh);
    const maxW = originalWidth * 0.75;
    const minW = 30;

    const width = Math.round(minW + Math.random() * (maxW - minW));
    const height = width * maskAspect;
    // Random spawn point — this becomes its home, so gravity always
    // settles it back here (until it's dragged somewhere new).
    const x = Math.round(skewedRandom() * (vw - width));
    const y = Math.round(skewedRandom() * (vh - height));

    setGifs((prev) => [
      ...prev,
      { id: nextId.current++, x, y, vx: 0, vy: 0, width, height, homeX: x, homeY: y },
    ]);
  };

  return (
    <div
      className="relative w-full bg-[#FF69B4] px-4 overflow-hidden"
      style={{ minHeight: "200vh" }}
    >
      <div
        ref={title.ref}
        onPointerDown={title.onPointerDown}
        style={{
          ...sfPro,
          left: title.pos.x,
          top: title.pos.y,
          touchAction: "none",
        }}
        className="fixed text-4xl md:text-6xl font-bold text-white tracking-tight z-[6] whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
      >
        LET'S GET VISUAL
      </div>

      {gifs.map((g) => (
        <div
          key={g.id}
          onPointerDown={handleGifPointerDown(g.id)}
          style={{
            left: g.x,
            top: g.y,
            width: g.width,
            height: g.height,
            touchAction: "none",
            zIndex: draggingIdRef.current === g.id ? 30 : 10,
          }}
          className="fixed cursor-grab active:cursor-grabbing select-none"
        >
          <img
            src={profilePic}
            alt={g.id === 0 ? "Sid Caulfield" : ""}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      ))}

      <button
        onClick={addGif}
        style={sfPro}
        className="fixed bottom-4 left-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        ADD
      </button>

      {isIos && (
        <button
          onClick={() => setShowPrompt(true)}
          style={sfPro}
          className="fixed bottom-12 left-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
        >
          ADD TO HOME SCREEN
        </button>
      )}

      <Link
        to="/"
        style={sfPro}
        className="fixed bottom-4 right-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        BACK
      </Link>

      {showPrompt && (
        <div
          onClick={() => setShowPrompt(false)}
          className="fixed inset-0 z-[10000] bg-black/40 flex items-end justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={sfPro}
            className="bg-white text-black rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl"
          >
            <p className="m-0 mb-3 text-sm">
              Install this app: tap the <strong>Share</strong> icon{" "}
              <span className="text-xl align-middle">⎋</span> and then{" "}
              <strong>'Add to Home Screen'</strong>.
            </p>
            <button
              onClick={() => setShowPrompt(false)}
              className="mt-2 text-[#007AFF] font-bold text-sm uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
