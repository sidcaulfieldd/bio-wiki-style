import { useEffect, useRef } from "react";

// Standalone scratch page.
// No links, nav, or references to any other page on the site.
export default function Scratch() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els || els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="scratch-page">
      <style>{`
        .scratch-page {
          min-height: 100vh;
          background: #0b0b0c;
          color: #f2f2f2;
          font-family: system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }
        .scratch-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
        }
        .scratch-block {
          max-width: 640px;
          text-align: center;
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .scratch-block.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .scratch-block h1 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .scratch-block p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #b5b5b8;
        }
      `}</style>

      <section className="scratch-section">
        <div className="scratch-block" data-reveal>
          <h1>Scratch</h1>
          <p>This is a blank working page. Scroll down.</p>
        </div>
      </section>

      <section className="scratch-section">
        <div className="scratch-block" data-reveal>
          <h1>Section Two</h1>
          <p>Replace this content with whatever you're testing or drafting.</p>
        </div>
      </section>

      <section className="scratch-section">
        <div className="scratch-block" data-reveal>
          <h1>Section Three</h1>
          <p>Each section fades and lifts into place as it enters the viewport.</p>
        </div>
      </section>
    </div>
  );
}
