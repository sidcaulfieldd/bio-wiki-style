import { useEffect, useRef, useState, CSSProperties } from "react";
import { useScrollFlipWord } from "@/hooks/useScrollFlipWord";

interface ScrollFlipWordProps {
  heroWord: string;
  list: string[];
  fontFamily?: string;
  fontSize?: number;
  className?: string;
}

export function ScrollFlipWord({
  heroWord,
  list,
  fontFamily = "Georgia, 'Times New Roman', serif",
  fontSize,
  className = "",
}: ScrollFlipWordProps) {
  const { ref, currentWord, isHero } = useScrollFlipWord(list, heroWord);

  const [heroWidth, setHeroWidth] = useState<number | null>(null);
  const [fontSizes, setFontSizes] = useState<Record<string, number>>({});
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      const ruler = rulerRef.current;
      if (!ruler) return;

      const fs = fontSize ?? parseFloat(getComputedStyle(ruler).fontSize);
      ruler.style.fontSize   = fs + "px";
      ruler.style.fontFamily = fontFamily;
      ruler.style.fontStyle  = "normal";
      ruler.style.fontWeight = "normal";

      ruler.textContent = heroWord;
      const heroW = ruler.offsetWidth;
      setHeroWidth(heroW);

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

  const wrapperStyle: CSSProperties = {
    display: "inline-block",
    verticalAlign: "baseline",
    width: heroWidth ? heroWidth + "px" : "auto",
    position: "relative",
    textAlign: "center",
  };

  const innerStyle: CSSProperties = {
    display: "inline-block",
    whiteSpace: "nowrap",
    lineHeight: "inherit",
    fontFamily,
    fontStyle: "normal",
    fontWeight: "normal",
    // Flip words are muted, hero word snaps to full text colour
    color: isHero ? "inherit" : "#9a9a9a",
    fontSize: fontSizes[currentWord] ? fontSizes[currentWord] + "px" : "inherit",
    transition: "color 0.15s",
  };

  return (
    <>
      {/* Hidden ruler */}
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
        <span style={innerStyle}>{currentWord}</span>
      </span>
    </>
  );
}
