import { useEffect, useRef, useState, useCallback } from "react";
import profilePic from "@/assets/profile_pic.gif";
import { Link } from "react-router-dom";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

type Pos = { x: number; y: number };

// ───────────────────────── Title drag (unchanged) ─────────────────────────
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

const skewedRandom = () => {
  const r = Math.random();
  return Math.random() < 0.5 ? Math.pow(r, 0.3) : 1 - Math.pow(r, 0.3);
};

// ───────────────────── Shared transparency-aware mask ─────────────────────
const MASK_COLS = 28;
let maskGrid: Uint8Array | null = null;
let maskRows = 0;
let maskAspect = 1;
let maskLoadStarted = false;

function loadMask(onReady: () => void) {
  if (maskGrid) { onReady(); return; }
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
    if (!ctx) { onReady(); return; }
    ctx.drawImage(img, 0, 0, MASK_COLS, maskRows);
    const { data } = ctx.getImageData(0, 0, MASK_COLS, maskRows);
    const grid = new Uint8Array(MASK_COLS * maskRows);
    for (let i = 0; i < MASK_COLS * maskRows; i++) {
      grid[i] = data[i * 4 + 3] > 40 ? 1 : 0;
    }
    maskGrid = grid;
    onReady();
  };
  img.onerror = () => onReady();
  img.src = profilePic;
}

function isOpaqueAtUV(u: number, v: number): boolean {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  if (!maskGrid) return true;
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
  // No homeX/homeY — gifs travel freely in whatever direction they were hit
};

// Physics constants — tuned for golden syrup feel
const FRICTION = 0.88;        // aggressive drag, speed bleeds fast like moving through thick liquid
const WALL_BOUNCE = 0.18;     // walls are basically dead — hit and slump, barely any rebound
const DRAG_LERP = 0.18;       // how fast the gif catches up to the pointer (0=frozen, 1=instant)
const PUSH_STRENGTH = 0.35;   // collisions transfer less force — heavy, not snappy
const MIN_PUSH = 1.5;         // smaller minimum nudge for sluggish collision feel
const SEPARATION = 2;         // px nudged out of overlap per frame
const COLLISION_SAMPLES = 6;  // NxN sample grid inside any overlap box
const MAX_SPEED = 18;         // lower top speed — nothing moves fast in syrup

function getContactDirection(a: PhysicsGif, b: PhysicsGif): { dx: number; dy: number } | null {
  const overlapLeft = Math.max(a.x, b.x);
  const overlapTop = Math.max(a.y, b.y);
  const overlapRight = Math.min(a.x + a.width, b.x + b.width);
  const overlapBottom = Math.min(a.y + a.height, b.y + b.height);
  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) return null;

  let touched = false;
  for (let sx = 0; sx < COLLISION_SAMPLES && !touched; sx++) {
    for (let sy = 0; sy < COLLISION_SAMPLES; sy++) {
      const px = overlapLeft + ((sx + 0.5) / COLLISION_SAMPLES) * (overlapRight - overlapLeft);
      const py = overlapTop + ((sy + 0.5) / COLLISION_SAMPLES) * (overlapBottom - overlapTop);
      if (isOpaqueAtUV((px - a.x) / a.width, (py - a.y) / a.height) &&
          isOpaqueAtUV((px - b.x) / b.width, (py - b.y) / b.height)) {
        touched = true;
        break;
      }
    }
  }
  if (!touched) return null;

  const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
  const dy = (b.y + b.height / 2) - (a.y + a.height / 2);
  const dist = Math.hypot(dx, dy) || 1;
  return { dx: dx / dist, dy: dy / dist };
}

function resolveCollision(dragged: PhysicsGif, other: PhysicsGif) {
  const contact = getContactDirection(dragged, other);
  if (!contact) return;
  const { dx, dy } = contact;
  const dragSpeed = Math.hypot(dragged.vx, dragged.vy);
  const kick = MIN_PUSH + dragSpeed * PUSH_STRENGTH;
  other.vx += dx * kick;
  other.vy += dy * kick;
  other.x += dx * SEPARATION;
  other.y += dy * SEPARATION;
}

function preventOverlap(a: PhysicsGif, b: PhysicsGif, aIsDragged: boolean, bIsDragged: boolean) {
  const contact = getContactDirection(a, b);
  if (!contact) return;
  const { dx, dy } = contact;
  if (aIsDragged) {
    b.x += dx * SEPARATION;
    b.y += dy * SEPARATION;
  } else if (bIsDragged) {
    a.x -= dx * SEPARATION;
    a.y -= dy * SEPARATION;
  } else {
    a.x -= dx * (SEPARATION / 2);
    a.y -= dy * (SEPARATION / 2);
    b.x += dx * (SEPARATION / 2);
    b.y += dy * (SEPARATION / 2);
  }
}

const About = () => {
  const [maskReady, setMaskReady] = useState(false);

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
      },
    ]);
    nextId.current = 1;
    setTitleInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maskReady, titleInitialized]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      draggingIdRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const handleGifPointerDown = useCallback(
    (id: number) => (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      draggingIdRef.current = id;
      dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    },
    []
  );

  useEffect(() => {
    let rafId: number;

    const step = () => {
      setGifs((prev) => {
        if (prev.length === 0) {
          rafId = requestAnimationFrame(step);
          return prev;
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const next = prev.map((g) => ({ ...g }));
        const draggingId = draggingIdRef.current;

        let dragged: PhysicsGif | undefined;
        if (draggingId !== null) {
          dragged = next.find((g) => g.id === draggingId);
          if (dragged) {
            const targetX = lastPointerRef.current.x - dragOffsetRef.current.x;
            const targetY = lastPointerRef.current.y - dragOffsetRef.current.y;
            // Lerp toward pointer instead of snapping — gif lags behind like honey
            const newX = dragged.x + (targetX - dragged.x) * DRAG_LERP;
            const newY = dragged.y + (targetY - dragged.y) * DRAG_LERP;
            dragged.vx = newX - dragged.x;
            dragged.vy = newY - dragged.y;
            dragged.x = newX;
            dragged.y = newY;
          }
        }

        for (const g of next) {
          if (g === dragged) continue;

          // No gravity — just friction to bleed off speed over time
          g.vx *= FRICTION;
          g.vy *= FRICTION;

          // Clamp speed
          const speed = Math.hypot(g.vx, g.vy);
          if (speed > MAX_SPEED) {
            g.vx *= MAX_SPEED / speed;
            g.vy *= MAX_SPEED / speed;
          }

          // Stop dead if barely moving — higher threshold since syrup decelerates slowly
          if (speed < 0.15) {
            g.vx = 0;
            g.vy = 0;
          }

          g.x += g.vx;
          g.y += g.vy;

          // Wall bouncing — reflect velocity in the hit axis, lose some energy
          if (g.x < 0) {
            g.x = 0;
            g.vx *= -WALL_BOUNCE;
          } else if (g.x + g.width > vw) {
            g.x = vw - g.width;
            g.vx *= -WALL_BOUNCE;
          }

          if (g.y < 0) {
            g.y = 0;
            g.vy *= -WALL_BOUNCE;
          } else if (g.y + g.height > vh) {
            g.y = vh - g.height;
            g.vy *= -WALL_BOUNCE;
          }
        }

        // Collision: dragged gif knocks others in its travel direction
        if (dragged) {
          for (const other of next) {
            if (other === dragged) continue;
            resolveCollision(dragged, other);
          }
        }

        // Always-on overlap prevention for every pair
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            preventOverlap(next[i], next[j], next[i] === dragged, next[j] === dragged);
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
    const x = Math.round(skewedRandom() * (vw - width));
    const y = Math.round(skewedRandom() * (vh - height));

    setGifs((prev) => [
      ...prev,
      { id: nextId.current++, x, y, vx: 0, vy: 0, width, height },
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

      <Link
        to="/"
        style={sfPro}
        className="fixed bottom-4 right-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        BACK
      </Link>
    </div>
  );
};

export default About;
