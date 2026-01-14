import { useEffect, useRef, useCallback } from 'react';

interface TrailRect {
  element: HTMLDivElement;
  x: number;
  y: number;
}

const CursorTrail = () => {
  const trailRectsRef = useRef<TrailRect[]>([]);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastScrollRef = useRef<number>(0);
  const totalDistanceRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  const currentMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  const maxTrailRects = 7;
  const minDistance = 64;
  
  // Updated color palette
  const colors = [
    '#b0fb90', // green
    '#FF69B4', // hot pink
    '#FFFFFF', // white
    '#0745AD', // blue
    '#F8F9FA', // light gray
    '#020817', // dark blue/black
    '#EBECF0'  // light blue gray
  ];
  
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const randomSize = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;
  const randomOffset = (range: number) => (Math.random() - 0.5) * range;
  
  const createTrailRect = useCallback((x: number, y: number, isScrollCreated: boolean = false) => {
    const rect = document.createElement('div');
    rect.className = 'cursor-trail-rect';
    // z-index 5: behind body text (z-10) and profile pic (z-10), but in front of headings/images
    rect.style.zIndex = '5';
    rect.style.borderRadius = '2px';
    rect.style.pointerEvents = 'none';
    
    const isHorizontal = randomBool();
    let width: number, height: number;
    
    if (isHorizontal) {
      width = randomSize(40, 120);
      height = randomSize(8, 25);
    } else {
      width = randomSize(8, 25);
      height = randomSize(40, 120);
    }
    
    rect.style.width = width + 'px';
    rect.style.height = height + 'px';
    rect.style.backgroundColor = randomColor();
    
    // Position based on whether it's scroll-created or mouse-created
    if (isScrollCreated) {
      // For scroll: use absolute positioning with random offset (128x64 area)
      rect.style.position = 'absolute';
      const offsetX = randomOffset(128); // ±64 pixels horizontally
      const offsetY = randomOffset(64);  // ±32 pixels vertically
      const finalX = x + offsetX - width / 2;
      const finalY = y + window.scrollY + offsetY - height / 2;
      rect.style.left = finalX + 'px';
      rect.style.top = finalY + 'px';
    } else {
      // For mouse movement: use fixed positioning with random offset (64x64 area)
      rect.style.position = 'fixed';
      const offsetX = randomOffset(64); // ±32 pixels horizontally
      const offsetY = randomOffset(64); // ±32 pixels vertically
      const finalX = x + offsetX - width / 2;
      const finalY = y + offsetY - height / 2;
      rect.style.left = finalX + 'px';
      rect.style.top = finalY + 'px';
    }
    
    return { element: rect, x, y };
  }, []);
  
  const addNewRect = useCallback((x: number, y: number, isScrollCreated: boolean = false) => {
    const newRect = createTrailRect(x, y, isScrollCreated);
    document.body.appendChild(newRect.element);
    trailRectsRef.current.push(newRect);
    
    if (trailRectsRef.current.length > maxTrailRects) {
      const oldestRect = trailRectsRef.current.shift();
      if (oldestRect) {
        oldestRect.element.remove();
      }
    }
  }, [createTrailRect]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    currentMousePosRef.current = { x: e.clientX, y: e.clientY };
    
    const lastPos = lastPositionRef.current;
    
    if (!lastPos) {
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      addNewRect(e.clientX, e.clientY);
      return;
    }
    
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistanceRef.current += distance;
    
    if (totalDistanceRef.current >= minDistance) {
      addNewRect(e.clientX, e.clientY);
      totalDistanceRef.current = 0;
    }
    
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  }, [addNewRect]);
  
  const handleScroll = useCallback(() => {
    const currentScroll = window.scrollY;
    const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);
    const mousePos = currentMousePosRef.current;
    
    // Accumulate scroll distance
    scrollDistanceRef.current += scrollDelta;
    
    // Create a rectangle every 64 pixels of scrolling
    if (mousePos && scrollDistanceRef.current >= minDistance) {
      // Create rectangle at current mouse position with absolute positioning
      // so it stays on the page while the mouse scrolls away from it
      addNewRect(mousePos.x, mousePos.y, true);
      scrollDistanceRef.current = 0;
    }
    
    lastScrollRef.current = currentScroll;
  }, [addNewRect]);
  
  const handleMouseLeave = useCallback(() => {
    lastPositionRef.current = null;
    totalDistanceRef.current = 0;
  }, []);
  
  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      
      trailRectsRef.current.forEach(rect => rect.element.remove());
      trailRectsRef.current = [];
    };
  }, [handleMouseMove, handleScroll]);
  
  useEffect(() => {
    const checkMouseLeave = (e: MouseEvent) => {
      // Only reset position tracking if mouse leaves the window
      if (e.clientY < 0 || e.clientY > window.innerHeight || 
          e.clientX < 0 || e.clientX > window.innerWidth) {
        handleMouseLeave();
      }
    };
    
    document.addEventListener('mousemove', checkMouseLeave);
    return () => document.removeEventListener('mousemove', checkMouseLeave);
  }, [handleMouseLeave]);
  
  return null;
};

export default CursorTrail;
