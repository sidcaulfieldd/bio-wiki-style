import { useEffect, useState } from "react";
import profilePic from "@/assets/profile_pic.gif";
import { Link } from "react-router-dom";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const About = () => {
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const standalone = (window.navigator as any).standalone === true;
    setIsIos(ios && !standalone);
  }, []);

  return (
    <div className="relative w-full bg-[#FF69B4] px-4" style={{ minHeight: "200vh" }}>
      <h1
        style={sfPro}
        className="fixed top-8 left-1/2 -translate-x-1/2 text-4xl md:text-6xl font-bold text-white text-center tracking-tight z-[6] whitespace-nowrap"
      >
        LET'S GET VISUAL
      </h1>
      <div className="min-h-screen flex items-center justify-center pt-24">
        <img
          src={profilePic}
          alt="Sid Caulfield"
          className="max-w-full max-h-[70vh] object-contain relative z-10"
        />
      </div>

      {isIos && (
        <button
          onClick={() => setShowPrompt(true)}
          style={sfPro}
          className="fixed bottom-4 left-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
        >
          ADD TO HOME SCREEN
        </button>
      )}

      <Link
        to="/"
        style={sfPro}
        className="fixed bottom-4 right-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        BACK
      </Link>

      {showPrompt && (
        <div
          onClick={() => setShowPrompt(false)}
          className="fixed inset-0 z-[10000] bg-black/40 flex items-end justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={sfPro}
            className="bg-white text-black rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl"
          >
            <p className="m-0 mb-3 text-sm">
              Install this app: tap the <strong>Share</strong> icon{" "}
              <span className="text-xl align-middle">⎋</span> and then{" "}
              <strong>'Add to Home Screen'</strong>.
            </p>
            <button
              onClick={() => setShowPrompt(false)}
              className="mt-2 text-[#007AFF] font-bold text-sm uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
