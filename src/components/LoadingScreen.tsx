import { useEffect, useRef } from "react";
import profilePic from "@/assets/profile_pic.gif";

interface LoadingScreenProps {
  onLoaded: () => void;
}

const ROWS = 8;
const COLS = 5;

const LETTER_DEFS: Record<string, { map: number[][]; order: [number, number][] }> = {
  L: {
    map: [
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,1],
    ],
    order: [
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
      [7,0],[7,1],[7,2],[7,3],[7,4],
    ],
  },
  O: {
    map: [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0],
    ],
    order: [
      [0,1],[0,2],[0,3],
      [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
      [7,3],[7,2],[7,1],
      [6,0],[5,0],[4,0],[3,0],[2,0],[1,0],
    ],
  },
  A: {
    map: [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
    ],
    order: [
      [7,0],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],
      [0,1],[0,2],[0,3],
      [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
      [3,1],[3,2],[3,3],
    ],
  },
  D: {
    map: [
      [1,1,1,0,0],
      [1,0,0,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,1,0],
      [1,1,1,0,0],
    ],
    order: [
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
      [7,1],[7,2],
      [6,3],[5,4],[4,4],[3,4],[2,4],
      [1,3],
      [0,2],[0,1],
    ],
  },
  I: {
    map: [
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [1,1,1,1,1],
    ],
    order: [
      [0,0],[0,1],[0,2],[0,3],[0,4],
      [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
      [7,4],[7,3],[7,2],[7,1],[7,0],
    ],
  },
  N: {
    map: [
      [1,0,0,0,1],
      [1,1,0,0,1],
      [1,0,1,0,1],
      [1,0,0,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
    ],
    order: [
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
      [1,1],[2,2],[3,3],
      [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
    ],
  },
  G: {
    map: [
      [0,1,1,1,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0],
    ],
    order: [
      [0,3],[0,2],[0,1],
      [1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
      [7,1],[7,2],[7,3],
      [6,4],[5,4],[4,4],[3,4],[3,3],[3,2],
    ],
  },
};

const WORD = ["L", "O", "A", "D", "I", "N", "G"];

const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tickTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTicks = () => {
    tickTimeouts.current.forEach(clearTimeout);
    tickTimeouts.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    tickTimeouts.current.push(t);
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Build the grid and collect ordered box refs per letter
    const letterBoxGroups: HTMLDivElement[][] = [];

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
      const ordered = def.order
        .map(([r, c]) => cellGrid[r][c])
        .filter((el): el is HTMLDivElement => el !== null);
      letterBoxGroups.push(ordered);
    });

    // Tick a single letter's boxes in order, call onDone when finished
    const tickLetter = (boxes: HTMLDivElement[], onDone: () => void) => {
      let i = 0;
      const next = () => {
        if (i >= boxes.length) { onDone(); return; }
        const box = boxes[i];
        box.style.background = "#3366cc";
        box.style.borderColor = "#3366cc";
        box.style.boxShadow = "0 2px 0 0 #1a4a9e";
        const svg = box.querySelector("svg") as SVGElement | null;
        if (svg) svg.style.opacity = "1";
        i++;
        schedule(next, 42);
      };
      next();
    };

    // Tick letters one after another
    const tickAll = (letterIndex: number) => {
      if (letterIndex >= letterBoxGroups.length) return;
      tickLetter(letterBoxGroups[letterIndex], () => {
        if (letterIndex + 1 < letterBoxGroups.length) {
          schedule(() => tickAll(letterIndex + 1), 80);
        }
      });
    };

    tickAll(0);

    // Wait for the gif to load, then fade out
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      // Let all remaining boxes tick to completion before fading
      const allBoxes = letterBoxGroups.flat();
      const unticked = allBoxes.filter(
        (b) => b.style.background !== "rgb(51, 102, 204)"
      );
      let delay = unticked.length * 42;
      schedule(() => {
        if (outerRef.current) outerRef.current.style.opacity = "0";
        schedule(onLoaded, 400);
      }, delay);
    };

    const img = new Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = profilePic;

    const fallback = setTimeout(finish, 8000);

    return () => {
      clearTicks();
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
      <div
        ref={wrapperRef}
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
        }}
      />
    </div>
  );
};

export default LoadingScreen;
