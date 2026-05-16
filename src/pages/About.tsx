import { useEffect, useRef, useState } from "react";
import profilePic from "@/assets/profile_pic.gif";
import { Link } from "react-router-dom";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

type Pos = { x: number; y: number };

const useDraggable = (initial: Pos) => {
  const [pos, setPos] = useState<Pos>(initial);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef<Pos>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragging.current = true;
  };

  return { ref, pos, setPos, onPointerDown };
};

type GifItem = { id: number; x: number; y: number; width: number };

const DraggableGif = ({
  initial,
  width,
  src,
}: {
  initial: Pos;
  width: number;
  src: string;
}) => {
  const d = useDraggable(initial);
  return (
    <div
      ref={d.ref}
      onPointerDown={d.onPointerDown}
      style={{ left: d.pos.x, top: d.pos.y, width, touchAction: "none" }}
      className="fixed z-10 cursor-grab active:cursor-grabbing select-none"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-auto object-contain pointer-events-none"
      />
    </div>
  );
};

const About = () => {
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const standalone = (window.navigator as any).standalone === true;
    setIsIos(ios && !standalone);
  }, []);

  const title = useDraggable({ x: 0, y: 32 });
  const gif = useDraggable({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const [extraGifs, setExtraGifs] = useState<GifItem[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (initialized) return;
    const titleEl = title.ref.current;
    const gifEl = gif.ref.current;
    if (!titleEl || !gifEl) return;
    const tw = titleEl.offsetWidth;
    const gw = gifEl.offsetWidth;
    const gh = gifEl.offsetHeight;
    title.setPos({ x: (window.innerWidth - tw) / 2, y: 32 });
    gif.setPos({ x: (window.innerWidth - gw) / 2, y: (window.innerHeight - gh) / 2 });
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addGif = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxDim = Math.min(vw, vh) * 0.95;
    const width = Math.round(30 + Math.random() * (maxDim - 30));
    const x = Math.round(-width * 0.3 + Math.random() * (vw + width * 0.6 - width));
    const y = Math.round(-width * 0.3 + Math.random() * (vh + width * 0.6 - width));
    setExtraGifs((g) => [...g, { id: nextId.current++, x, y, width }]);
  };

  return (
    <div className="relative w-full bg-[#FF69B4] px-4 overflow-hidden" style={{ minHeight: "200vh" }}>
      <div
        ref={title.ref}
        onPointerDown={title.onPointerDown}
        style={{
          ...sfPro,
          left: title.pos.x,
          top: title.pos.y,
          touchAction: "none",
        }}
        className="fixed text-4xl md:text-6xl font-bold text-white tracking-tight z-[6] whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
      >
        LET'S GET VISUAL
      </div>

      <div
        ref={gif.ref}
        onPointerDown={gif.onPointerDown}
        style={{
          left: gif.pos.x,
          top: gif.pos.y,
          touchAction: "none",
        }}
        className="fixed z-10 cursor-grab active:cursor-grabbing select-none"
      >
        <img
          src={profilePic}
          alt="Sid Caulfield"
          draggable={false}
          className="max-w-[80vw] max-h-[70vh] object-contain pointer-events-none"
        />
      </div>

      {extraGifs.map((g) => (
        <DraggableGif
          key={g.id}
          initial={{ x: g.x, y: g.y }}
          width={g.width}
          src={profilePic}
        />
      ))}

      <button
        onClick={addGif}
        style={sfPro}
        className="fixed bottom-4 left-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        ADD GIF
      </button>

      {isIos && (
        <button
          onClick={() => setShowPrompt(true)}
          style={sfPro}
          className="fixed bottom-12 left-4 z-[9999] text-white text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
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
