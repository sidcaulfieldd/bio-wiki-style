import { useEffect, useRef, useCallback } from 'react';

interface TrailRect {
  element: HTMLDivElement;
  x: number;
  y: number;
}

const CursorTrail = () => {
  const trailRectsRef = useRef<TrailRect[]>([]);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const totalDistanceRef = useRef(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const maxTrailRects = 6;
  const minDistance = 64;
  const trackingAreaHeight = 300;
  
  // Muted, normal color palette
  const colors = [
    '#8B9DC3', // muted blue
    '#C4A484', // tan/beige
    '#A8B5A0', // sage green
    '#D4A5A5', // dusty rose
    '#9B8AA0', // muted purple
    '#B8B8B8', // warm grey
  ];
  
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const randomSize = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;
  const randomOffset = () => (Math.random() - 0.5) * 20; // Small random offset for overlapping
  
  const createTrailRect = useCallback((x: number, y: number, prevRect?: TrailRect) => {
    const rect = document.createElement('div');
    rect.className = 'cursor-trail-rect';
    rect.style.position = 'fixed';
    rect.style.pointerEvents = 'none';
    rect.style.transition = 'opacity 0.4s ease-out';
    rect.style.zIndex = '999';
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
    
    // Position to slightly touch/overlap previous rect
    let finalX = x - width / 2 + randomOffset();
    let finalY = y - height / 2 + randomOffset();
    
    if (prevRect) {
      // Nudge towards previous rect for touching/overlapping effect
      const prevCenterX = prevRect.x;
      const prevCenterY = prevRect.y;
      const dx = x - prevCenterX;
      const dy = y - prevCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        // Move slightly towards previous rect
        const overlap = randomSize(5, 15);
        finalX = x - width / 2 - (dx / dist) * overlap + randomOffset();
        finalY = y - height / 2 - (dy / dist) * overlap + randomOffset();
      }
    }
    
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
      // When idle, fade out to only show last 2
      fadeOutOldRects(2);
    }, 300); // Wait 300ms before considering idle
  }, [fadeOutOldRects]);
  
  const isInTrackingArea = useCallback((y: number) => {
    return y >= 0 && y <= trackingAreaHeight;
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Reset idle timer on any movement
    startIdleTimer();
    
    if (!isInTrackingArea(e.clientY)) {
      lastPositionRef.current = null;
      totalDistanceRef.current = 0;
      return;
    }
    
    const lastPos = lastPositionRef.current;
    
    if (!lastPos) {
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      
      const newRect = createTrailRect(e.clientX, e.clientY);
      document.body.appendChild(newRect.element);
      trailRectsRef.current.push(newRect);
      return;
    }
    
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistanceRef.current += distance;
    
    if (totalDistanceRef.current >= minDistance) {
      const prevRect = trailRectsRef.current[trailRectsRef.current.length - 1];
      const newRect = createTrailRect(e.clientX, e.clientY, prevRect);
      document.body.appendChild(newRect.element);
      trailRectsRef.current.push(newRect);
      
      if (trailRectsRef.current.length > maxTrailRects) {
        const oldestRect = trailRectsRef.current.shift();
        if (oldestRect) {
          oldestRect.element.style.opacity = '0';
          setTimeout(() => oldestRect.element.remove(), 400);
        }
      }
      
      totalDistanceRef.current = 0;
    }
    
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  }, [createTrailRect, isInTrackingArea, startIdleTimer]);
  
  const handleMouseLeave = useCallback(() => {
    fadeOutOldRects(2);
    lastPositionRef.current = null;
    totalDistanceRef.current = 0;
  }, [fadeOutOldRects]);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up all trail rects
      trailRectsRef.current.forEach(rect => rect.element.remove());
      trailRectsRef.current = [];
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [handleMouseMove]);
  
  // Track when leaving the tracking area
  useEffect(() => {
    const checkTrackingArea = (e: MouseEvent) => {
      if (!isInTrackingArea(e.clientY) && trailRectsRef.current.length > 2) {
        handleMouseLeave();
      }
    };
    
    document.addEventListener('mousemove', checkTrackingArea);
    return () => document.removeEventListener('mousemove', checkTrackingArea);
  }, [isInTrackingArea, handleMouseLeave]);
  
  // Visual indicator for the tracking area (invisible but functional)
  return (
    <div 
      className="fixed top-0 left-0 w-full pointer-events-none"
      style={{ height: trackingAreaHeight }}
    />
  );
};

export default CursorTrail;
