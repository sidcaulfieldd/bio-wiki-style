import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import profilePic from "@/assets/profile_pic.gif";
import rightVid from "@/assets/right_side_website_vid.mp4";
import leftVid from "@/assets/left_side_website_vid.mp4";
import NotableProjectsPixelation from "@/components/NotableProjectsPixelation";
import DanceScroll from "@/components/DanceScroll";
import LoadingScreen from "@/components/LoadingScreen";
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

          <div>
            {/* Desktop Sidebar — floated right, like a real infobox, so
                body content wraps it while they overlap vertically and
                reclaims the card's full width once past its bottom edge. */}
            <aside className="hidden md:block md:float-right md:w-[300px] md:ml-6 mb-6">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                <SidebarContent />
              </div>
            </aside>

            {/* Main Content — one consistent gap (space-y-12, 48px)
                between every top-level section, instead of the mix of
                mb-4/mb-6/mt-6/my-[35px] that made spacing feel random
                from one section to the next. Each section below is a
                single wrapper div so this only affects the gaps
                *between* sections, not the tighter spacing inside one
                (e.g. a heading's mb-3 to its own paragraph). */}
            <div className="space-y-12">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#notable-projects" className="hover:underline">What = He's Proud Of</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#early-life" className="hover:underline">Early Life and Education</a></li>
                </ol>
              </div>

              {/* Lead Section */}
              <p className="leading-relaxed relative z-10">
                <strong>Sid Caulfield</strong> is an Australian copywriter/junior creative based in <a href="https://en.wikipedia.org/wiki/Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>, tending to word and picture. His output spans social, earned, paid, podcast and the odd bit of interactive digital design — this page included. Caulfield is known for his ability to tap into the cultural zeitgeist, connecting it with contemporary Australian life and community storytelling. He is currently a freelance journalist and the Content Syndication and Social Media Manager at <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a> and <a href="https://en.wikipedia.org/wiki/New_Zealand" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">New Zealand</a>'s largest digital mountain bike publication.
              </p>

              {/* Notable Projects Section */}
              <div>
                <ScrollTypeHeading id="notable-projects" className="text-2xl font-serif border-b border-[#a2a9b1] mb-3">
                  What = He's Proud Of
                </ScrollTypeHeading>
                <ul className="list-disc ml-6 leading-relaxed relative z-10">
                  <li><strong>Flow Mountain Bike</strong> — <a href="https://www.facebook.com/flowmountainbike/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>, <a href="https://www.instagram.com/flow_mtb/?hl=en" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="https://www.youtube.com/flowmountainbike" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>.</li>
                  <li><strong>The Mons Monday Podcast</strong> — <a href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Episodes</a>, <a href="https://www.instagram.com/reel/DKZIy7nzjtx/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">video teaser/launch</a>.</li>
                  <li><strong>Freelance writing</strong> — <a href="https://fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Forte Magazine</a>, <a href="https://flowmountainbike.com/tag/sid-caulfield/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>.</li>
                  <li><strong>Animation</strong> — <a href="https://www.youtube.com/watch?v=YKBWF2B2nw0&t=16s&pp=ygUTc2lkIGNhdWxmaWVsZCBicmFpbg%3D%3D" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Brain</a>.</li>
                </ul>
              </div>

              {/* Mons Monday gif, paired with a text box on the right.
                  clear-both forces this row to start below the floated
                  sidebar (not beside it) — space-y-12 on the parent
                  handles the gap, so no extra margin needed here.
                  grid-cols-2 splits the row into true halves: the image
                  is centered within the left half, and the text starts
                  exactly at the row's midpoint. items-start (rather than
                  items-center) lines the text up with the TOP of the
                  image instead of splitting the leftover height evenly
                  above and below it. */}
              <div className="clear-both grid md:grid-cols-2 gap-6 items-start">
                <div className="flex justify-center">
                  <NotableProjectsPixelation />
                </div>
                <div>
                  <ScrollTypeHeading id="mons-monday-caption" className="text-2xl font-serif border-b border-[#a2a9b1] mb-3">
                    The Mons Monday Podcast
                  </ScrollTypeHeading>
                  <p className="leading-relaxed relative z-10">
                    Caulfield is the producer of <a href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">The Mons Monday Podcast</a>, a profile-based podcast launched in 2025. He secured the project through cold outreach and developed the podcast's format, production systems and distribution strategy, managing end-to-end production — research, recording, editing, audience communications and release scheduling. The podcast debuted at number three on the Apple Australia Arts chart and later secured commercial partnerships with <a href="https://www.lbdo.com/collections/all-products" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">LBDO</a> and <a href="https://krushorganics.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Krush Organics</a>. Caulfield also created and edited video promotional material to support the launch and ongoing audience growth.
                  </p>
                </div>
              </div>

              {/* Dance gif-scrub -> looping video, sitting directly below
                  the Mons Monday gif. Paired with a text box on the left
                  this time so the two rows alternate sides. Same 50/50
                  grid split and top alignment as above. */}
              <div className="grid md:grid-cols-2 gap-6 items-start" data-cursor-trail-zone="bottom-dance-video">
                <div className="order-2 md:order-1">
                  <h3 className="text-2xl font-serif border-b border-[#a2a9b1] mb-3">Generalist by Nature</h3>
                  <p className="leading-relaxed relative z-10">
                    I'm a self-taught generalist by necessity, not design. No formal training in design, animation or music — just an itch to learn something for no good reason and see it through. A trained designer would probably spot everything wrong with my design work, and a trained musician would hear the amateur in my songs, but that's not really the point. The point is building, trying, failing, and coming out the other side with skills I didn't have going in.
                  </p>
                </div>
                <div className="order-1 md:order-2 flex justify-center">
                  <DanceScroll cardRef={cardRef} />
                </div>
              </div>

              {/* Visual link — sits on the card itself, directly under
                  the gif + dance block above. */}
              <div className="text-center leading-none">
                <a href="/LETSGETVISUAL" className="text-[#0645ad] hover:underline text-base">LET'S GET VISUAL</a>
              </div>

              {/* Skills and Early Life sections — kept at the old main-
                  column width (card width minus sidebar + gap) so the
                  float restructure above doesn't change how these look.
                  space-y-12 inside matches the outer rhythm. */}
              <div className="max-w-[628px] space-y-12">
                {/* Skills and Areas of Expertise Section */}
                <div>
                  <ScrollTypeHeading id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mb-3">
                    Skills and Areas of Expertise
                  </ScrollTypeHeading>
                  <div className="flex flex-wrap gap-2">
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
                </div>

                {/* Early Life and Education Section — last */}
                <div>
                  <ScrollTypeHeading id="early-life" className="text-2xl font-serif border-b border-[#a2a9b1] mb-3">
                    Early Life and Education
                  </ScrollTypeHeading>
                  <p className="mb-4 leading-relaxed relative z-10">
                    Sidney Joseph Caulfield was born on July 27, 2003, in <a href="https://en.wikipedia.org/wiki/East_Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">East Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a>.
                  </p>
                  <p className="mb-4 leading-relaxed relative z-10">
                    Caulfield completed his secondary education at <a href="https://en.wikipedia.org/wiki/Belmont_High_School_(Victoria)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Belmont High School</a> in <a href="https://en.wikipedia.org/wiki/Geelong" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Geelong</a>, where he studied Media, Linguistics and Indonesian.
                  </p>
                  <p className="leading-relaxed relative z-10">
                    He went on to study at <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a> and will graduate with a Bachelor of Communication (Journalism) in 2026.
                  </p>
                </div>
              </div>
            </div>
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
