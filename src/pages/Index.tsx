import profilePic from "@/assets/profile_pic.gif";
import notableSmallGif from "@/assets/notable-small.gif";

const Index = () => {
  return <div className="min-h-screen bg-[#f6f6f6]">
      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]">
        
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="bg-white border border-[#a7d7f9] p-6">
          {/* Title */}
          <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4">
            Sid Caulfield
          </h1>

          <div className="flex gap-6">
            {/* Main Content Column */}
            <div className="flex-1">
              {/* Table of Contents */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block">
                <div className="font-bold mb-2">Contents</div>
                <ol className="list-decimal ml-6 text-sm text-[#0645ad]">
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
              <p className="mb-4 leading-relaxed">
                <strong>Sid Caulfield</strong> is an Australian content and comms professional based in Melbourne, Victoria. His work spans podcast production, digital journalism and social media strategy. Caulfield is known for his ability to tap into the cultural zeitgeist, synthesising and merging it with ideas of contemporary Australian life and community storytelling. Projects slated for 2026 include <em>How to Pull Off the Most Profitable Bunnings Sausage Sizzle of All Time</em>, <em>How to Ride Your Bike to the Pub/Club</em> and <em>Why the F*ck Does My Beer Cost 18 Bucks?</em> He is currently a freelance journalist and the content syndication and social media manager at Flow Mountain Bike.
              </p>

              {/* Career Overview Section */}
              <h2 id="career-overview" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Career Overview
              </h2>
              <p className="mb-4 leading-relaxed">
                Whether it's bringing a group of 30 strangers together for an arvo on the bike or helping influencers lay down some dating lore on the mic, Caulfield's career, thus far, has been one of following his nose and creative urges. Here are the highlights.
              </p>

              {/* Flow Mountain Bike */}
              <h3 id="flow-mountain-bike" className="text-xl font-serif mt-4 mb-2">
                Flow Mountain Bike
              </h3>
              <p className="mb-2 leading-relaxed">
                In 2025, Caulfield joined Flow Mountain Bike as Content Syndication and Social Media Manager. In this role, he oversees the publication's social media presence and cross-platform content distribution, reaching a cumulative audience of more than 360,000.
              </p>
              <p className="mb-4 leading-relaxed">
                He redesigned Flow's syndication systems and introduced new workflow tools, including Canva and Sprout Social, to improve efficiency and brand consistency. His work involves repurposing long-form editorial content for multiple platforms, coordinating campaign launches, managing email marketing to a subscriber base of approximately 30,000, and analysing audience performance data to guide editorial strategy. Caulfield also collaborates with commercial partners on campaigns, events and giveaways, and contributes freelance writing to the publication.
              </p>

              {/* The Mons Monday Podcast */}
              <h3 id="mons-monday-podcast" className="text-xl font-serif mt-4 mb-2">
                The Mons Monday Podcast
              </h3>
              <p className="mb-2 leading-relaxed">
                Caulfield is the producer of The Mons Monday Podcast, a profile-based interview series launched in 2025. He secured the project through cold outreach and developed the podcast's format, production systems and distribution strategy.
              </p>
              <p className="mb-4 leading-relaxed">
                He manages end-to-end production, including research, recording, editing, audience communications and release scheduling. The podcast debuted at number three on the Apple Australia Arts chart and later secured commercial partnerships with LBDO and Krush Organics. Caulfield also created and edited video promotional material to support the launch and ongoing audience growth.
              </p>

              {/* Freelance Work */}
              <h3 id="freelance-work" className="text-xl font-serif mt-4 mb-2">
                Freelance Work
              </h3>
              <p className="mb-4 leading-relaxed">
                Alongside his staff role, Caulfield undertakes freelance projects across journalism, content strategy and digital media. His work includes feature writing, interview-based storytelling, social media management and campaign support for publications and organisations. He has contributed to outlets including Forte Magazine and Flow Mountain Bike, and regularly works with brands and community partners on content development and distribution.
              </p>

              {/* Notable Projects Section with GIF floated right */}
              <div className="relative">
                {/* GIF floated to right */}
                <img 
                  alt="Sid Caulfield — small animated clip" 
                  src={notableSmallGif} 
                  decoding="async" 
                  className="mw-file-element float-right ml-4 mb-2"
                  style={{ width: '200px', height: 'auto' }}
                />
                
                <h2 id="notable-projects" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                  Notable Projects
                </h2>

                <ul className="list-disc ml-6 mb-4 leading-relaxed">
                  <li><strong>Flow Mountain Bike</strong> — Facebook, Instagram, YouTube campaigns and syndication projects.</li>
                  <li><strong>The Mons Monday Podcast</strong> — Episodes, video teaser and launch marketing.</li>
                  <li><strong>Freelance writing</strong> — Forte Magazine, Flow Mountain Bike.</li>
                  <li><strong>Animation</strong> — Brain (short form / experimental).</li>
                </ul>
                <div className="clear-both"></div>
              </div>

              {/* Early Life and Education Section */}
              <h2 id="early-life" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Early Life and Education
              </h2>
              <p className="mb-4 leading-relaxed">
                Sidney Joseph Caulfield was born on July 27, 2003, in East Melbourne, Victoria, Australia.
              </p>
              <p className="mb-4 leading-relaxed">
                Caulfield completed his secondary education at Belmont High School in Geelong, where he studied Media, Linguistics and Indonesian.
              </p>
              <p className="mb-4 leading-relaxed">
                He went on to study at <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a> and will graduate with a Bachelor of Communication (Journalism) in 2026.
              </p>

              {/* Skills and Areas of Expertise Section */}
              <h2 id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Skills and Areas of Expertise
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Journalism",
                  "Multimedia production",
                  "Podcast production",
                  "Audio editing and post-production",
                  "Social media content and syndication",
                  "Digital content strategy",
                  "Feature writing",
                  "Copywriting and editing",
                  "Email marketing (eDM) production",
                  "Audience development and analytics",
                  "Project coordination and workflow design",
                  "Research and interview techniques"
                ].map((skill) => (
                  <span key={skill} className="bg-[#eaecf0] border border-[#a2a9b1] px-2 py-1 text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>

              {/* References Section */}
              <h2 id="references" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                References
              </h2>
              <p className="mb-4 leading-relaxed">
                — Available upon request
              </p>
            </div>

            {/* Infobox Sidebar */}
            <aside className="w-[300px] flex-shrink-0">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                {/* Infobox title */}
                <div className="bg-[#eaecf0] text-center font-bold text-[125%] py-2 border-b border-[#a2a9b1]">
                  Sid Caulfield
                </div>

                {/* Infobox image */}
                <div className="text-center p-3 pb-0">
                  <div className="relative w-full aspect-square bg-[#FF69B4]">
                    <img src={profilePic} alt="Sid Caulfield" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="text-xs text-[#54595d] mt-1 mb-3">
                    Caulfield in 2025
                  </div>
                  {/* Spotify Embed with autoplay attempt */}
                  <iframe className="mb-3" style={{
                  borderRadius: '12px'
                }} src="https://open.spotify.com/embed/track/4YACgyR9xdAcyJMBV8H6oX?utm_source=generator&theme=0&autoplay=1" width="100%" height="80" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                </div>

                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Born
                      </th>
                      <td className="py-2 px-2">Sidney Joseph Caulfield <br />
                        July 27, 2003 (age 21)
                        <br />
                        East Melbourne, Victoria, AUS
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Occupation
                      </th>
                      <td className="py-2 px-2">
                        Freelance Journalist
                        <br />
                        Content Syndication and Social Media Manager
                        <br />
                        Podcast Producer
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Location
                      </th>
                      <td className="py-2 px-2">Greater Melbourne, Victoria, Australia</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Years active
                      </th>
                      <td className="py-2 px-2">2025—present</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Education
                      </th>
                      <td className="py-2 px-2">
                        <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">
                          RMIT University
                        </a>
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Contact
                      </th>
                      <td className="py-2 px-2">
                        <a className="text-[#0645ad] hover:underline" href="mailto:caulfieldsid@gmail.com">caulfieldsid@gmail.com</a>
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Social
                      </th>
                      <td className="py-2 px-2">
                        <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/sid-caulfield-27b838356/">
                          LinkedIn
                        </a>
                        <br />
                        <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/sidcaulfield/">
                          Instagram
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
    </div>;
};
export default Index;
