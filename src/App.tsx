import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import CustomCursor from "./components/CustomCursor";
import CursorTrail from "./components/CursorTrail";

// Site is temporarily in holding mode: only the placeholder (/) and
// LET'S GET VISUAL are live. Every other address — including
// /E-PORTFOLIO, /blackbirdapplication, /blackbird-application and
// /scratch — redirects to the placeholder. The page files themselves are
// untouched in src/pages; to bring them back, restore the imports and
// <Route> lines from git history.
const queryClient = new QueryClient();
const AppContent = () => {
  return (
    <>
      <CustomCursor />
      <CursorTrail />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/LETSGETVISUAL" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
