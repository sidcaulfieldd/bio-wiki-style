import { useEffect, useLayoutEffect, useRef, useState } from "react";

import profilePic from "@/assets/eportfolio_profile_pic.gif";
import poddyCover from "@/assets/poddy-cover.jpg";
import flowTrashFreeTrails from "@/assets/flow-trash-free-trails.jpg";
import flowMaddieLloyd from "@/assets/flow-maddie-lloyd.jpg";
import flowJacksonConnelly from "@/assets/flow-jackson-connelly.jpg";
import flowGiantStp from "@/assets/flow-giant-stp.jpg";
import flowFacebook from "@/assets/flow-facebook.jpg";
import flowInstagram from "@/assets/flow-instagram.jpg";
import NotableProjectsPixelation from "@/components/NotableProjectsPixelation";
import { ScrollTypeHeading } from "@/components/ScrollTypeHeading";

const MONS_MONDAY_EPISODES = [
  { id: "3HbiKzvld9G51AgZEv1JL3", title: "One Year Without Alcohol: Day 236", duration: "41 min", date: "Jun 9, 2025" },
  { id: "4BQNYu5ToaFbC5wSIpCW3v", title: "20 Things I Wish I Knew at 20", duration: "55 min", date: "Jun 23, 2025" },
  { id: "3ZOuHvoGEZchfqr5YIE704", title: "Live from the Campsite", duration: "33 min", date: "Jul 7, 2025" },
  { id: "6M9acNMBf4em7iZumavOal", title: "Life Before Sabi: How I Got Here", duration: "1 hr 5 min", date: "Jul 21, 2025" },
  { id: "6MIO4GqVcqZekF5l5DxxWe", title: "When Nothing Goes To Plan", duration: "52 min", date: "Aug 4, 2025" },
];

const FLOW_ARTICLES = [
  {
    title: "What Is Trash Free Trails?",
    shortTitle: "What Is Trash Free Trails?",
    url: "https://flowmountainbike.com/features/what-is-trash-free-trails/",
    image: flowTrashFreeTrails,
  },
  {
    title: "Fun First, Fast Always: Maddie Lloyd Might Be Australia's Fastest 13-Year-Old",
    shortTitle: "Fun First, Fast Always",
    url: "https://flowmountainbike.com/features/fun-first-fast-always-maddie-lloyd-might-be-australias-fastest-13-year-old/",
    image: flowMaddieLloyd,
  },
  {
    title: "Who Is Downhill Mountain Biker Jackson Connelly?",
    shortTitle: "Me Against the World",
    url: "https://flowmountainbike.com/features/who-is-downhill-mountain-biker-jackson-connelly/",
    image: flowJacksonConnelly,
  },
  {
    title: "Giant STP 26 Review",
    shortTitle: "Giant STP 26 Review",
    url: "https://flowmountainbike.com/tests/giant-stp-26-review/",
    image: flowGiantStp,
  },
  {
    title: "Flow Mountain Bike on Facebook",
    shortTitle: "Facebook",
    url: "https://www.facebook.com/flowmountainbike/",
    image: flowFacebook,
  },
  {
    title: "Flow Mountain Bike on Instagram",
    shortTitle: "Instagram",
    url: "https://www.instagram.com/flow_mtb/?hl=en",
    image: flowInstagram,
  },
];

const FORTE_ARTICLE = {
  title: "Friends of Anglesea River Continue Five-Year Fight Amid Mining Corp Alcoa's Latest Water Bid",
  url: "https://www.fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/",
};

const SidebarContent = () => {
  return (
    <>
      {/* Infobox title */}
      <div className="bg-[#eaecf0] text-center font-bold text-[125%] py-2 border-b border-[#a2a9b1]">
        Sid Caulfield
      </div>

      {/* Infobox image */}
      <div className="text-center p-3">
        <div className="relative w-full aspect-square">
          <div className="absolute inset-0 bg-[#FF69B4]" style={{ zIndex: 2 }} />
          <img
            src={profilePic}
            alt="Sid Caulfield"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 20 }}
          />
        </div>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Born</th>
            <td className="py-2 px-2 relative z-10">
              Sidney Joseph Caulfield <br />
              July 27, 2003 (age 23)
              <br />
              East Melbourne, Victoria, AUS
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Occupation(s)</th>
            <td className="py-2 px-2 relative z-10">
              PR &amp; Communications, Content Syndication and Social Media Management, Podcast Production
            </td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Location</th>
            <td className="py-2 px-2 relative z-10">Greater Melbourne, Victoria, Australia</td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Years active</th>
            <td className="py-2 px-2 relative z-10">2025—present</td>
          </tr>
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Education</th>
            <td className="py-2 px-2 relative z-10">
              <a
                href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                RMIT University
              </a>
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
              <a
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.linkedin.com/in/sid-caulfield-27b838356/"
              >
                LinkedIn
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const HydeAndSeekText = () => (
  <>
    <p className="mb-4 leading-relaxed relative z-10">
      Since July 2026, Caulfield has supported strategic communications and media relations
      for clients across the fintech, tech and consumer sectors at Hyde &amp; Seek, a boutique
      PR agency, working directly with the Founding Director. His responsibilities include
      writing and pitching press releases and media alerts, building and maintaining media
      mapping and journalist tracking systems, and monitoring live news cycles to identify
      timely press opportunities for clients.
    </p>
    <p className="leading-relaxed relative z-10">
      This placement has deepened his understanding of client servicing, research rigour and
      pitch development within an agency structure, and strengthened his grounding in
      brand-led thinking and integrated campaign execution.
    </p>
  </>
);

const EPortfolio = () => {
  // This page is self-contained: disable the site-wide custom cursor while it's mounted,
  // without touching any files outside this page.
  useEffect(() => {
    document.body.classList.add("eportfolio-page");
    return () => document.body.classList.remove("eportfolio-page");
  }, []);

  // Measure the real, visible Hyde & Seek text column so the embed can be cropped to
  // exactly that height at any screen size (not a guessed/fixed pixel value).
  const hydeAndSeekTextRef = useRef<HTMLDivElement>(null);
  const [hydeAndSeekHeight, setHydeAndSeekHeight] = useState<number | undefined>(undefined);

  const flowTextRef = useRef<HTMLDivElement>(null);
  const [flowGridHeight, setFlowGridHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      if (hydeAndSeekTextRef.current) {
        setHydeAndSeekHeight(hydeAndSeekTextRef.current.offsetHeight);
      }
      if (flowTextRef.current) {
        setFlowGridHeight(flowTextRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <style>{`
        body.eportfolio-page,
        body.eportfolio-page * {
          cursor: auto !important;
        }
        body.eportfolio-page img[src="/mouse.png"] {
          display: none !important;
        }
        body.eportfolio-page .cursor-trail-rect {
          transform: scale(0.5);
        }
      `}</style>

      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]" />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Mobile Sidebar - always visible on mobile */}
        <div className="md:hidden mb-4">
          <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
            <SidebarContent />
          </div>
        </div>

        <div className="bg-white border border-[#a7d7f9] p-6">
          {/* Title */}
          <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4">
            Hi! I'm Sid.
          </h1>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Main Content Column */}
            <div className="flex-1 order-2 md:order-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#examples-of-my-work" className="hover:underline">Examples of My Work</a>
                    <ol className="list-decimal ml-4 text-[#0645ad]">
                      <li><a href="#hyde-and-seek" className="hover:underline">Hyde &amp; Seek Internship</a></li>
                      <li><a href="#flow-mountain-bike" className="hover:underline">Flow Mountain Bike</a></li>
                      <li><a href="#mons-monday-podcast" className="hover:underline">The Mons Monday Podcast</a></li>
                    </ol>
                  </li>
                  <li><a href="#rmit-coursework" className="hover:underline">RMIT Coursework</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#contact" className="hover:underline">Contact</a></li>
                </ol>
              </div>

              {/* Lead */}
              <p className="mb-4 leading-relaxed relative z-10">
                Caulfield is an Australian content and comms professional based in Melbourne, Victoria.
                His work spans PR and media relations, digital journalism, content syndication and
                podcast production. Below is a closer look at his written work and professional
                experience.
              </p>

              {/* Examples of My Work (formerly Career Overview) */}
              <ScrollTypeHeading id="examples-of-my-work" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Examples of My Work
              </ScrollTypeHeading>

              {/* Hyde & Seek */}
              <div className="mb-6 flex flex-col md:flex-row md:items-start gap-4">
                <div ref={hydeAndSeekTextRef} className="w-full md:w-1/2">
                  <h3 id="hyde-and-seek" className="text-xl font-serif mb-3">
                    Hyde &amp; Seek — PR &amp; Communications Intern
                  </h3>
                  <HydeAndSeekText />
                </div>
                <div className="w-full md:w-1/2 flex-shrink-0 flex justify-center">
                  <div
                    className="w-full max-w-[280px] relative overflow-hidden rounded-xl border border-[#a2a9b1]"
                    style={{ height: hydeAndSeekHeight ? `${hydeAndSeekHeight}px` : "480px" }}
                  >
                    <iframe
                      src="https://www.instagram.com/p/DbKcgg6M1Bu/embed"
                      width="100%"
                      height="600"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency
                      style={{ border: "none" }}
                      title="Hyde & Seek Instagram post"
                    />
                  </div>
                </div>
              </div>

              {/* Flow Mountain Bike */}
              <h3 id="flow-mountain-bike" className="text-xl font-serif mb-3">
                Flow Mountain Bike — Content Syndication and Social Media Manager
              </h3>
              <div className="mb-6 flex flex-col md:flex-row md:items-start gap-4">
                <div ref={flowTextRef} className="w-full md:w-1/2">
                  <p className="mb-4 leading-relaxed relative z-10">
                    Since 2025, Caulfield has managed Flow Mountain Bike's social presence and content
                    syndication, reaching a cumulative audience of 375,000. He redesigned the publication's
                    syndication system and introduced Canva and Sprout Social, creating a collaborative
                    workflow for the team, and plans, builds and sends Flow's weekly eDM to 30,000
                    subscribers, achieving a 25–30% open rate.
                  </p>
                  <p className="leading-relaxed relative z-10">
                    This role has sharpened his instincts for audience interest, timing and engagement
                    drivers, and given him practical experience lifting output, tightening processes and
                    improving brand storytelling consistency across a large syndication network.
                  </p>
                </div>
                <div
                  className="w-full md:w-1/2 grid grid-cols-3 grid-rows-2 gap-2"
                  style={{ height: flowGridHeight ? `${flowGridHeight}px` : "320px" }}
                >
                  {FLOW_ARTICLES.map((article) => (
                    <a
                      key={article.url}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block h-full w-full rounded-xl overflow-hidden border border-[#a2a9b1]"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-150 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Mons Monday Podcast */}
              <h3 id="mons-monday-podcast" className="text-xl font-serif mt-6 mb-3">
                The Mons Monday Podcast — Producer
              </h3>
              <p className="mb-4 leading-relaxed relative z-10">
                Caulfield pitched a profile-led podcast to Mons Monday and secured the collaboration
                through cold outreach in 2025, developing the podcast's strategy and systems for
                planning, recording, editing, feedback and distribution. The podcast debuted at number
                three on the Apple Australia Arts chart, and went on to secure two commercial
                partnerships, with LBDO and Krush Organics.
              </p>
              <p className="mb-6 leading-relaxed relative z-10">
                Producing the podcast end-to-end — from conceptualising and editing promotional video
                material to managing partner and audience communications — gave Caulfield a grounding in
                production workflow management and post-launch performance analysis.
              </p>

              {/* Launch GIF + episode list, side by side, centered as a self-contained block */}
              <div className="my-6 w-full flex justify-center md:translate-x-[150px]">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <NotableProjectsPixelation />
                  <div
                    className="flex flex-col justify-between w-[270px]"
                    style={{ height: "480px" }}
                  >
                    {MONS_MONDAY_EPISODES.map((ep, i) => (
                      <a
                        key={ep.id}
                        href={`https://open.spotify.com/episode/${ep.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#121212] hover:bg-[#1a1a1a] transition-colors duration-150 rounded-lg px-2 py-1.5 no-underline"
                        style={{ height: "88px" }}
                      >
                        <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={poddyCover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-[3px] right-[3px] w-5 h-5 rounded-full bg-[#1ed760] flex items-center justify-center shadow">
                            <svg viewBox="0 0 24 24" className="w-[9px] h-[9px] fill-black ml-px">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-[#1ed760]">
                            Episode {i + 1}
                          </div>
                          <div className="text-sm font-semibold text-white truncate">
                            {ep.title}
                          </div>
                          <div className="text-xs text-[#b3b3b3]">
                            {ep.date} · {ep.duration}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Also published */}
              <p className="mb-6 leading-relaxed relative z-10">
                Also featured in{" "}
                <a
                  href={FORTE_ARTICLE.url}
                  className="text-[#0645ad] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forte Magazine
                </a>
                .
              </p>
            </div>

            {/* Desktop Sidebar — closes here since its content (photo/table) is already
                fully shown by this point; everything below renders at the card's true full
                width instead of the narrower column this sidebar would otherwise impose. */}
            <aside className="hidden md:block w-[300px] flex-shrink-0 order-1 md:order-2">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                <SidebarContent />
              </div>
            </aside>
          </div>

          {/* RMIT Coursework — own section, sitting after the professional work since it's
              academic rather than professional experience, but still evidences the hard-news
              training that underpins the comms work above. */}
          <ScrollTypeHeading id="rmit-coursework" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            RMIT Coursework
          </ScrollTypeHeading>
          <p className="mb-4 leading-relaxed relative z-10">
            Hard-news and investigative reporting completed as part of Caulfield's Bachelor of
            Communication (Journalism) at RMIT — proof of the research rigour, verification habits
            and news judgement that carry directly into PR and comms work.
          </p>
          <ul className="list-disc ml-6 leading-relaxed mb-6 relative z-10">
            <li className="mb-1">
              <a
                href="https://storymaps.arcgis.com/stories/bec0b064fef64ba5afa724b977aeb9ba"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Off the Rails: Is V/Line Failing Geelong Commuters?
              </a>{" "}
              <span className="text-[#54595d]">— StoryMap</span>
              <ul className="list-disc ml-6 mt-1">
                <li className="mb-1">
                  <a
                    href="https://drive.google.com/file/d/1pO-khla0hOTDAGF6zG129GYgArtrXlXB/view"
                    className="text-[#0645ad] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vertical video cut
                  </a>
                </li>
                <li className="mb-1">
                  <a
                    href="https://drive.google.com/file/d/1j3Oknl1aBwhFBrSOkE6PBH1vNp4zAd8D/view"
                    className="text-[#0645ad] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Full video package
                  </a>
                </li>
              </ul>
            </li>
            <li className="mb-1">
              <a
                href="https://storymaps.arcgis.com/stories/6f8abf2a943d4b2f90f8ab996418d772"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Is Citizen Science Saving the Environment?
              </a>{" "}
              <span className="text-[#54595d]">— StoryMap (Merri Creek)</span>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1R9h4aHRwLLAiiO_op4TuWhfJ99Y-1vDi/view?usp=sharing"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Dams Are Drying Up
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1-r2Yh52eIp4AEvxNk9gVJMKO_M2gHsOU/view"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Proposed Housing at Community Hub Sparks "Town" Meeting
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1nXmTXIEI6gPNO9Yd6Auz0IkOxA5KKSoh/view?usp=sharing"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Court Report
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1h6aHY7ylw_M2u1hszfqSyEiP004s2pAj/view?usp=drive_link"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Affordable Rental Shortage Pushes Chef Out of Hometown
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1U4XzUXttANcJwZDz2Ss-H_sKqUjhrB62/view"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hundreds Attend Paddle-Out Protesting Seismic Blasting
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1s6EZJq7r0rHDweMVjRqvvRmpe5vNW4yS/view"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Council Meeting — Live Event Assignment
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://drive.google.com/file/d/1oCV9Z7YaOcXUiUpyZjsFXVvnv0VJR5RE/view?usp=sharing"
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ridgeline Trail Piece
              </a>
            </li>
          </ul>

          {/* Skills */}
          <ScrollTypeHeading id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            Skills and Areas of Expertise
          </ScrollTypeHeading>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "PR and media relations",
              "Client account management",
              "Content strategy and campaign development",
              "Press release and media pitch writing",
              "Copywriting and editing",
              "eDM planning, delivery and performance analysis",
              "Media monitoring and coverage reporting",
              "Audience profiling and insights",
              "Cross-platform syndication",
              "Integrated publishing and analytics tools",
              "Adobe Creative Suite",
              "Canva (team templates and system design)",
            ].map((skill) => (
              <span
                key={skill}
                className="bg-[#eaecf0] border border-[#a2a9b1] px-2 py-1 text-sm rounded cursor-pointer hover:bg-[#c8ccd1] hover:border-[#72777d] transition-colors duration-150"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Contact */}
          <h2
            id="contact"
            className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3"
          >
            Contact
          </h2>
          <p className="mb-4 leading-relaxed relative z-10">
            Get in touch at{" "}
            <a className="text-[#0645ad] hover:underline" href="mailto:caulfieldsid@gmail.com">
              caulfieldsid@gmail.com
            </a>
            , or connect via{" "}
            <a
              className="text-[#0645ad] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.linkedin.com/in/sid-caulfield-27b838356/"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default EPortfolio;
