import { useEffect, useRef } from "react";
import profilePic from "@/assets/profile_pic.gif";
import NotableProjectsPixelation from "@/components/NotableProjectsPixelation";
import { ScrollTypeHeading } from "@/components/ScrollTypeHeading";

const MONS_MONDAY_EPISODES = [
  { id: "3HbiKzvld9G51AgZEv1JL3", title: "One Year Without Alcohol: Day 236", duration: "41 min", date: "Jun 9, 2025" },
  { id: "4BQNYu5ToaFbC5wSIpCW3v", title: "20 Things I Wish I Knew at 20", duration: "55 min", date: "Jun 23, 2025" },
  { id: "3ZOuHvoGEZchfqr5YIE704", title: "Live from the Campsite", duration: "33 min", date: "Jul 7, 2025" },
  { id: "6M9acNMBf4em7iZumavOal", title: "Life Before Sabi: How I Got Here", duration: "1 hr 5 min", date: "Jul 21, 2025" },
  { id: "6MIO4GqVcqZekF5l5DxxWe", title: "When Nothing Goes To Plan", duration: "52 min", date: "Aug 4, 2025" },
];

const WRITING_SAMPLES = [
  {
    title: "What Is Trash Free Trails?",
    outlet: "Flow Mountain Bike",
    url: "https://flowmountainbike.com/features/what-is-trash-free-trails/",
  },
  {
    title: "Fun First, Fast Always: Maddie Lloyd Might Be Australia's Fastest 13-Year-Old",
    outlet: "Flow Mountain Bike",
    url: "https://flowmountainbike.com/features/fun-first-fast-always-maddie-lloyd-might-be-australias-fastest-13-year-old/",
  },
  {
    title: "Who Is Downhill Mountain Biker Jackson Connelly?",
    outlet: "Flow Mountain Bike",
    url: "https://flowmountainbike.com/features/who-is-downhill-mountain-biker-jackson-connelly/",
  },
  {
    title: "Giant STP 26 Review",
    outlet: "Flow Mountain Bike",
    url: "https://flowmountainbike.com/tests/giant-stp-26-review/",
  },
  {
    title: "Friends of Anglesea River Continue Five-Year Fight Amid Mining Corp Alcoa's Latest Water Bid",
    outlet: "Forte Magazine",
    url: "https://www.fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/",
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
      <div className="text-center p-3 pb-0">
        <div className="relative w-full aspect-square">
          <div className="absolute inset-0 bg-[#FF69B4]" style={{ zIndex: 2 }} />
          <img
            src={profilePic}
            alt="Sid Caulfield"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 20 }}
          />
        </div>
        <div className="text-xs text-[#54595d] mt-1 mb-3">Caulfield in 2025</div>
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
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Occupation</th>
            <td className="py-2 px-2 relative z-10">
              Freelance Journalist, Content Syndication and Social Media Manager, Podcast Producer
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
          <tr className="border-t border-[#a2a9b1]">
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Resume</th>
            <td className="py-2 px-2 relative z-10">
              <a
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://drive.google.com/file/d/1T26aUBmdWnSU0To83Md1-1DvCs1Ft6yt/view?usp=sharing"
              >
                View PDF
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const EPortfolio = () => {
  // This page is self-contained: disable the site-wide custom cursor while it's mounted,
  // without touching any files outside this page.
  useEffect(() => {
    document.body.classList.add("eportfolio-page");
    return () => document.body.classList.remove("eportfolio-page");
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

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content Column */}
            <div className="flex-1 order-2 md:order-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#examples-of-my-work" className="hover:underline">Examples of My Work</a></li>
                  <li><a href="#career-overview" className="hover:underline">Career Overview</a>
                    <ol className="list-decimal ml-4 text-[#0645ad]">
                      <li><a href="#flow-mountain-bike" className="hover:underline">Flow Mountain Bike</a></li>
                      <li><a href="#mons-monday-podcast" className="hover:underline">The Mons Monday Podcast</a></li>
                      <li><a href="#hyde-and-seek" className="hover:underline">Hyde &amp; Seek Internship</a></li>
                    </ol>
                  </li>
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

              {/* Examples of My Work */}
              <ScrollTypeHeading id="examples-of-my-work" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Examples of My Work
              </ScrollTypeHeading>
              <p className="mb-4 leading-relaxed relative z-10">
                A selection of freelance, university and feature writing, spanning journalism, gear
                reviews and profile pieces.
              </p>
              <ul className="list-disc ml-6 leading-relaxed mb-6 relative z-10">
                {WRITING_SAMPLES.map((sample) => (
                  <li key={sample.url} className="mb-1">
                    <a
                      href={sample.url}
                      className="text-[#0645ad] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sample.title}
                    </a>{" "}
                    <span className="text-[#54595d]">— {sample.outlet}</span>
                  </li>
                ))}
              </ul>

              {/* Career Overview */}
              <ScrollTypeHeading id="career-overview" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Career Overview
              </ScrollTypeHeading>

              {/* Flow Mountain Bike */}
              <h3 id="flow-mountain-bike" className="text-xl font-serif mt-4 mb-2">
                Flow Mountain Bike — Content Syndication and Social Media Manager
              </h3>
              <p className="mb-2 leading-relaxed relative z-10">
                Since 2025, Caulfield has managed Flow Mountain Bike's social presence and content
                syndication, reaching a cumulative audience of 375,000. He redesigned the publication's
                syndication system and introduced Canva and Sprout Social, creating a collaborative
                workflow for the team, and plans, builds and sends Flow's weekly eDM to 30,000
                subscribers, achieving a 25–30% open rate.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                This role has sharpened his instincts for audience interest, timing and engagement
                drivers, and given him practical experience lifting output, tightening processes and
                improving brand storytelling consistency across a large syndication network.
              </p>

              {/* Mons Monday Podcast */}
              <h3 id="mons-monday-podcast" className="text-xl font-serif mt-4 mb-2">
                The Mons Monday Podcast — Producer
              </h3>
              <p className="mb-2 leading-relaxed relative z-10">
                Caulfield pitched a profile-led podcast to Mons Monday and secured the collaboration
                through cold outreach in 2025, developing the podcast's strategy and systems for
                planning, recording, editing, feedback and distribution. The podcast debuted at number
                three on the Apple Australia Arts chart, and went on to secure two commercial
                partnerships, with LBDO and Krush Organics.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
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
                        className="flex items-center gap-2 border border-[#a2a9b1] bg-[#f8f9fa] hover:bg-[#eaecf0] transition-colors duration-150 rounded-lg px-2 py-1.5 no-underline"
                        style={{ height: "88px" }}
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1DB954] flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-[#54595d]">Episode {i + 1}</div>
                          <div className="text-sm font-semibold text-[#202122] truncate">
                            {ep.title}
                          </div>
                          <div className="text-xs text-[#54595d]">
                            {ep.date} · {ep.duration}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hyde & Seek */}
              <h3 id="hyde-and-seek" className="text-xl font-serif mt-4 mb-2">
                Hyde &amp; Seek — PR &amp; Communications Intern
              </h3>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-stretch">
                <div className="flex-1">
                  <p className="mb-2 leading-relaxed relative z-10">
                    Since July 2026, Caulfield has supported strategic communications and media
                    relations for clients across the fintech, tech and consumer sectors at Hyde &amp;
                    Seek, a boutique PR agency, working directly with the Founding Director. His
                    responsibilities include writing and pitching press releases and media alerts,
                    building and maintaining media mapping and journalist tracking systems, and
                    monitoring live news cycles to identify timely press opportunities for clients.
                  </p>
                  <p className="leading-relaxed relative z-10">
                    This placement has deepened his understanding of client servicing, research rigour
                    and pitch development within an agency structure, and strengthened his grounding in
                    brand-led thinking and integrated campaign execution.
                  </p>
                </div>
                <div className="w-full md:w-[300px] flex-shrink-0">
                  <iframe
                    src="https://www.instagram.com/p/DbKcgg6M1Bu/embed"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency
                    style={{ border: "none", overflow: "hidden", borderRadius: "12px", minHeight: "340px" }}
                    title="Hyde & Seek Instagram post"
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

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-[300px] flex-shrink-0 order-1 md:order-2">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                <SidebarContent />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#a7d7f9] mt-2 py-6">
        <div className="max-w-[1000px] mx-auto px-4 text-xs text-[#54595d]">
          <p>
            This page was last edited on{" "}
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-2">Content is available under CC BY-SA 4.0 unless otherwise noted.</p>
        </div>
      </footer>
    </div>
  );
};

export default EPortfolio;
