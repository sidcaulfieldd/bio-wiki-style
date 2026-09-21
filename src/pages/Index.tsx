import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import profilePic from "@/assets/profile_pic.gif";
import rightVid from "@/assets/right_side_website_vid.mp4";
import leftVid from "@/assets/left_side_website_vid.mp4";
import NotableProjectsPixelation from "@/components/NotableProjectsPixelation";
import DanceScroll from "@/components/DanceScroll";
import LoadingScreen from "@/components/LoadingScreen";
import { usePushBelowElement } from "@/hooks/usePushBelowElement";
import { ScrollTypeHeading } from "@/components/ScrollTypeHeading";
// ScrollFlipWord is currently disabled (not deleted) — the Career Overview
// intro line it was wired into has been removed for now. Kept here, along
// with the word banks below, in case it gets reused later.
import { ScrollFlipWord } from "@/components/ScrollFlipWord";

const STRANGERS = ["neighbors","newcomers","observers","travellers","backpackers","adventurers","volunteers","creatives","explorers","founders","designers","builders","teachers","planners","thinkers","dreamers","runners","riders","surfers","skaters","painters","writers","readers","dancers","singers","coders","gamers","traders","brokers","dealers","editors","bloggers","vloggers","leaders","workers","artists","drivers","campers","climbers","hikers","paddlers","cyclists","joggers","sailors","rafters","brewers","bakers","farmers","doctors"];
const MIC       = ["map","man","men","mop","mug","pod","cam","pen","cap","pan","tap","set","net","web","app","air","hub","box","lab","den","bay","bar","pub","gym","jet","pit","mat","bed","sun","van","rod","bin","tub","can","tin","lid","key","log","rug","hat","fig","jam","wax","arc","dam","keg","owl","ant","ram","bug"];
const HIGHLIGHTS = ["milestones","snapshots","headliners","roadtrips","heartbreaks","backyards","skateparks","houseplants","aftershocks","storybeats","timepieces","showpieces","soundwaves","blueprints","footprints","goldmines","nightfalls","rainstorms","shipwrecks","storefronts","boardrooms","campfires","flashdrives","doorframes","landmasses","starbursts","bookcases","motorways","skylights","newsbreaks","postcards","sandcastles","wildfires","turntables","drumrolls","backflips","hatchbacks","headlines","paintbrushes","storytales","afterhours","longreads","sidequests","breakthroughs","launches","projects","ventures","chapters","episodes","showcases"];

const Index = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const monsMondayWrapRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  // Push the Mons Monday gif down so it never starts less than ~35px
  // below the sidebar's bottom edge, on desktop (see hook for details).
  usePushBelowElement(monsMondayWrapRef, asideRef, 35);

  // The page stays behind the LoadingScreen until the profile gif itself
  // has loaded (LoadingScreen owns that load and reports back here).
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const handleProfileLoaded = useCallback(() => setIsProfileLoaded(true), []);

  // Preload the two side videos in the background (the profile gif is
  // handled by LoadingScreen, so it's left out here to avoid a duplicate
  // fetch).
  useEffect(() => {
    const assets = [rightVid, leftVid];
    assets.forEach((src) => {
      const v = document.createElement("video");
      v.preload = "auto";
      v.src = src;
    });
  }, []);

  // Custom-cursor disable, scoped to this page only (same technique used
  // on the blackbird-application pages): inject a style tag on mount that
  // wins back the native cursor and hides the mouse.png dot, then remove
  // it on unmount so every other page is completely unaffected. The
  // cursor-trail rectangles are left alone — that effect stays active here.
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
      {!isProfileLoaded && <LoadingScreen onLoaded={handleProfileLoaded} />}

      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]">
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Mobile Sidebar - always visible on mobile */}
        <div className="md:hidden mb-4">
          <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
            <SidebarContent />
          </div>
        </div>

        <div ref={cardRef} data-cursor-trail-card className="bg-white border border-[#a7d7f9] p-6 relative">
          {/* Title */}
          <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4">
            Sid Caulfield
          </h1>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Main Content Column */}
            <div className="flex-1 order-2 md:order-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#notable-projects" className="hover:underline">Notable Projects</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#early-life" className="hover:underline">Early Life and Education</a></li>
                </ol>
              </div>

              {/* Lead Section */}
              <p className="mb-4 leading-relaxed relative z-10">
                <strong>Sid Caulfield</strong> is an Australian copywriter currently based in <a href="https://en.wikipedia.org/wiki/Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>, working in words and pictures. His output spans copywriting, concepting, social storytelling, podcast production and the odd bit of interactive digital design — this page included. Caulfield is known for his ability to tap into the cultural zeitgeist, connecting it with contemporary Australian life and community storytelling. He is currently a freelance journalist and the Content Syndication and Social Media Manager at <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a> and <a href="https://en.wikipedia.org/wiki/New_Zealand" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">New Zealand</a>'s largest digital mountain bike publication — where the day job is strategy, and the after-hours job is everything else on this page.
              </p>

              {/* Notable Projects Section */}
              <ScrollTypeHeading id="notable-projects" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Notable Projects
              </ScrollTypeHeading>

              <ul className="list-disc ml-6 leading-relaxed mb-4 relative z-10">
                <li><strong>Flow Mountain Bike</strong> — <a href="https://www.facebook.com/flowmountainbike/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>, <a href="https://www.instagram.com/flow_mtb/?hl=en" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="https://www.youtube.com/flowmountainbike" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>.</li>
                <li><strong>The Mons Monday Podcast</strong> — <a href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Episodes</a>, <a href="https://www.instagram.com/reel/DKZIy7nzjtx/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">video teaser/launch</a>.</li>
                <li><strong>Freelance writing</strong> — <a href="https://fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Forte Magazine</a>, <a href="https://flowmountainbike.com/tag/sid-caulfield/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>.</li>
                <li><strong>Animation</strong> — <a href="https://www.youtube.com/watch?v=YKBWF2B2nw0&t=16s&pp=ygUTc2lkIGNhdWxmaWVsZCBicmFpbg%3D%3D" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Brain</a>.</li>
              </ul>

              {/* Mons Monday gif — left-aligned, pushed to start ~35px
                  below the sidebar's bottom edge via usePushBelowElement.
                  Paired with a text box on the right; extra vertical
                  padding (py-8) on the gif wrapper brings its height
                  closer to the text block beside it. */}
              <div className="my-[35px] flex flex-col md:flex-row gap-6 items-center">
                <div ref={monsMondayWrapRef} className="py-8">
                  <NotableProjectsPixelation />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold mb-2">Header Goes Here</h3>
                  <p className="leading-relaxed text-sm text-[#333]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>

              {/* Dance gif-scrub -> looping video, sitting directly below
                  the Mons Monday gif. Paired with a text box on the left
                  this time so the two rows alternate sides. Extra
                  vertical padding (py-8) on the video wrapper brings its
                  height closer to the text block beside it. */}
              <div className="my-[35px] flex flex-col md:flex-row gap-6 items-center" data-cursor-trail-zone="bottom-dance-video">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-xl font-serif font-bold mb-2">Another Header</h3>
                  <p className="leading-relaxed text-sm text-[#333]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </div>
                <div className="py-8 order-1 md:order-2">
                  <DanceScroll cardRef={cardRef} />
                </div>
              </div>

              {/* Visual link — sits on the card itself, directly under
                  the gif + dance block above. */}
              <div className="text-center leading-none my-[35px]">
                <a href="/LETSGETVISUAL" className="text-[#0645ad] hover:underline text-base">LET'S GET VISUAL</a>
              </div>

              {/* Skills and Areas of Expertise Section */}
              <ScrollTypeHeading id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Skills and Areas of Expertise
              </ScrollTypeHeading>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Copywriting and editing",
                  "Concept and campaign development",
                  "Social and long-form storytelling",
                  "Podcast writing and production",
                  "Video editing and animation",
                  "Adobe Creative Suite",
                  "Canva (visual systems and templates)",
                  "Audience profiling and insights",
                  "Content strategy and scheduling",
                  "Cross-platform syndication",
                  "eDM planning, delivery and performance analysis",
                  "SEO and metadata optimisation"
                ].map((skill) => (
                  <span key={skill} className="bg-[#eaecf0] border border-[#a2a9b1] px-2 py-1 text-sm rounded cursor-pointer hover:bg-[#c8ccd1] hover:border-[#72777d] transition-colors duration-150">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Early Life and Education Section — last */}
              <ScrollTypeHeading id="early-life" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Early Life and Education
              </ScrollTypeHeading>
              <p className="mb-4 leading-relaxed relative z-10">
                Sidney Joseph Caulfield was born on July 27, 2003, in <a href="https://en.wikipedia.org/wiki/East_Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">East Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a>.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                Caulfield completed his secondary education at <a href="https://en.wikipedia.org/wiki/Belmont_High_School_(Victoria)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Belmont High School</a> in <a href="https://en.wikipedia.org/wiki/Geelong" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Geelong</a>, where he studied Media, Linguistics and Indonesian.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                He went on to study at <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a> and will graduate with a Bachelor of Communication (Journalism) in 2026.
              </p>
            </div>

            {/* Desktop Sidebar */}
            <aside ref={asideRef} className="hidden md:block w-[300px] flex-shrink-0 order-1 md:order-2">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                <SidebarContent />
              </div>
            </aside>
          </div>

          {/* Walking easter egg — desktop only, tethered to card edges */}
          <WalkingSid cardRef={cardRef} isProfileLoaded={isProfileLoaded} />
        </div>
      </main>
    </div>
  );
};

const WalkingSid = ({
  cardRef,
  isProfileLoaded,
}: {
  cardRef: RefObject<HTMLDivElement>;
  isProfileLoaded: boolean;
}) => {
  // Positive pushes the videos further down from true viewport-center; negative pushes up.
  const VERTICAL_OFFSET = 25;

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  // Gap between the card's left edge and the screen's left edge (px)
  const [leftGap, setLeftGap] = useState(0);
  // Gap between the card's right edge and the screen's right edge (px)
  const [rightGap, setRightGap] = useState(0);
  // Top offset (relative to the card) that centers each video in the current viewport
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

      // Position each video's top (relative to the card) so its vertical
      // center lands on the current viewport's vertical center.
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
    if (!isProfileLoaded) return;
    const t = setTimeout(() => setShowLeft(true), 5000);
    return () => clearTimeout(t);
  }, [isProfileLoaded]);

  // Derive whole-pixel heights from the rounded gaps so the CSS box matches
  // exactly what the top-offset math above assumed.
  const leftHeight = Math.round((leftGap * 16) / 9);
  const rightHeight = Math.round((rightGap * 16) / 9);

  return (
    <div className="hidden md:block pointer-events-none">
      {showLeft && (
        <div
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
            }}
          />
        </div>
      )}
    </div>
  );
};

const SidebarContent = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <>
      {/* Infobox title */}
      <div className="bg-[#eaecf0] text-center font-bold text-[125%] py-2 border-b border-[#a2a9b1]">
        Sid Caulfield
      </div>

      {/* Infobox image */}
      <div className="text-center p-3 pb-0">
        <div className="relative w-full aspect-square" data-cursor-trail-zone="pink-behind-gif">
          <div className="absolute inset-0 bg-[#FF69B4]" style={{ zIndex: 2 }} />
          <img
            src={profilePic}
            alt="Sid Caulfield"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 20 }}
          />
        </div>
        <div className="text-xs text-[#54595d] mt-1 mb-3">
          Caulfield in 2025
        </div>
        {/* Spotify Embed */}
        <div className="relative mb-3">
          <iframe
            ref={iframeRef}
            style={{ borderRadius: '12px', position: 'relative', zIndex: 1 }}
            src="https://open.spotify.com/embed/track/4YACgyR9xdAcyJMBV8H6oX?utm_source=generator&theme=0&autoplay=1"
            width="100%"
            height="80"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Born</th>
            <td className="py-2 px-2 relative z-10">
              Sidney Joseph Caulfield <br />
              July 27, 2003 (age 22)
              <br />
              East Melbourne, Victoria, AUS
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Occupation</th>
            <td className="py-2 px-2 relative z-10">
              Freelance Creative
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Current Location</th>
            <td className="py-2 px-2 relative z-10">Greater Melbourne, Victoria, Australia</td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Years active</th>
            <td className="py-2 px-2 relative z-10">2025—present</td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Education</th>
            <td className="py-2 px-2 relative z-10">
              <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a>
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Contact</th>
            <td className="py-2 px-2 relative z-10">
              <a className="text-[#0645ad] hover:underline" href="mailto:caulfieldsid@gmail.com">
                caulfieldsid@gmail.com
              </a>
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Social</th>
            <td className="py-2 px-2 relative z-10">
              <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/sid-caulfield-27b838356/">LinkedIn</a>
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Resume</th>
            <td className="py-2 px-2 relative z-10">
              <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/1T26aUBmdWnSU0To83Md1-1DvCs1Ft6yt/view?usp=sharing">
                View PDF
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Index;
