import profilePic from "@/assets/profile_pic.gif";
const Index = () => {
  return <div className="min-h-screen bg-[#f6f6f6]">
      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]">
        <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-2xl font-serif">Lit-ipedia</div>
          <div className="text-sm text-[#54595d]">Sid upside down spells piS</div>
        </div>
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
                      <li><a href="#surf-instruction" className="hover:underline">Surf Instruction and Management</a></li>
                      <li><a href="#podcast-production" className="hover:underline">Podcast Production</a></li>
                      <li><a href="#journalism" className="hover:underline">Journalism and Media Work</a></li>
                      <li><a href="#freelance" className="hover:underline">Freelance Projects</a></li>
                    </ol>
                  </li>
                  <li><a href="#notable-projects" className="hover:underline">Notable Projects</a></li>
                  <li><a href="#early-life" className="hover:underline">Early Life and Education</a></li>
                  <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
                  <li><a href="#publications" className="hover:underline">Publications</a></li>
                  <li><a href="#awards" className="hover:underline">Awards and Recognition</a></li>
                  <li><a href="#references" className="hover:underline">References</a></li>
                  <li><a href="#external-links" className="hover:underline">External Links</a></li>
                </ol>
              </div>

              {/* Lead Section */}
              <p className="mb-4 leading-relaxed">
                <strong>Sid Caulfield</strong> is an Australian journalist and multimedia content creator based in Melbourne, Victoria. He works across podcast production, digital journalism, social media strategy, and surf instruction. Caulfield is known for his work exploring subcultures, contemporary Australian life, and community storytelling. He currently works as a freelance journalist contributing to various Australian and international publications while managing surf education programs.
              </p>

              {/* Career Overview Section */}
              <h2 id="career-overview" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Career Overview
              </h2>
              <p className="mb-4 leading-relaxed">
                Caulfield's career spans multiple disciplines within media, education, and community engagement. His work combines traditional journalism with emerging digital formats and hands-on instruction.
              </p>

              {/* Surf Instruction and Management */}
              <h3 id="surf-instruction" className="text-xl font-serif mt-4 mb-2">
                Surf Instruction and Management
              </h3>
              <p className="mb-2 leading-relaxed">
                Caulfield has worked extensively in surf education, developing programs and managing operations for surf schools.
              </p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>Developed and delivered surf instruction programs for beginners through advanced learners</li>
                <li>Managed day-to-day operations including scheduling, equipment, and safety protocols</li>
                <li>Coordinated team of instructors and facilitated staff training</li>
                <li>Built community partnerships to expand program reach</li>
              </ul>

              {/* Podcast Production */}
              <h3 id="podcast-production" className="text-xl font-serif mt-4 mb-2">
                Podcast Production
              </h3>
              <p className="mb-2 leading-relaxed">
                As a podcast producer, Caulfield has developed and produced content for various networks and independent projects.
              </p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>End-to-end podcast production including research, scripting, recording, and editing</li>
                <li>Audio engineering and post-production for narrative and interview formats</li>
                <li>Audience development and distribution strategy</li>
                <li>Guest coordination and interview preparation</li>
              </ul>

              {/* Journalism and Media Work */}
              <h3 id="journalism" className="text-xl font-serif mt-4 mb-2">
                Journalism and Media Work
              </h3>
              <p className="mb-2 leading-relaxed">
                Caulfield has contributed to numerous Australian and international publications as a freelance journalist.
              </p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>Feature writing for <a href="https://en.wikipedia.org/wiki/Vice_Media" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">VICE</a>, <a href="https://en.wikipedia.org/wiki/Special_Broadcasting_Service" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">SBS</a>, ABC Australia, and i-D</li>
                <li>Specialisation in subculture reporting and community-focused storytelling</li>
                <li>Social media listening and audience engagement analysis</li>
                <li>Copywriting for digital and print campaigns</li>
              </ul>

              {/* Freelance Projects */}
              <h3 id="freelance" className="text-xl font-serif mt-4 mb-2">
                Freelance Projects
              </h3>
              <p className="mb-2 leading-relaxed">
                Beyond staff positions, Caulfield undertakes a range of freelance projects across media and communications.
              </p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>Content strategy and social media management for brands and organisations</li>
                <li>Documentary research and production assistance</li>
                <li>Communications consulting for community groups and startups</li>
                <li>Event coverage and live reporting</li>
              </ul>

              {/* Notable Projects Section */}
              <h2 id="notable-projects" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Notable Projects
              </h2>

              <div className="mb-4">
                <p className="leading-relaxed">
                  <strong>"Running the Most Profitable Bunnings Sausage Sizzle of All Time"</strong> — A documentary for <a href="https://en.wikipedia.org/wiki/Special_Broadcasting_Service" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">SBS</a> exploring Australian community fundraising culture through the lens of the iconic Bunnings sausage sizzle.
                </p>
                <ul className="list-disc ml-6 text-sm leading-relaxed">
                  <li><em>Role:</em> Producer and Writer</li>
                  <li><em>Impact:</em> Won two Grammy Awards; critical acclaim</li>
                  <li><em>Link:</em> <a href="#" className="text-[#0645ad] hover:underline">[Placeholder: SBS Documentary Link]</a></li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="leading-relaxed">
                  <strong>[Placeholder: Project Title]</strong> — [Placeholder: Brief description of the project and its focus.]
                </p>
                <ul className="list-disc ml-6 text-sm leading-relaxed">
                  <li><em>Role:</em> [Placeholder]</li>
                  <li><em>Impact:</em> [Placeholder: Metrics or outcomes]</li>
                  <li><em>Link:</em> <a href="#" className="text-[#0645ad] hover:underline">[Placeholder URL]</a></li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="leading-relaxed">
                  <strong>[Placeholder: Project Title]</strong> — [Placeholder: Brief description of the project and its focus.]
                </p>
                <ul className="list-disc ml-6 text-sm leading-relaxed">
                  <li><em>Role:</em> [Placeholder]</li>
                  <li><em>Impact:</em> [Placeholder: Metrics or outcomes]</li>
                  <li><em>Link:</em> <a href="#" className="text-[#0645ad] hover:underline">[Placeholder URL]</a></li>
                </ul>
              </div>

              {/* Early Life and Education Section */}
              <h2 id="early-life" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Early Life and Education
              </h2>
              <p className="mb-4 leading-relaxed">
                Sidney Joseph Caulfield was born on July 27, 2003, in East Melbourne, Victoria, Australia.
              </p>
              <p className="mb-4 leading-relaxed">
                Caulfield completed his secondary education at [Placeholder: Secondary School Name] in Melbourne, where he [Placeholder: notable achievements or interests during school years].
              </p>
              <p className="mb-4 leading-relaxed">
                He went on to study at <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a>, graduating with a degree in [Placeholder: Degree Name]. During his university years, Caulfield [Placeholder: relevant achievements, internships, or extracurricular activities].
              </p>
              <p className="mb-4 leading-relaxed">
                <em>Languages:</em> English (native), [Placeholder: other languages if applicable]
              </p>

              {/* Skills and Areas of Expertise Section */}
              <h2 id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Skills and Areas of Expertise
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Journalism", "Multimedia Production", "Audio Editing", "Social Media Content", "Communications", "Podcast Production", "Project Coordination", "Surf Instruction", "Feature Writing", "Copywriting", "Research", "Interview Techniques"].map(skill => <span key={skill} className="border border-[#a2a9b1] bg-[#f8f9fa] px-2 py-1 text-sm">
                    {skill}
                  </span>)}
              </div>

              {/* Publications Section */}
              <h2 id="publications" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Publications
              </h2>
              <p className="mb-2 leading-relaxed italic text-sm text-[#54595d]">Selected works</p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>
                  "[Placeholder: Article Title]" — <em>VICE</em>, 2025. [Placeholder: One-line description]. <a href="#" className="text-[#0645ad] hover:underline">[Link]</a>
                </li>
                <li>
                  "[Placeholder: Article Title]" — <em>SBS</em>, 2025. [Placeholder: One-line description]. <a href="#" className="text-[#0645ad] hover:underline">[Link]</a>
                </li>
                <li>
                  "[Placeholder: Article Title]" — <em>ABC Australia</em>, 2025. [Placeholder: One-line description]. <a href="#" className="text-[#0645ad] hover:underline">[Link]</a>
                </li>
                <li>
                  "[Placeholder: Article Title]" — <em>i-D</em>, 2025. [Placeholder: One-line description]. <a href="#" className="text-[#0645ad] hover:underline">[Link]</a>
                </li>
              </ul>

              {/* Awards and Recognition Section */}
              <h2 id="awards" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Awards and Recognition
              </h2>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>Two Grammy Awards for "Running the Most Profitable Bunnings Sausage Sizzle of All Time" documentary</li>
                <li>[Placeholder: Podcast Name] debuted at No. 3 on Apple Podcasts Australia (Arts category)</li>
                <li>[Placeholder: Additional award or recognition]</li>
              </ul>

              {/* References Section */}
              <h2 id="references" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                References
              </h2>
              <div className="text-sm leading-relaxed border-l-2 border-[#a2a9b1] pl-4 mb-4">
                <p className="mb-3">
                  <sup>1.</sup> <strong>[Placeholder: Reference Name]</strong>, [Placeholder: Title/Position], [Placeholder: Organisation]. <em>"[Placeholder: Brief testimonial or endorsement quote.]"</em> — Available upon request.
                </p>
                <p className="mb-3">
                  <sup>2.</sup> <strong>[Placeholder: Reference Name]</strong>, [Placeholder: Title/Position], [Placeholder: Organisation]. <em>"[Placeholder: Brief testimonial or endorsement quote.]"</em> — Available upon request.
                </p>
                <p className="mb-3">
                  <sup>3.</sup> <strong>[Placeholder: Reference Name]</strong>, [Placeholder: Title/Position], [Placeholder: Organisation]. — Available upon request.
                </p>
              </div>

              {/* External Links Section */}
              <h2 id="external-links" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                External Links
              </h2>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>
                  <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/sid-caulfield-27b838356/">LinkedIn Profile</a>
                </li>
                <li>
                  <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/sidcaulfield/">Instagram (@sidcaulfield)</a>
                </li>
                <li>
                  <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://open.spotify.com/show/3JoJaIgpNMKfDrsUTAx5e9">The Mons Monday Podcast </a>
                </li>
                
                <li>
                  <a className="text-[#0645ad] hover:underline" href="mailto:caulfieldsid@gmail.com">Email: caulfieldsid@gmail.com</a>
                </li>
                <li>
                  <a className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/1T26aUBmdWnSU0To83Md1-1DvCs1Ft6yt/view?usp=sharing">Download Resume (PDF)</a>
                </li>
              </ul>
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
                  {/* Spotify Embed */}
                  <iframe className="mb-3" style={{
                  borderRadius: '12px'
                }} src="https://open.spotify.com/embed/track/4YACgyR9xdAcyJMBV8H6oX?utm_source=generator&theme=0" width="100%" height="80" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                </div>

                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Born
                      </th>
                      <td className="py-2 px-2">
                        Sidney Joseph Caulfield
                        <br />
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
                        
                        Podcast Producer
                        <br />
                        Surf Instructor
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Location
                      </th>
                      <td className="py-2 px-2">Melbourne, Victoria, Australia</td>
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
                        Notable work
                      </th>
                      <td className="py-2 px-2">
                        <em>
                          "Running the Most Profitable Bunnings Sausage Sizzle of
                          All Time"
                        </em>
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Awards
                      </th>
                      <td className="py-2 px-2">2 Grammy Awards</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">
                        Website
                      </th>
                      <td className="py-2 px-2">
                        <a href="#" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">
                          [placeholder.com]
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
                        <a href="#" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                        <br />
                        <a href="#" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Categories */}
              <div className="mt-4 text-sm">
                <div className="border-t border-[#a2a9b1] pt-2">
                  <strong>Categories:</strong>
                  <div className="mt-1">
                    <a href="#" className="text-[#0645ad] hover:underline">
                      Australian journalists
                    </a>{" "}
                    |{" "}
                    <a href="#" className="text-[#0645ad] hover:underline">
                      Podcast producers
                    </a>{" "}
                    |{" "}
                    <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">
                      RMIT University alumni
                    </a>{" "}
                    |{" "}
                    <a href="#" className="text-[#0645ad] hover:underline">
                      Surf instructors
                    </a>
                  </div>
                </div>
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