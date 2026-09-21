import { useEffect, useRef } from 'react';

interface TrailRect {
  element: HTMLDivElement;
  x: number;
  y: number;
}

export const CursorTrail = () => {
  const trailRectsRef = useRef<TrailRect[]>([]);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastScrollRef = useRef<number>(0);
  const totalDistanceRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  const currentMousePosRef = useRef<{ x: number; y: number } | null>(null);

  const maxTrailRects = 7;
  const minDistance = 64;

  const colors = [
    "#b0fb90",
    "#FF69B4",
    "#FFFFFF",
    "#0745AD",
    "#F8F9FA",
    "#020817",
    "#EBECF0",
  ];

  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const randomSize = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;
  const randomOffset = (range: number) => (Math.random() - 0.5) * range;

  // Restricts where the trail is allowed to spawn to three zones:
  //   1. the pink backing behind the profile gif (data-cursor-trail-zone)
  //   2. the grey page backing once the cursor leaves the white card
  //      (anything outside [data-cursor-trail-card])
  //   3. the bottom Notable Projects gif / dance video containers
  //      (also data-cursor-trail-zone)
  //
  // Pages that don't mark up a card (i.e. anything other than the home
  // page) fall back to the old "always on" behaviour.
  const pointInRect = (x: number, y: number, rect: DOMRect) =>
    x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

  const isInAllowedZone = (clientX: number, clientY: number) => {
    const card = document.querySelector<HTMLElement>("[data-cursor-trail-card]");

    // No card marked up on this page — preserve legacy "show everywhere".
    if (!card) return true;

    const zones = document.querySelectorAll<HTMLElement>("[data-cursor-trail-zone]");
    for (const zone of zones) {
      if (pointInRect(clientX, clientY, zone.getBoundingClientRect())) return true;
    }

    // Outside the white card entirely = over the grey backing.
    return !pointInRect(clientX, clientY, card.getBoundingClientRect());
  };

  const createTrailRect = (
    x: number,
    y: number,
    isScrollCreated: boolean = false
  ) => {
    const rect = document.createElement("div");
    rect.className = "cursor-trail-rect";

    // Keep trail BETWEEN pink background (z=2) and the profile GIF (z=20)
    rect.style.zIndex = "5";
    rect.style.borderRadius = "2px";
    rect.style.pointerEvents = "none";

    const isHorizontal = randomBool();
    const width = isHorizontal ? randomSize(40, 120) : randomSize(8, 25);
    const height = isHorizontal ? randomSize(8, 25) : randomSize(40, 120);

    rect.style.width = width + "px";
    rect.style.height = height + "px";
    rect.style.backgroundColor = randomColor();

    // ALL rectangles use absolute positioning to stick to the page
    rect.style.position = "absolute";
    
    let finalX: number;
    let finalY: number;

    if (isScrollCreated) {
      // Scroll mode: wider horizontal scatter
      const offsetX = randomOffset(128);
      const offsetY = randomOffset(64);
      finalX = x + offsetX - width / 2;
      finalY = y + window.scrollY + offsetY - height / 2;
    } else {
      // Mouse mode: tighter scatter, but still absolute (sticks to page)
      const offsetX = randomOffset(64);
      const offsetY = randomOffset(64);
      finalX = x + offsetX - width / 2;
      finalY = y + window.scrollY + offsetY - height / 2;
    }
    
    rect.style.left = finalX + "px";
    rect.style.top = finalY + "px";

    return { element: rect, x, y };
  };

  const addNewRect = (
    x: number,
    y: number,
    isScrollCreated: boolean = false
  ) => {
    const newRect = createTrailRect(x, y, isScrollCreated);
    document.body.appendChild(newRect.element);
    trailRectsRef.current.push(newRect);

    // One-in / one-out (always 7 max)
    if (trailRectsRef.current.length > maxTrailRects) {
      const oldestRect = trailRectsRef.current.shift();
      oldestRect?.element.remove();
    }
  };

  useEffect(() => {
    lastScrollRef.current = window.scrollY;

    const handleMouseMove = (e: MouseEvent) => {
      currentMousePosRef.current = { x: e.clientX, y: e.clientY };

      const lastPos = lastPositionRef.current;

      if (!lastPos) {
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
        if (isInAllowedZone(e.clientX, e.clientY)) {
          addNewRect(e.clientX, e.clientY, false);
        }
        return;
      }

      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalDistanceRef.current += distance;

      if (totalDistanceRef.current >= minDistance) {
        if (isInAllowedZone(e.clientX, e.clientY)) {
          addNewRect(e.clientX, e.clientY, false);
        }
        totalDistanceRef.current = 0;
      }

      lastPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);
      const mousePos = currentMousePosRef.current;

      scrollDistanceRef.current += scrollDelta;

      if (mousePos && scrollDistanceRef.current >= minDistance) {
        if (isInAllowedZone(mousePos.x, mousePos.y)) {
          addNewRect(mousePos.x, mousePos.y, true);
        }
        scrollDistanceRef.current = 0;
      }

      lastScrollRef.current = currentScroll;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY < 0 ||
        e.clientY > window.innerHeight ||
        e.clientX < 0 ||
        e.clientX > window.innerWidth
      ) {
        lastPositionRef.current = null;
        totalDistanceRef.current = 0;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousemove", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);

      trailRectsRef.current.forEach((rect) => rect.element.remove());
      trailRectsRef.current = [];
    };
  }, []);

  return null;
};

export default CursorTrail;
