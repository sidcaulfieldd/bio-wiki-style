import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor";
import CursorTrail from "./components/CursorTrail";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const focusSinkRef = useRef<HTMLButtonElement>(null);
  const lastIframeFocusedRef = useRef(false);

  // Best-effort Spotify play/pause toggle detection:
  // Each interaction focuses the iframe; we detect that, toggle isPlaying,
  // then move focus away so the next click can be detected again.
  useEffect(() => {
    const findSpotifyIframe = () =>
      document.querySelector<HTMLIFrameElement>(
        'iframe[src*="open.spotify.com/embed"]'
      );

    const intervalId = window.setInterval(() => {
      const iframe = findSpotifyIframe();
      const isFocused = !!iframe && document.activeElement === iframe;

      if (isFocused && !lastIframeFocusedRef.current) {
        setIsPlaying((prev) => !prev);
        lastIframeFocusedRef.current = true;
        window.setTimeout(() => focusSinkRef.current?.focus(), 0);
      } else if (!isFocused) {
        lastIframeFocusedRef.current = false;
      }
    }, 200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <button
        ref={focusSinkRef}
        tabIndex={-1}
        aria-hidden="true"
        className="fixed left-[-9999px] top-[-9999px] h-px w-px opacity-0"
      >
        focus
      </button>
      <CustomCursor />
      <CursorTrail isPlaying={isPlaying} />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
