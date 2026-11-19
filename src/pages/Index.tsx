import { useEffect, useRef, useState, type RefObject } from "react";
import rightVid from "@/assets/right_side_website_vid.mp4";
import leftVid from "@/assets/left_side_website_vid.mp4";

// Temporary holding page: just the white card, the walking videos either
// side, and a "back in a min" message.
const Index = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Preload the two side videos in the background.
  useEffect(() => {
    [rightVid, leftVid].forEach((src) => {
      const v = document.createElement("video");
      v.preload = "auto";
      v.src = src;
    });
  }, []);

  // Same cursor override as the full page: native cursor back, mouse.png
  // dot hidden. Removed on unmount so other pages are unaffected.
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "index-cursor-override";
    style.textContent = `
      html, body, * { cursor: auto !important; }
      img[src="/mouse.png"] { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <main className="max-w-[1000px] mx-auto px-4">
        {/* Card runs the full height of the window (no top/bottom border,
            so it reads as touching the edges); text centered inside it. */}
        <div
          ref={cardRef}
          data-cursor-trail-card
          className="w-full min-h-screen bg-white border-x border-[#a7d7f9] p-6 relative flex items-center justify-center"
        >
          {/* 15px = half the previous text-3xl (30px). */}
          <p className="text-[15px] font-serif text-center leading-snug relative z-10">
            Back in a min.
            <br />
            While you wait,{" "}
            <a href="/LETSGETVISUAL" className="text-[#0645ad] hover:underline">
              let's get visual
            </a>
            .
          </p>

          {/* Walking easter egg — desktop only, tethered to card edges */}
          <WalkingSid cardRef={cardRef} />
        </div>
      </main>
    </div>
  );
};

const WalkingSid = ({ cardRef }: { cardRef: RefObject<HTMLDivElement> }) => {
  // Positive pushes the videos further down from true viewport-center; negative pushes up.
  const VERTICAL_OFFSET = 25;
  // How long to wait, after the right-side video finishes, before the
  // whole left-then-right sequence plays again.
  const REPLAY_INTERVAL_MS = 30000;
  // Delay before the very first play after the page loads.
  const FIRST_PLAY_DELAY_MS = 5000;

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  // Bumped to replay the sequence; used as a React key so the <video>
  // elements remount and autoplay again from frame 0.
  const [cycle, setCycle] = useState(0);
  const [leftGap, setLeftGap] = useState(0);
  const [rightGap, setRightGap] = useState(0);
  const [leftTop, setLeftTop] = useState(0);
  const [rightTop, setRightTop] = useState(0);

  useEffect(() => {
    const update = () => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const nextLeftGap = Math.round(rect.left);
      const nextRightGap = Math.round(window.innerWidth - rect.right);
      setLeftGap(nextLeftGap);
      setRightGap(nextRightGap);

      const leftHeight = Math.round((nextLeftGap * 16) / 9);
      const rightHeight = Math.round((nextRightGap * 16) / 9);

      // Center each video vertically in the current viewport.
      setLeftTop(Math.round(window.innerHeight / 2 - rect.top - leftHeight / 2) + VERTICAL_OFFSET);
      setRightTop(Math.round(window.innerHeight / 2 - rect.top - rightHeight / 2) + VERTICAL_OFFSET);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [cardRef]);

  useEffect(() => {
    if (cycle === 0) {
      const t = setTimeout(() => setShowLeft(true), FIRST_PLAY_DELAY_MS);
      return () => clearTimeout(t);
    }
    setShowLeft(true);
  }, [cycle]);

  const leftHeight = Math.round((leftGap * 16) / 9);
  const rightHeight = Math.round((rightGap * 16) / 9);

  return (
    <div className="hidden md:block pointer-events-none">
      {showLeft && (
        <div
          key={`left-${cycle}`}
          className="absolute overflow-hidden"
          style={{
            width: `${leftGap}px`,
            height: `${leftHeight}px`,
            right: "calc(100% + 1px)",
            top: `${leftTop}px`,
          }}
        >
          <video
            src={leftVid}
            autoPlay
            muted
            playsInline
            className="block w-full h-full object-cover"
            style={{ transform: "scale(1.005)" }}
            onEnded={(e) => {
              e.currentTarget.pause();
              setShowLeft(false);
              setTimeout(() => setShowRight(true), 2400);
            }}
          />
        </div>
      )}
      {showRight && (
        <div
          key={`right-${cycle}`}
          className="absolute overflow-hidden"
          style={{
            width: `${rightGap}px`,
            height: `${rightHeight}px`,
            left: "calc(100% + 1px)",
            top: `${rightTop}px`,
          }}
        >
          <video
            src={rightVid}
            autoPlay
            muted
            playsInline
            className="block w-full h-full object-cover"
            style={{ transform: "scale(1.005)" }}
            onEnded={(e) => {
              e.currentTarget.pause();
              setShowRight(false);
              setTimeout(() => setCycle((c) => c + 1), REPLAY_INTERVAL_MS);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
