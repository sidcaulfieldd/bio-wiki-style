import { useEffect, useRef, useState } from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  displayHeight?: number;
  className?: string;
}

const PixelatedImage = ({ src, alt, displayHeight = 230, className = '' }: PixelatedImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelation, setPixelation] = useState(1);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = windowHeight / 2;
      
      // Calculate distance from center of screen
      const distanceFromCenter = Math.abs(elementCenter - screenCenter);
      const buffer = 200; // 200 pixel buffer zone for full resolution
      const maxDistance = windowHeight / 2 + rect.height / 2;
      
      // Calculate pixelation level (0-1)
      // Within 200px of center, pixelation = 0 (full resolution)
      // When element is far away, pixelation = 1 (very pixelated)
      const effectiveDistance = Math.max(0, distanceFromCenter - buffer);
      const normalizedDistance = Math.min(effectiveDistance / (maxDistance - buffer), 1);
      
      setPixelation(normalizedDistance);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calculate grid size based on pixelation
  // At max pixelation: 9x16 pixels
  // At min pixelation: 1080x1920 pixels (full resolution)
  const minWidth = 9;
  const maxWidth = 1080;
  const minHeight = 16;
  const maxHeight = 1920;
  
  const currentWidth = minWidth + (maxWidth - minWidth) * (1 - pixelation);
  const currentHeight = minHeight + (maxHeight - minHeight) * (1 - pixelation);
  
  // Calculate display dimensions maintaining 9:16 aspect ratio
  const aspectRatio = 9 / 16;
  const displayWidth = displayHeight * aspectRatio;
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: `${displayWidth}px`, 
        height: `${displayHeight}px`
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            imageRendering: 'pixelated',
            transform: `scale(${displayWidth / currentWidth})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};

export default PixelatedImage;
