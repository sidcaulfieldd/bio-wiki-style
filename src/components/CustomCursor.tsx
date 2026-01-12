import { useEffect, useState, useCallback } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => setIsVisible(false), []);
  const handleMouseEnter = useCallback(() => setIsVisible(true), []);

  // Force re-apply cursor:none after context menu closes
  const handleContextMenu = useCallback(() => {
    // The context menu briefly shows native cursor, so we ensure our styles persist
    const reapplyCursor = () => {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    };
    
    // Apply immediately and after small delays to catch context menu close
    reapplyCursor();
    setTimeout(reapplyCursor, 10);
    setTimeout(reapplyCursor, 100);
    setTimeout(reapplyCursor, 300);
  }, []);

  // Handle when context menu closes (click anywhere or escape)
  const handleClick = useCallback(() => {
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [updatePosition, handleMouseLeave, handleMouseEnter, handleContextMenu, handleClick, handleKeyDown]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[99999]"
      style={{
        left: position.x - 14,
        top: position.y - 14,
        width: 28,
        height: 28,
      }}
    >
      <img
        src="/mouse.png"
        alt=""
        className="w-full h-full"
        draggable={false}
      />
    </div>
  );
};

export default CustomCursor;
