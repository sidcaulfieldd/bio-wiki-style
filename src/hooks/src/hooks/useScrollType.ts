import { useEffect, useRef, useState } from "react";

/**
 * useScrollType
 * Tracks how many characters of `text` should be "visible"
 * based on how far the attached element has scrolled into the viewport.
 *
 * Returns { ref, displayed } — attach `ref` to your element,
 * and render `displayed` as the visible text.
 */
export function useScrollType(text: string) {
  const ref = useRef<HTMLElement>(null);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      const rect = el!.getBoundingClientRect();
      const winH = window.innerHeight;

      // Start revealing when element enters bottom of screen
      // Finish when element reaches 60% from top of screen
      const startY = winH;
      const endY = winH * 0.6;

      const raw = (rect.top - endY) / (startY - endY);
      const progress = 1 - Math.min(1, Math.max(0, raw));
      const count = Math.round(progress * text.length);

      setDisplayed(text.slice(0, count));
    }

    window.addEventListener("scroll", update, { passive: true });
    update(); // run once on mount in case already in view

    return () => window.removeEventListener("scroll", update);
  }, [text]);

  return { ref, displayed };
}
