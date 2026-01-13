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
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  const maxTrailRects = 6;
  const minDistance = 64;
  
  // Updated color palette with one additional color
  const colors = [
    '#b0fb90', // green
    '#f7dc9f', // yellow
    '#b27558', // orange
    '#0059ff', // blue
    '#241f21', // black
    '#a0a0a0', // grey
    '#FF69B4'  // hot pink (new color)
  ];
  
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const randomSize = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;
  
  const createTrailRect = useCallback((x: number, y: number) => {
    const rect = document.createElement('div');
    rect.className = 'cursor-trail-rect';
    rect.style.position = 'fixed';
    rect.style.pointerEvents = 'none';
    rect.style.transition = 'opacity 0.4s ease-out';
    // Lower z-index to ensure it stays behind text
    rect.style.zIndex = '1';
    rect.style.borderRadius = '2px';
    rect.style.opacity = '0.8';
    
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
    
    // Position at cursor
    const finalX = x - width / 2;
    const finalY = y - height / 2;
    
    rect.style.left = finalX + 'px';
    rect.style.top = finalY + 'px';
    
    return { element: rect, x, y };
  }, []);
  
  const fadeOutOldRects = useCallback((keepCount: number) => {
    const rectsToRemove = trailRectsRef.current.length - keepCount;
    
    if (rectsToRemove > 0) {
      for (let i = 0; i < rectsToRemove; i++) {
        const oldRect = trailRectsRef.current.shift();
        if (oldRect) {
          oldRect.element.style.opacity = '0';
          setTimeout(() => oldRect.element.remove(), 400);
        }
      }
    }
  }, []);
  
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      fadeOutOldRects(2);
    }, 300);
  }, [fadeOutOldRects]);
  
  const addNewRect = useCallback((x: number, y: number) => {
    const newRect = createTrailRect(x, y);
    document.body.appendChild(newRect.element);
    trailRectsRef.current.push(newRect);
    
    if (trailRectsRef.current.length > maxTrailRects) {
      const oldestRect = trailRectsRef.current.shift();
      if (oldestRect) {
        oldestRect.element.style.opacity = '0';
        setTimeout(() => oldestRect.element.remove(), 400);
      }
    }
  }, [createTrailRect]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    startIdleTimer();
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
  }, [addNewRect, startIdleTimer]);
  
  const handleScroll = useCallback(() => {
    const currentScroll = window.scrollY;
    const scrollDelta = currentScroll - lastScrollRef.current;
    const mousePos = currentMousePosRef.current;
    
    // Create trail on scroll if mouse position exists
    if (mousePos && Math.abs(scrollDelta) >= 15) {
      // As you scroll down (positive delta), place rectangles above cursor
      // As you scroll up (negative delta), place rectangles below cursor
      // This creates the "trailing" effect
      const trailY = mousePos.y - (scrollDelta * 0.5);
      
      addNewRect(mousePos.x, trailY);
      lastScrollRef.current = currentScroll;
      startIdleTimer();
    }
  }, [addNewRect, startIdleTimer]);
  
  const handleMouseLeave = useCallback(() => {
    fadeOutOldRects(2);
    lastPositionRef.current = null;
    totalDistanceRef.current = 0;
  }, [fadeOutOldRects]);
  
  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      
      trailRectsRef.current.forEach(rect => rect.element.remove());
      trailRectsRef.current = [];
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [handleMouseMove, handleScroll]);
  
  useEffect(() => {
    const checkMouseLeave = (e: MouseEvent) => {
      // Fade out if mouse leaves the window
      if (e.clientY < 0 || e.clientY > window.innerHeight || 
          e.clientX < 0 || e.clientX > window.innerWidth) {
        if (trailRectsRef.current.length > 2) {
          handleMouseLeave();
        }
      }
    };
    
    document.addEventListener('mousemove', checkMouseLeave);
    return () => document.removeEventListener('mousemove', checkMouseLeave);
  }, [handleMouseLeave]);
  
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default CursorTrail;
