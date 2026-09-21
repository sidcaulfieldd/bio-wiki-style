import { useEffect, useRef, useState } from "react";
import profilePic from "@/assets/profile_pic.gif";

interface LoadingScreenProps {
  onLoaded: () => void;
}

// Full page-blocking loader, styled to match the ones used elsewhere on the
// site (blackbird-application.tsx, blackbirdapplication.tsx, Scratch.tsx,
// DanceScroll.tsx): a black-bordered pill with a live percentage, fading out
// over 0.4s once the asset is ready. The one difference kept intentionally
// is the backing — grey (#f6f6f6, the page's own background) instead of
// white, so it doesn't flash white before the page underneath appears.
const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(true);
  const loaderTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let settled = false;
    let fakePct = 0;

    // There's only one asset to wait on (no real byte-progress to report),
    // so we tick a believable-looking progress number up toward 90% while
    // waiting, then snap to 100% the instant the gif actually finishes.
    const tick = setInterval(() => {
      if (settled) return;
      fakePct = Math.min(fakePct + Math.random() * 15 + 5, 90);
      setPct(Math.round(fakePct));
    }, 150);

    const img = new Image();
    const finish = () => {
      if (settled) return;
      settled = true;
      clearInterval(tick);
      setPct(100);
      setVisible(false);
      setTimeout(onLoaded, 400);
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = profilePic;

    // Safety net in case load/error never fires for some reason.
    const fallback = setTimeout(finish, 8000);

    return () => {
      clearInterval(tick);
      clearTimeout(fallback);
    };
  }, [onLoaded]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f6f6",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        ref={loaderTextRef}
        style={{
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          background: "#ffffff",
          color: "#000000",
          border: "3px solid #000000",
          borderRadius: "999px",
          padding: "16px 36px",
          fontWeight: 800,
          fontSize: 20,
          boxShadow: "0 4px 0 0 #000000",
        }}
      >
        LOADING… {pct}%
      </div>
    </div>
  );
};

export default LoadingScreen;
