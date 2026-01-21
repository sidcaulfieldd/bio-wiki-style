import { useRef } from "react";
import profilePic from "@/assets/profile_pic.gif";
import NotableProjectsPixelation from "@/components/NotableProjectsPixelation";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
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

        <div className="bg-white border border-[#a7d7f9] p-6">
          {/* Title */}
          <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4">
            Sid Caulfield
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content Column */}
            <div className="flex-1 order-2 md:order-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
                <div className="font-bold mb-2 relative z-10">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
                  <li><a href="#career-overview" className="hover:underline">Career Overview</a>
                    <ol className="list-decimal ml-4 text-[#0645ad]">
                      <li><a href="#flow-mountain-bike" className="hover:underline">Flow Mountain Bike</a></li>
                      <li><a href="#mons-monday-podcast" className="hover:underline">The Mons Monday Podcast</a></li>
                      <li><a href="#freelance-work" className="hover:underline">Freelance Work</a></li>
                    </ol>
                  </li>
                  <li><a href="#notable-projects" className="hover:underline">Notable Projects</a></li>
                  <li><a href="#early-life" className="hover:underline">Early Life and Education</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#references" className="hover:underline">References</a></li>
                </ol>
              </div>

              {/* Lead Section */}
              <p className="mb-4 leading-relaxed relative z-10">
                <strong>Sid Caulfield</strong> is an Australian content and comms professional based in <a href="https://en.wikipedia.org/wiki/Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>. His work spans podcast production, digital journalism and social media strategy. Caulfield is known for his ability to tap into the cultural zeitgeist, connecting it with contemporary Australian life and community storytelling. Projects slated for 2026 include <em>How to Pull Off the Most Profitable Bunnings Sausage Sizzle of All Time</em>, <em>How to Ride Your Bike to the Pub/Club</em> and <em>Why the F*ck Does My Beer Cost 18 Bucks?</em> He is currently a freelance journalist and the content syndication and social media manager at <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a> and <a href="https://en.wikipedia.org/wiki/New_Zealand" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">New Zealand</a>'s largest digital mountain bike publication.
              </p>

              {/* Career Overview Section */}
              <h2 id="career-overview" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Career Overview
              </h2>
              <p className="mb-4 leading-relaxed relative z-10">
                Whether it's bringing a group of 30 strangers together for an arvo on the bike or helping influencers lay down some dating lore on the mic, Caulfield's career, thus far, has been one of following his nose and creative urges. Here are the highlights!!
              </p>

              {/* Flow Mountain Bike */}
              <h3 id="flow-mountain-bike" className="text-xl font-serif mt-4 mb-2">
                Flow Mountain Bike
              </h3>
              <p className="mb-2 leading-relaxed relative z-10">
                In 2025, Caulfield joined <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a> as Content Syndication and Social Media Manager. In this role, he oversees the publication's social media presence and cross-platform content distribution, reaching a cumulative audience of ~360,000.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                He redesigned Flow's syndication systems and introduced new workflow tools, including <a href="https://en.wikipedia.org/wiki/Canva" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Canva</a> and <a href="https://en.wikipedia.org/wiki/Sprout_Social" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Sprout Social</a>, to improve efficiency and brand consistency. His work involves repurposing long-form editorial content for multiple platforms, coordinating campaign launches, managing email marketing to a subscriber base of ~30,000 and analysing audience performance data to guide editorial strategy. Caulfield also collaborates with commercial partners on campaigns, events and giveaways, and contributes freelance writing to the publication.
              </p>

              {/* The Mons Monday Podcast */}
              <h3 id="mons-monday-podcast" className="text-xl font-serif mt-4 mb-2">
                The Mons Monday Podcast
              </h3>
              <p className="mb-2 leading-relaxed relative z-10">
                Caulfield is the producer of <a href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">The Mons Monday Podcast</a>, a profile-based podcast launched in 2025. He secured the project through cold outreach and developed the podcast's format, production systems and distribution strategy.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                He manages end-to-end production, including research, recording, editing, audience communications and release scheduling. The podcast debuted at number three on the Apple Australia Arts chart and later secured commercial partnerships with <a href="https://www.lbdo.com/collections/all-products?gad_source=1&gad_campaignid=14826148030&gbraid=0AAAAABSqxZj_P5N44ioeWjMXbmD8E1HzK&gclid=Cj0KCQiAsY3LBhCwARIsAF6O6XhjFMB4m2JTkrRLBdgIY8Us7hSLQOuoitgvvYl-0BgYuKkWok4dEYoaAm5fEALw_wcB" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">LBDO</a> and <a href="https://krushorganics.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Krush Organics</a>. Caulfield also created and edited video promotional material to support the launch and ongoing audience growth.
              </p>

              {/* Freelance Work */}
              <h3 id="freelance-work" className="text-xl font-serif mt-4 mb-2">
                Freelance Work
              </h3>
              <p className="mb-4 leading-relaxed relative z-10">
                Alongside his staff role, Caulfield undertakes freelance projects across journalism, content strategy and digital media. His work includes feature writing, interview-based storytelling, social media management and campaign support for publications and organisations. He has contributed to outlets including <a href="https://fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Forte Magazine</a> and <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>, and regularly works with brands and community partners on content development and distribution.
              </p>

              {/* Notable Projects Section with GIF */}
              <h2 id="notable-projects" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Notable Projects
              </h2>
              
              <ul className="list-disc ml-6 leading-relaxed mb-4 relative z-10">
                <li><strong>Flow Mountain Bike</strong> — <a href="https://www.facebook.com/flowmountainbike/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>, <a href="https://www.instagram.com/flow_mtb/?hl=en" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="https://www.youtube.com/flowmountainbike" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>.</li>
                <li><strong>The Mons Monday Podcast</strong> — <a href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Episodes</a>, <a href="https://www.instagram.com/reel/DKZIy7nzjtx/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">video teaser/launch</a>.</li>
                <li><strong>Freelance writing</strong> — <a href="https://fortemagazine.com.au/friends-of-anglesea-river-continue-five-year-fight-amid-mining-corp-alcoas-latest-water-bid/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Forte Magazine</a>, <a href="https://flowmountainbike.com/" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Flow Mountain Bike</a>.</li>
                <li><strong>Animation</strong> — <a href="https://www.youtube.com/watch?v=YKBWF2B2nw0&t=16s&pp=ygUTc2lkIGNhdWxmaWVsZCBicmFpbg%3D%3D" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Brain</a>.</li>
              </ul>
              
             {/* GIF centered between sections with canvas pixelation effect */}
<div className="flex justify-center my-6">
  <NotableProjectsPixelation />
</div>

              {/* Early Life and Education Section */}
              <h2 id="early-life" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Early Life and Education
              </h2>
              <p className="mb-4 leading-relaxed relative z-10">
                Sidney Joseph Caulfield was born on July 27, 2003, in <a href="https://en.wikipedia.org/wiki/East_Melbourne" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">East Melbourne</a>, <a href="https://en.wikipedia.org/wiki/Victoria_(state)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Victoria</a>, <a href="https://en.wikipedia.org/wiki/Australia" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Australia</a>.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                Caulfield completed his secondary education at <a href="https://en.wikipedia.org/wiki/Belmont_High_School_(Victoria)" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Belmont High School</a> in <a href="https://en.wikipedia.org/wiki/Geelong" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">Geelong</a>, where he studied Media, Linguistics and Indonesian.
              </p>
              <p className="mb-4 leading-relaxed relative z-10">
                He went on to study at <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a> and will graduate with a Bachelor of Communication (Journalism) in 2026.
              </p>

              {/* Skills and Areas of Expertise Section */}
              <h2 id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Skills and Areas of Expertise
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Adobe Creative Suite",
                  "Content strategy and scheduling",
                  "Cross-platform syndication",
                  "Tailored vertical content distribution",
                  "SEO and metadata optimisation",
                  "Copywriting and editing",
                  "eDM planning, delivery and performance analysis",
                  "Audience profiling and insights",
                  "Integrated publishing and analytics tools",
                  "Asana and workflow design",
                  "Sprout Social",
                  "Canva (team templates and system design)"
                ].map((skill) => (
                  <span key={skill} className="bg-[#eaecf0] border border-[#a2a9b1] px-2 py-1 text-sm rounded cursor-pointer hover:bg-[#c8ccd1] hover:border-[#72777d] transition-colors duration-150">
                    {skill}
                  </span>
                ))}
              </div>

              {/* References Section */}
              <h2 id="references" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                References
              </h2>
              <p className="mb-4 leading-relaxed relative z-10">
                — Available upon request!!
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
      <footer className="bg-white border-t border-[#a7d7f9] mt-8 py-6">
        <div className="max-w-[1000px] mx-auto px-4 text-xs text-[#54595d]">
          <p>
            This page was last edited on{" "}
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
          <p className="mt-2">
            Content is available under CC BY-SA 4.0 unless otherwise noted.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Sidebar content extracted into a reusable component
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
        {/* Pink background (below trail) + GIF (above trail) */}
        <div className="relative w-full aspect-square">
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
            {/* Left column (th) - z-[1], below tracker */}
            <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2 relative z-[1]">Born</th>
            {/* Right column (td) - z-10, above tracker */}
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
              <br />
              <a
                className="text-[#0645ad] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/sidcaulfield/"
              >
                Instagram
              </a>
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
