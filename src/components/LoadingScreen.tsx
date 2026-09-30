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

// Each letter is COLS cells wide with (COLS-1) gaps between cells, plus
// letterGap between letters. Total width = 7*(COLS*cell + (COLS-1)*gap) + 6*letterGap.
// We solve for cell size so the whole word fits within the available width.
function computeCellSize(availableWidth: number) {
  const letterGap = 8;    // gap between letters (px)
  const cellGap = 3;      // gap between cells within a letter (px)
  const numLetters = WORD.length;          // 7
  const cellsPerLetter = COLS;             // 5
  // width of one letter = cellsPerLetter*cell + (cellsPerLetter-1)*cellGap
  // total = numLetters * letterWidth + (numLetters-1) * letterGap
  // availableWidth >= numLetters*(cellsPerLetter*cell + (cellsPerLetter-1)*cellGap) + (numLetters-1)*letterGap
  // solve for cell:
  const cell = Math.floor(
    (availableWidth - (numLetters - 1) * letterGap - numLetters * (cellsPerLetter - 1) * cellGap) /
    (numLetters * cellsPerLetter)
  );
  // clamp: min 8px so it's still visible, max 18px (the original desktop size)
  return Math.min(18, Math.max(8, cell));
}

const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Use 88vw as available width so there's a comfortable margin on both sides
    const availableWidth = window.innerWidth * 0.88;
    const cell = computeCellSize(availableWidth);
    const cellGap = Math.max(2, Math.round(cell * 0.18));   // ~18% of cell, min 2
    const letterGap = Math.max(4, cell * 0.44);             // ~44% of cell, min 4

    // Build grid
    const allBoxes: HTMLDivElement[] = [];

    WORD.forEach((ch) => {
      const def = LETTER_DEFS[ch];
      const letterEl = document.createElement("div");
      letterEl.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},${cell}px);gap:${cellGap}px;`;

      const cellGrid: (HTMLDivElement | null)[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(null)
      );

      const svgSize = Math.round(cell * 0.56);
      const strokeW = Math.max(1.2, cell * 0.1);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cellEl = document.createElement("div");
          const active = def.map[r][c] === 1;
          if (active) {
            cellEl.style.cssText = [
              `width:${cell}px;height:${cell}px`,
              "border:2px solid #000",
              "border-radius:2px",
              "background:#fff",
              "display:flex;align-items:center;justify-content:center",
              "box-shadow:0 2px 0 0 #000",
              "flex-shrink:0",
              "transition:background 0.08s",
            ].join(";");
            cellEl.innerHTML = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 10 10" fill="none" style="opacity:0"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            cellGrid[r][c] = cellEl;
          } else {
            cellEl.style.cssText = `width:${cell}px;height:${cell}px;`;
          }
          letterEl.appendChild(cellEl);
        }
      }

      wrapper.appendChild(letterEl);
      def.order.forEach(([r, c]) => {
        const box = cellGrid[r][c];
        if (box) allBoxes.push(box);
      });
    });

    // Apply letter gap to the wrapper
    wrapper.style.gap = `${letterGap}px`;

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

    let settled = false;
    let fakePct = 0;
    let pausing = false;

    const PAUSES = [
      { at: 30, duration: 600 },
      { at: 65, duration: 900 },
    ];
    let nextPauseIdx = 0;

    const tick = setInterval(() => {
      if (settled || pausing) return;

      const next = Math.min(fakePct + Math.random() * 12 + 4, 90);

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
      {/* No more scale() hack — cells are sized at compute time to fit the viewport */}
      <div
        ref={wrapperRef}
        style={{ display: "flex", alignItems: "flex-start" }}
      />
    </div>
  );
};

export default LoadingScreen;
