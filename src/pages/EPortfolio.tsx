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

// Course Work articles + one-line briefs, per RMIT Course Work section
const COURSE_WORK_ARTICLES = [
  {
    title: "Off the Rails: Is V/Line Failing Geelong Commuters?",
    tag: "StoryMap",
    url: "https://storymaps.arcgis.com/stories/bec0b064fef64ba5afa724b977aeb9ba",
    brief:
      "Investigation into reliability failures on Victoria's busiest regional line, told through a stranded commuter and a 1,500-passenger disruption.",
    children: [
      {
        title: "Vertical video cut",
        url: "https://drive.google.com/file/d/1pO-khla0hOTDAGF6zG129GYgArtrXlXB/view",
      },
      {
        title: "Full video package",
        url: "https://drive.google.com/file/d/1j3Oknl1aBwhFBrSOkE6PBH1vNp4zAd8D/view",
      },
    ],
  },
  {
    title: "Is Citizen Science Saving the Environment?",
    tag: "StoryMap (Merri Creek)",
    url: "https://storymaps.arcgis.com/stories/6f8abf2a943d4b2f90f8ab996418d772",
    brief:
      "How social media and citizen-science apps like iNaturalist are reshaping grassroots environmental activism, reported through Friends of Merri Creek.",
  },
  {
    title: "The Dams Are Drying Up",
    tag: null,
    url: "https://drive.google.com/file/d/1R9h4aHRwLLAiiO_op4TuWhfJ99Y-1vDi/view?usp=sharing",
    brief:
      "A three-part feature on Victoria's water crisis — a Bellbrae farmer selling stock as his dams run dry, Geelong drawing 50 billion litres from desalination, and Apollo Bay facing Stage 4 restrictions.",
  },
  {
    title: "Proposed Housing at Community Hub Sparks \"Town\" Meeting",
    tag: null,
    url: "https://drive.google.com/file/d/1-r2Yh52eIp4AEvxNk9gVJMKO_M2gHsOU/view",
    brief:
      "Hard-news report on Anglesea residents opposing council plans to allocate community hub land to key-worker housing.",
  },
  {
    title: "Woman Spared Jail Over $126,000 Burglary After Judge Cites \"Chaotic\" Childhood",
    tag: "Court Report",
    url: "https://drive.google.com/file/d/1nXmTXIEI6gPNO9Yd6Auz0IkOxA5KKSoh/view?usp=sharing",
    brief:
      "Sentencing report on a Melbourne County Court case weighing the offender's traumatic history against a $126,000 luxury goods theft.",
  },
  {
    title: "Affordable Rental Shortage Pushes Chef Out of Hometown",
    tag: null,
    url: "https://drive.google.com/file/d/1h6aHY7ylw_M2u1hszfqSyEiP004s2pAj/view?usp=drive_link",
    brief:
      "Profile of a lifelong Anglesea hospitality worker priced out of her hometown, and the flow-on staffing crisis it's causing local businesses.",
  },
  {
    title: "Hundreds Attend Paddle-Out Protesting Seismic Blasting",
    tag: null,
    url: "https://drive.google.com/file/d/1U4XzUXttANcJwZDz2Ss-H_sKqUjhrB62/view",
    brief:
      "Coverage of a Torquay paddle-out protest against a seismic blasting proposal threatening Southern Right Whale breeding grounds, with First Nations leaders and a senator in attendance.",
  },
  {
    title: "Torquay Mental Health Housing Development To Go Ahead Despite Community Opposition",
    tag: "Council Meeting — Live Event Assignment",
    url: "https://drive.google.com/file/d/1s6EZJq7r0rHDweMVjRqvvRmpe5vNW4yS/view",
    brief:
      "Report on a Surfcoast Shire council meeting confirming the development will proceed despite resident concerns over its proximity to a primary school.",
  },
  {
    title: "\"Finally\": Torquay–Bellbrae Bike Path Confirmed After Decade-Long Push",
    tag: null,
    url: "https://drive.google.com/file/d/1oCV9Z7YaOcXUiUpyZjsFXVvnv0VJR5RE/view?usp=sharing",
    brief:
      "News report on the long-awaited Ridgeline Trail, finally connecting Torquay, Jan Juc and Bellbrae for cyclists and pedestrians.",
  },
];

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
              PR &amp; Integrated Communications, Content Syndication and Social Media Management, Podcast Production
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
      Since July 2026, I've supported strategic communications and media relations for
      clients across the fintech, tech and consumer sectors at Hyde &amp; Seek, a boutique
      PR agency, working directly with the Founding Director. My responsibilities include
      writing and pitching press releases and media alerts, building and maintaining media
      mapping and journalist tracking systems, and monitoring live news cycles to identify
      timely press opportunities for clients.
    </p>
    <p className="leading-relaxed relative z-10">
      This placement has sharpened my instincts for client servicing, research rigour and
      pitch development — and shown me exactly where my journalism training pays off in
      agency work: reading what a journalist actually wants before I pitch it, not after
      it's rejected.
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

  // Measure the real, visible Course Work list column so the three stacked embeds on
  // the right can be sized to fill exactly that height (not a guessed/fixed value).
  const courseWorkTextRef = useRef<HTMLDivElement>(null);
  const [courseWorkHeight, setCourseWorkHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      if (hydeAndSeekTextRef.current) {
        setHydeAndSeekHeight(hydeAndSeekTextRef.current.offsetHeight);
      }
      if (flowTextRef.current) {
        setFlowGridHeight(flowTextRef.current.offsetHeight);
      }
      if (courseWorkTextRef.current) {
        setCourseWorkHeight(courseWorkTextRef.current.offsetHeight);
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
            Hey! I'm Sid.
          </h1>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Main Content Column */}
            <div className="flex-1 order-2 md:order-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#professional-experience" className="hover:underline">Professional Work</a>
                    <ol className="list-decimal ml-4 text-[#0645ad]">
                      <li><a href="#hyde-and-seek" className="hover:underline">Hyde &amp; Seek Internship</a></li>
                      <li><a href="#flow-mountain-bike" className="hover:underline">Flow Mountain Bike</a></li>
                      <li><a href="#mons-monday-podcast" className="hover:underline">The Mons Monday Podcast</a></li>
                    </ol>
                  </li>
                  <li><a href="#course-volunteer-work" className="hover:underline">Course Work</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#contact" className="hover:underline">Let's chat!</a></li>
                </ol>
              </div>

              {/* Lead */}
              <p className="mb-4 leading-relaxed relative z-10">
                I'm a journalism-trained communicator based in Melbourne, building a career
                in PR and integrated comms. My work spans agency PR, content syndication,
                social strategy and podcast production — below is a closer look at how it
                all fits together.
              </p>

              {/* Professional Work */}
              <ScrollTypeHeading id="professional-experience" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Professional Work
              </ScrollTypeHeading>

              {/* Hyde & Seek */}
              <h3 id="hyde-and-seek" className="text-xl font-serif mb-3">
                Hyde &amp; Seek — PR &amp; Communications Intern
              </h3>
              <div className="mb-6 flex flex-col md:flex-row md:items-start gap-4">
                <div ref={hydeAndSeekTextRef} className="w-full md:w-1/2">
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
            </div>

            {/* Desktop Sidebar — closes here since its content (photo/table) is already
                fully shown by this point; Flow and Mons Monday below render at the card's
                true full width instead of the narrower column this sidebar would impose. */}
            <aside className="hidden md:block w-[300px] flex-shrink-0 order-1 md:order-2">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                <SidebarContent />
              </div>
            </aside>
          </div>

          {/* Flow Mountain Bike — full card width, so the 50/50 split lands on the
              card's true center rather than the narrower column the sidebar imposes above. */}
          <h3 id="flow-mountain-bike" className="text-xl font-serif mt-10 mb-3">
            Flow Mountain Bike — Content Syndication and Social Media Manager
          </h3>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-center gap-4">
            <div ref={flowTextRef} className="w-full md:w-1/2">
              <p className="mb-4 leading-relaxed relative z-10">
                Since 2025, I've managed Flow Mountain Bike's social presence and content
                syndication, reaching a cumulative audience of 375,000. I redesigned the
                publication's syndication system and introduced Canva and Sprout Social,
                creating a collaborative workflow for the team, and plan, build and send
                Flow's weekly eDM to 30,000 subscribers, achieving a 25–30% open rate.
              </p>
              <p className="leading-relaxed relative z-10">
                This role has sharpened my instincts for audience interest, timing and
                engagement drivers, and given me practical experience lifting output,
                tightening processes and improving brand storytelling consistency across a
                large syndication network.
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
                  {article.shortTitle === "Instagram" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-150">
                      <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-md" fill="white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.198-4.354-2.618-6.782-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                    </div>
                  )}
                  {article.shortTitle === "Facebook" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-150">
                      <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-md" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Mons Monday Podcast */}
          <h3 id="mons-monday-podcast" className="text-xl font-serif mt-10 mb-3">
            The Mons Monday Podcast — Producer
          </h3>
          <p className="mb-4 leading-relaxed relative z-10">
            I pitched a profile-led podcast to Mons Monday and secured the collaboration
            through cold outreach in 2025, developing the podcast's strategy and systems for
            planning, recording, editing, feedback and distribution. The podcast debuted at
            number three on the Apple Australia Arts chart, and went on to secure two
            commercial partnerships, with LBDO and Krush Organics.
          </p>
          <p className="mb-6 leading-relaxed relative z-10">
            Producing the podcast end-to-end — from conceptualising and editing promotional
            video material to managing partner and audience communications — gave me a
            grounding in production workflow management and post-launch performance
            analysis.
          </p>

          {/* Launch GIF + episode list, side by side, centered as a self-contained block */}
          <div className="my-6 w-full flex justify-center">
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

          {/* RMIT Coursework — own section, sitting after the professional work since it's
              academic rather than professional experience, but still evidences the hard-news
              training that underpins the comms work above. */}
          <ScrollTypeHeading id="course-volunteer-work" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            Course Work
          </ScrollTypeHeading>
          <p className="mb-4 leading-relaxed relative z-10">
            Hard-news and investigative reporting completed as part of my Bachelor of
            Communication (Journalism) at RMIT, plus freelance feature writing — proof of
            the research rigour, verification habits and news judgement that carry directly
            into PR and comms work.
          </p>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div ref={courseWorkTextRef} className="w-full md:w-1/2">
              <ul className="list-disc ml-6 leading-relaxed mb-6 relative z-10">
                {/* Forte piece */}
                <li className="mb-2">
                  <a
                    href={FORTE_ARTICLE.url}
                    className="text-[#0645ad] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {FORTE_ARTICLE.title}
                  </a>{" "}
                  <span className="text-[#54595d]">— Published in Forte Magazine</span>
                  <p className="text-sm text-[#54595d] mt-1 mb-0">
                    Profile of a 14-year community campaign against Alcoa's bid to use
                    groundwater to fill its former Anglesea coal mine, and the science
                    linking the pumping to the river's decline.
                  </p>
                </li>

                {/* Remaining course work pieces */}
                {COURSE_WORK_ARTICLES.map((article) => (
                  <li className="mb-2" key={article.url}>
                    <a
                      href={article.url}
                      className="text-[#0645ad] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>{" "}
                    {article.tag && (
                      <span className="text-[#54595d]">— {article.tag}</span>
                    )}
                    <p className="text-sm text-[#54595d] mt-1 mb-0">{article.brief}</p>

                    {article.children && (
                      <ul className="list-disc ml-6 mt-1">
                        {article.children.map((child) => (
                          <li className="mb-1" key={child.url}>
                            <a
                              href={child.url}
                              className="text-[#0645ad] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {child.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="w-full md:w-1/2 flex-shrink-0 flex flex-col gap-4"
              style={{ height: courseWorkHeight ? `${courseWorkHeight}px` : "1500px" }}
            >
              <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[#a2a9b1]">
                <iframe
                  src="https://storymaps.arcgis.com/stories/bec0b064fef64ba5afa724b977aeb9ba"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  allow="geolocation"
                  title="Off the Rails: Is V/Line Failing Geelong Commuters? — StoryMap"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[#a2a9b1]">
                <iframe
                  src="https://www.fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Friends of Anglesea River Continue Five-Year Fight Amid Mining Corp Alcoa's Latest Water Bid — Forte Magazine"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[#a2a9b1]">
                <iframe
                  src="https://storymaps.arcgis.com/stories/6f8abf2a943d4b2f90f8ab996418d772"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  allow="geolocation"
                  title="Is Citizen Science Saving the Environment? — StoryMap"
                />
              </div>
            </div>
          </div>

          {/* Course Work video pieces — vertical cut and horizontal package from the
              V/Line StoryMap, shown side by side at matching height since one is
              portrait and one is landscape. The wrapping divs are set 56px taller than
              the visible frame and the iframe shifted up by the same amount, clipping
              off Google Drive's own player toolbar so only the video shows. */}
          <div className="mt-10 mb-10 flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6">
            <div
              className="w-full max-w-[280px] md:w-[280px] flex-shrink-0 overflow-hidden rounded-xl border border-[#a2a9b1]"
              style={{ height: "500px" }}
            >
              <iframe
                src="https://drive.google.com/file/d/1pO-khla0hOTDAGF6zG129GYgArtrXlXB/preview?autoplay=1&mute=1"
                width="100%"
                height="556px"
                style={{ marginTop: "-56px", border: "none" }}
                allow="autoplay"
                title="Off the Rails — vertical video cut"
              />
            </div>
            <div
              className="w-full md:flex-1 overflow-hidden rounded-xl border border-[#a2a9b1]"
              style={{ height: "500px" }}
            >
              <iframe
                src="https://drive.google.com/file/d/1j3Oknl1aBwhFBrSOkE6PBH1vNp4zAd8D/preview?autoplay=1&mute=1"
                width="100%"
                height="556px"
                style={{ marginTop: "-56px", border: "none" }}
                allow="autoplay"
                title="Off the Rails — full video package"
              />
            </div>
          </div>

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
            Let's chat!
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
