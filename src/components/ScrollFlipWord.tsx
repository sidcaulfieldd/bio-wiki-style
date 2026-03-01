import { useEffect, useRef, useState, CSSProperties } from "react";
import { useScrollFlipWord } from "@/hooks/useScrollFlipWord";

interface ScrollFlipWordProps {
  /** The word that locks in when scrolled to — defines the fixed pill width */
  heroWord: string;
  /** Full list of words to cycle through on scroll */
  list: string[];
  /** Font family string — must match the surrounding paragraph exactly */
  fontFamily?: string;
  /** Font size in px — if omitted, inherits from parent */
  fontSize?: number;
  /** Extra class names on the wrapper span */
  className?: string;
}

/**
 * ScrollFlipWord
 *
 * Inline word that flips through a list as you scroll toward it,
 * locks to the hero word when it hits the centre of the viewport,
 * and stays locked as you continue scrolling past.
 *
 * The pill width is fixed to the hero word's rendered pixel width,
 * and each flip word's font-size is scaled to fill that exact width.
 *
 * Usage:
 *   <ScrollFlipWord
 *     heroWord="strangers"
 *     list={STRANGERS_LIST}
 *     fontFamily="Georgia, serif"
 *     fontSize={18}
 *   />
 */
export function ScrollFlipWord({
  heroWord,
  list,
  fontFamily = "Georgia, 'Times New Roman', serif",
  fontSize,
  className = "",
}: ScrollFlipWordProps) {
  const { ref, currentWord, isHero } = useScrollFlipWord(list, heroWord);

  // ── measure hero word width once fonts are ready ──────────────────────────
  const [heroWidth, setHeroWidth]   = useState<number | null>(null);
  const [fontSizes, setFontSizes]   = useState<Record<string, number>>({});
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      const ruler = rulerRef.current;
      if (!ruler) return;

      const fs = fontSize ?? parseFloat(getComputedStyle(ruler).fontSize);
      ruler.style.fontSize   = fs + "px";
      ruler.style.fontFamily = fontFamily;
      ruler.style.fontStyle  = "italic";

      // Measure hero word
      ruler.textContent = heroWord;
      const heroW = ruler.offsetWidth;
      setHeroWidth(heroW);

      // Binary-search the font-size that makes each word hit heroW px wide
      function fitSize(word: string): number {
        let lo = 4, hi = fs * 3;
        for (let i = 0; i < 24; i++) {
          const mid = (lo + hi) / 2;
          ruler!.style.fontSize = mid + "px";
          ruler!.textContent = word;
          if (ruler!.offsetWidth < heroW) lo = mid;
          else hi = mid;
        }
        return (lo + hi) / 2;
      }

      const sizes: Record<string, number> = { [heroWord]: fs };
      list.forEach(w => { sizes[w] = fitSize(w); });
      setFontSizes(sizes);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    } else {
      window.addEventListener("load", measure, { once: true });
    }
  }, [heroWord, list, fontFamily, fontSize]);

  // ── styles ─────────────────────────────────────────────────────────────────
  const wrapperStyle: CSSProperties = {
    display: "inline-block",
    verticalAlign: "baseline",
    width: heroWidth ? heroWidth + "px" : "auto",
    position: "relative",
  };

  const pillStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    width: "100%",
    height: "1.18em",
    background: isHero ? "#c8441a" : "#1a1a1a",
    color: isHero ? "#fff" : "#f5f0e8",
    borderRadius: "3px",
    fontStyle: "italic",
    overflow: "hidden",
    verticalAlign: "baseline",
    position: "relative",
    top: "0.05em",
    transition: "background 0.1s, color 0.1s",
  };

  const innerStyle: CSSProperties = {
    display: "inline-block",
    whiteSpace: "nowrap",
    lineHeight: 1,
    fontFamily,
    fontSize: fontSizes[currentWord] ? fontSizes[currentWord] + "px" : "inherit",
  };

  return (
    <>
      {/* Hidden ruler for measurements — invisible, zero-size */}
      <span
        ref={rulerRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          top: 0,
          left: 0,
        }}
        aria-hidden="true"
      />
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={className}
        style={wrapperStyle}
        aria-label={heroWord}
      >
        <span style={pillStyle}>
          <span style={innerStyle}>{currentWord}</span>
        </span>
      </span>
    </>
  );
}
