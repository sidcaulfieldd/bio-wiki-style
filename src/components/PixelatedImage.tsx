import { useEffect, useRef, useState, useCallback } from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  displayHeight?: number;
  className?: string;
}

const PixelatedImage = ({ src, alt, displayHeight = 480, className = '' }: PixelatedImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelation, setPixelation] = useState(1);
  const requestRunningRef = useRef(false);
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current || requestRunningRef.current) return;
    
    requestRunningRef.current = true;
    requestAnimationFrame(() => {
      if (!containerRef.current) {
        requestRunningRef.current = false;
        return;
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = windowHeight / 2;
      
      // Calculate distance from center of screen
      const distanceFromCenter = Math.abs(elementCenter - screenCenter);
      const buffer = 400; // 400 pixel buffer zone for full resolution
      const maxDistance = windowHeight / 1.2;
      
      // Calculate pixelation level (0-1)
      // Within 400px of center, pixelation = 0 (full resolution)
      // When element is far away, pixelation = 1 (very pixelated)
      let normalizedDistance = 0;
      if (distanceFromCenter > buffer) {
        normalizedDistance = Math.min((distanceFromCenter - buffer) / (maxDistance - buffer), 1);
      }
      
      setPixelation(normalizedDistance);
      requestRunningRef.current = false;
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Calculate grid size based on pixelation
  // At max pixelation: 9 pixels wide
  // At min pixelation: 1080 pixels wide (full resolution)
  const minWidth = 9;
  const maxWidth = 1080;
  
  const currentWidth = minWidth + (maxWidth - minWidth) * (1 - pixelation);
  // Strict 9:16 aspect ratio to prevent squishing
  const currentHeight = currentWidth * (16 / 9);
  
  // Calculate display dimensions maintaining 9:16 aspect ratio
  const aspectRatio = 9 / 16;
  const displayWidth = displayHeight * aspectRatio;
  
  // Scale factor to fill the container
  const scale = displayWidth / currentWidth;
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: `${displayWidth}px`, 
        height: `${displayHeight}px`
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          imageRendering: 'pixelated',
          // @ts-ignore - vendor prefix
          WebkitImageRendering: 'pixelated',
          // @ts-ignore - vendor prefix  
          MozImageRendering: '-moz-crisp-edges',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          objectFit: 'fill',
        }}
      />
    </div>
  );
};

export default PixelatedImage;
