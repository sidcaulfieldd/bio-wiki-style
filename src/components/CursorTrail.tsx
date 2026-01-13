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
  const trackingAreaHeight = 300;
  
  // Color palette from original code
  const colors = [
    '#b0fb90', // green
    '#f7dc9f', // yellow
    '#b27558', // orange
    '#0059ff', // blue
    '#241f21', // black
    '#a0a0a0'  // grey
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
    // z-index 5: behind text (z-index 10+) but in front of images/lines
    rect.style.zIndex = '5';
    rect.style.borderRadius = '2px';
    
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
  
  const isInTrackingArea = useCallback((y: number) => {
    return y >= 0 && y <= trackingAreaHeight;
  }, []);
  
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
    
    if (!isInTrackingArea(e.clientY)) {
      lastPositionRef.current = null;
      totalDistanceRef.current = 0;
      return;
    }
    
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
  }, [addNewRect, isInTrackingArea, startIdleTimer]);
  
  const handleScroll = useCallback(() => {
    const currentScroll = window.scrollY;
    const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);
    const mousePos = currentMousePosRef.current;
    
    // Only create trail if mouse is in tracking area and we have a position
    if (mousePos && isInTrackingArea(mousePos.y) && scrollDelta >= minDistance) {
      addNewRect(mousePos.x, mousePos.y);
      lastScrollRef.current = currentScroll;
      startIdleTimer();
    }
  }, [addNewRect, isInTrackingArea, startIdleTimer]);
  
  const handleMouseLeave = useCallback(() => {
    fadeOutOldRects(2);
    lastPositionRef.current = null;
    totalDistanceRef.current = 0;
  }, [fadeOutOldRects]);
  
  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
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
    const checkTrackingArea = (e: MouseEvent) => {
      if (!isInTrackingArea(e.clientY) && trailRectsRef.current.length > 2) {
        handleMouseLeave();
      }
    };
    
    document.addEventListener('mousemove', checkTrackingArea);
    return () => document.removeEventListener('mousemove', checkTrackingArea);
  }, [isInTrackingArea, handleMouseLeave]);
  
  return (
    <div 
      className="fixed top-0 left-0 w-full pointer-events-none"
      style={{ height: trackingAreaHeight }}
    />
  );
};

export default CursorTrail;
