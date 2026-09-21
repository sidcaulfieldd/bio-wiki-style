import { useEffect, type RefObject } from "react";

/**
 * Horizontally aligns `targetRef`'s element to the left, right or centre
 * of `cardRef`'s element, inset by `paddingPx` on whichever edge it's
 * aligning to — measured at runtime and applied as a translateX, the
 * same technique useCenterOnCard uses, generalised to all three
 * alignments. "left" just clears any transform, since plain flow already
 * puts things at the left edge of their container. Only applies at/above
 * `minWidth` (the breakpoint where the sidebar is actually present);
 * below it, elements already sit correctly via plain flexbox.
 */
export function useAlignOnCard(
  targetRef: RefObject<HTMLElement>,
  cardRef: RefObject<HTMLElement>,
  align: "left" | "right" | "center",
  paddingPx = 24,
  minWidth = 768
) {
  useEffect(() => {
    const target = targetRef.current;
    const card = cardRef.current;
    if (!target || !card) return;

    function apply() {
      if (window.innerWidth < minWidth || align === "left") {
        target.style.transform = "";
        return;
      }
      // Reset first so the measurement isn't thrown off by a previous
      // frame's offset.
      target.style.transform = "";
      const cardRect = card.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      let delta = 0;
      if (align === "center") {
        const cardCenter = cardRect.left + cardRect.width / 2;
        const targetCenter = targetRect.left + targetRect.width / 2;
        delta = cardCenter - targetCenter;
      } else {
        // right
        delta = cardRect.right - paddingPx - targetRect.right;
      }
      target.style.transform = `translateX(${Math.round(delta)}px)`;
    }

    apply();

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);

    const onLoad = () => apply();
    window.addEventListener("load", onLoad);
    if (document.readyState === "complete") onLoad();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, [targetRef, cardRef, align, paddingPx, minWidth]);
}
