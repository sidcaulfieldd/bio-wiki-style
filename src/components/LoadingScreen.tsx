import { useEffect, useRef } from "react";
import profilePic from "@/assets/profile_pic.gif";

interface LoadingScreenProps {
  onLoaded: () => void;
}

const ROWS = 8;
const COLS = 5;

const LETTER_DEFS: Record<string, { map: number[][]; order: [number, number][] }> = {
  L: {
    map: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    order: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[7,2],[7,3],[7,4]],
  },
  O: {
    map: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    order: [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,3],[7,2],[7,1],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0]],
  },
  A: {
    map: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    order: [[7,0],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,1],[0,2],[0,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[3,1],[3,2],[3,3]],
  },
  D: {
    map: [[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0]],
    order: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[7,2],[6,3],[5,4],[4,4],[3,4],[2,4],[1,3],[0,2],[0,1]],
  },
  I: {
    map: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
    order: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,4],[7,3],[7,2],[7,1],[7,0]],
  },
  N: {
    map: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    order: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[1,1],[2,2],[3,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4]],
  },
  G: {
    map: [[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    order: [[0,3],[0,2],[0,1],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,1],[7,2],[7,3],[6,4],[5,4],[4,4],[3,4],[3,3],[3,2]],
  },
};

const WORD = ["L", "O", "A", "D", "I", "N", "G"];

const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Build grid, collect all active boxes in order across the whole word
    const allBoxes: HTMLDivElement[] = [];

    WORD.forEach((ch) => {
      const def = LETTER_DEFS[ch];
      const letterEl = document.createElement("div");
      letterEl.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},18px);gap:4px;`;

      const cellGrid: (HTMLDivElement | null)[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(null)
      );

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement("div");
          const active = def.map[r][c] === 1;
          if (active) {
            cell.style.cssText = [
              "width:18px;height:18px",
              "border:2px solid #000",
              "border-radius:2px",
              "background:#fff",
              "display:flex;align-items:center;justify-content:center",
              "box-shadow:0 2px 0 0 #000",
              "flex-shrink:0",
              "transition:background 0.08s",
            ].join(";");
            cell.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="opacity:0"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            cellGrid[r][c] = cell;
          } else {
            cell.style.cssText = "width:18px;height:18px;";
          }
          letterEl.appendChild(cell);
        }
      }

      wrapper.appendChild(letterEl);
      def.order.forEach(([r, c]) => {
        const box = cellGrid[r][c];
        if (box) allBoxes.push(box);
      });
    });

    const tickBox = (box: HTMLDivElement) => {
      box.style.background = "#3366cc";
      box.style.borderColor = "#3366cc";
      box.style.boxShadow = "0 2px 0 0 #1a4a9e";
      const svg = box.querySelector("svg") as SVGElement | null;
      if (svg) svg.style.opacity = "1";
    };

    const setTicked = (count: number) => {
      allBoxes.forEach((box, i) => {
        if (i < count) tickBox(box);
      });
    };

    // Fake progress crawl with two deliberate pauses to look like it's struggling
    let settled = false;
    let fakePct = 0;
    let pausing = false;

    // Pause at ~30% for 600ms, again at ~65% for 900ms
    const PAUSES = [
      { at: 30, duration: 600 },
      { at: 65, duration: 900 },
    ];
    let nextPauseIdx = 0;

    const tick = setInterval(() => {
      if (settled || pausing) return;

      const next = Math.min(fakePct + Math.random() * 12 + 4, 90);

      // Check if we've crossed a pause threshold
      if (nextPauseIdx < PAUSES.length && next >= PAUSES[nextPauseIdx].at) {
        fakePct = PAUSES[nextPauseIdx].at;
        pausing = true;
        const { duration } = PAUSES[nextPauseIdx];
        nextPauseIdx++;
        setTimeout(() => { pausing = false; }, duration);
      } else {
        fakePct = next;
      }

      setTicked(Math.round((fakePct / 100) * allBoxes.length));
    }, 150);

    const finish = () => {
      if (settled) return;
      settled = true;
      clearInterval(tick);
      // Rapid-fire remaining boxes then fade
      const remaining = allBoxes.slice(Math.round((fakePct / 100) * allBoxes.length));
      remaining.forEach((box, i) => setTimeout(() => tickBox(box), i * 18));
      setTimeout(() => {
        if (outerRef.current) outerRef.current.style.opacity = "0";
        setTimeout(onLoaded, 400);
      }, remaining.length * 18 + 50);
    };

    const img = new Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = profilePic;

    const fallback = setTimeout(finish, 8000);

    return () => {
      clearInterval(tick);
      clearTimeout(fallback);
    };
  }, [onLoaded]);

  return (
    <div
      ref={outerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f6f6",
        opacity: 1,
        transition: "opacity 0.4s ease",
      }}
    >
      <div style={{ transform: "scale(0.5)", transformOrigin: "center center" }}>
        <div
          ref={wrapperRef}
          style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
