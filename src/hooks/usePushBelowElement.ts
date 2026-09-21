import { useEffect, type RefObject } from "react";

/**
 * Ensures `targetRef`'s element never starts above `belowRef`'s bottom
 * edge plus `gapPx` — pushes it down with a computed marginTop when
 * needed, measured at runtime so it holds regardless of how much text
 * sits above it. Never pulls the element up if it's already lower than
 * that line. Only active at/above `minWidth` (the breakpoint where
 * `belowRef`'s element is actually rendered) — below it, no offset is
 * applied.
 */
export function usePushBelowElement(
  targetRef: RefObject<HTMLElement>,
  belowRef: RefObject<HTMLElement>,
  gapPx = 35,
  minWidth = 768
) {
  useEffect(() => {
    const target = targetRef.current;
    const below = belowRef.current;
    if (!target || !below) return;

    function apply() {
      if (window.innerWidth < minWidth) {
        target.style.marginTop = "";
        return;
      }
      // Reset first so the measurement isn't thrown off by a previous
      // frame's offset.
      target.style.marginTop = "";
      const belowRect = below.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const shortfall = belowRect.bottom + gapPx - targetRect.top;
      target.style.marginTop = shortfall > 0 ? `${Math.round(shortfall)}px` : "";
    }

    apply();

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);

    // Other async-loading content on the page can still shift layout
    // after this first measurement — recheck once everything has settled.
    const onLoad = () => apply();
    window.addEventListener("load", onLoad);
    if (document.readyState === "complete") onLoad();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, [targetRef, belowRef, gapPx, minWidth]);
}
