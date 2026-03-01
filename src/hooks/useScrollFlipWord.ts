import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useScrollFlipWord
 *
 * Tracks scroll position relative to an element and returns:
 * - which word from the list to show
 * - whether the hero word is locked in
 *
 * Lock behaviour:
 * - Once the element crosses the centre of the viewport scrolling DOWN → locks to hero word
 * - Only unlocks if the element goes back BELOW the centre (user scrolled back up)
 */
export function useScrollFlipWord(list: string[], heroWord: string) {
  const ref = useRef<HTMLElement>(null);
  const [currentWord, setCurrentWord] = useState(list[0]);
  const [isHero, setIsHero] = useState(false);
  const lockedRef = useRef(false); // tracks lock state without triggering re-renders

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const winH  = window.innerHeight;
    const elMidY = rect.top + rect.height / 2;
    const centre = winH / 2;
    const HERO_HALF = 100; // px either side of centre = hero zone

    const inHeroZone = Math.abs(elMidY - centre) < HERO_HALF;
    const aboveCentre = elMidY < centre - HERO_HALF; // scrolled past, element is above

    if (inHeroZone || (lockedRef.current && aboveCentre)) {
      // Lock in hero word once it hits centre, keep locked as it travels above
      if (!lockedRef.current) lockedRef.current = true;
      setIsHero(true);
      setCurrentWord(heroWord);
    } else if (!lockedRef.current) {
      // Below centre — still flipping
      setIsHero(false);
      const raw  = (winH * 1.05 - elMidY) / (winH * 1.1);
      const prog = Math.min(1, Math.max(0, raw));
      const idx  = Math.min(Math.floor(prog * list.length), list.length - 1);
      setCurrentWord(list[idx]);
    } else {
      // Unlocked — element is back below centre
      lockedRef.current = false;
      setIsHero(false);
      setCurrentWord(list[0]);
    }
  }, [list, heroWord]);

  useEffect(() => {
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [update]);

  return { ref, currentWord, isHero };
}
