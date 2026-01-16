import { useEffect, useRef, useState } from 'react';

interface TrailRect {
  element: HTMLDivElement;
  x: number;
  y: number;
}

export const CursorTrail = ({ isPlaying }: { isPlaying: boolean }) => {
  const trailRectsRef = useRef<TrailRect[]>([]);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastScrollRef = useRef<number>(0);
  const totalDistanceRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  const currentMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const rhythmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const maxTrailRects = 7;
  const minDistance = 64;
  const bpm = 119;
  const beatInterval = 60000 / bpm; // ~504ms for 119 BPM
  
  const colors = [
    '#b0fb90', '#FF69B4', '#FFFFFF', '#0745AD',
    '#F8F9FA', '#020817', '#EBECF0'
  ];
  
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const randomSize = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;
  const randomOffset = (range: number) => (Math.random() - 0.5) * range;
  
  const createTrailRect = (x: number, y: number, isRhythmMode: boolean = false, isScrollCreated: boolean = false) => {
    const rect = document.createElement('div');
    rect.className = 'cursor-trail-rect';
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
    
    let finalX: number, finalY: number;
    
    if (isScrollCreated) {
      rect.style.position = 'absolute';
      const offsetX = randomOffset(128);
      const offsetY = randomOffset(64);
      finalX = x + offsetX - width / 2;
      finalY = y + window.scrollY + offsetY - height / 2;
      rect.style.left = finalX + 'px';
      rect.style.top = finalY + 'px';
    } else {
      rect.style.position = 'fixed';
      
      if (isRhythmMode) {
        finalX = x - width / 2;
        finalY = y - height / 2;
      } else {
        const offsetX = randomOffset(64);
        const offsetY = randomOffset(64);
        finalX = x + offsetX - width / 2;
        finalY = y + offsetY - height / 2;
      }
      
      rect.style.left = finalX + 'px';
      rect.style.top = finalY + 'px';
    }
    
    return { element: rect, x, y };
  };
  
  const addNewRect = (x: number, y: number, isRhythmMode: boolean = false, isScrollCreated: boolean = false) => {
    const newRect = createTrailRect(x, y, isRhythmMode, isScrollCreated);
    document.body.appendChild(newRect.element);
    trailRectsRef.current.push(newRect);
    
    if (trailRectsRef.current.length > maxTrailRects) {
      const oldestRect = trailRectsRef.current.shift();
      if (oldestRect) {
        oldestRect.element.remove();
      }
    }
  };
  
  const createRandomRect = () => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    addNewRect(x, y, true);
  };
  
  // Handle rhythm-based rectangle creation when playing
  useEffect(() => {
    // Clear any existing interval first
    if (rhythmIntervalRef.current) {
      clearInterval(rhythmIntervalRef.current);
      rhythmIntervalRef.current = null;
    }
    
    if (isPlaying) {
      rhythmIntervalRef.current = setInterval(() => {
        createRandomRect();
      }, beatInterval);
    }
    
    return () => {
      if (rhythmIntervalRef.current) {
        clearInterval(rhythmIntervalRef.current);
        rhythmIntervalRef.current = null;
      }
    };
  }, [isPlaying, beatInterval]);
  
  // Mouse and scroll handlers
  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    
    const handleMouseMove = (e: MouseEvent) => {
      currentMousePosRef.current = { x: e.clientX, y: e.clientY };
      
      // CRITICAL: Don't create rectangles on mouse movement if music is playing
      if (isPlaying) {
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      
      const lastPos = lastPositionRef.current;
      
      if (!lastPos) {
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
        addNewRect(e.clientX, e.clientY, false);
        return;
      }
      
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalDistanceRef.current += distance;
      
      if (totalDistanceRef.current >= minDistance) {
        addNewRect(e.clientX, e.clientY, false);
        totalDistanceRef.current = 0;
      }
      
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleScroll = () => {
      // CRITICAL: Don't create rectangles on scroll if music is playing
      if (isPlaying) return;
      
      const currentScroll = window.scrollY;
      const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);
      const mousePos = currentMousePosRef.current;
      
      scrollDistanceRef.current += scrollDelta;
      
      if (mousePos && scrollDistanceRef.current >= minDistance) {
        addNewRect(mousePos.x, mousePos.y, false, true);
        scrollDistanceRef.current = 0;
      }
      
      lastScrollRef.current = currentScroll;
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 || e.clientY > window.innerHeight || 
          e.clientX < 0 || e.clientX > window.innerWidth) {
        if (!isPlaying) {
          lastPositionRef.current = null;
          totalDistanceRef.current = 0;
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      
      trailRectsRef.current.forEach(rect => rect.element.remove());
      trailRectsRef.current = [];
    };
  }, [isPlaying]); // CRITICAL: Added isPlaying to dependencies
  
  return null;
};

// Hook to detect Spotify embed clicks
export const useSpotifyPlayDetection = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) {
        setIsPlaying(prev => !prev);
      }
    };
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [iframeRef]);
  
  return isPlaying;
};

export default CursorTrail;
