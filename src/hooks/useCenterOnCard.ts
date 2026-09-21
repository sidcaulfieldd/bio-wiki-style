import { useEffect, type RefObject } from "react";

/**
 * Horizontally centers `targetRef`'s element on `cardRef`'s element by
 * measuring both at runtime and applying a computed translateX — instead
 * of a hardcoded pixel guess that breaks whenever the layout (sidebar
 * width, gaps, viewport) changes. Only applies at/above `minWidth` (the
 * breakpoint where the sidebar is actually present); below it, elements
 * already center correctly via plain flexbox with no offset needed.
 */
export function useCenterOnCard(
  targetRef: RefObject<HTMLElement>,
  cardRef: RefObject<HTMLElement>,
  minWidth = 768
) {
  useEffect(() => {
    const target = targetRef.current;
    const card = cardRef.current;
    if (!target || !card) return;

    function apply() {
      if (window.innerWidth < minWidth) {
        target.style.transform = "";
        return;
      }
      // Reset first so the measurement isn't thrown off by a previous
      // frame's offset.
      target.style.transform = "";
      const cardRect = card.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const targetCenter = targetRect.left + targetRect.width / 2;
      const delta = Math.round(cardCenter - targetCenter);
      target.style.transform = `translateX(${delta}px)`;
    }

    apply();

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);

    // Other async-loading content on the page can still shift layout after
    // this first measurement — recheck once everything has settled.
    const onLoad = () => apply();
    window.addEventListener("load", onLoad);
    if (document.readyState === "complete") onLoad();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, [targetRef, cardRef, minWidth]);
}
