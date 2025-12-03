import profilePic from "@/assets/profile_pic.jpg";
const Index = () => {
  return <div className="min-h-screen bg-[#f6f6f6]">
      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]">
        <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-2xl font-serif">Wikipedia</div>
          <div className="text-sm text-[#54595d]">The Free Encyclopedia</div>
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
              {/* Lead Paragraph */}
              <p className="mb-4 leading-relaxed">
                <strong>Sid Caulfield</strong> is a freelance journalist and podcast producer known for his work exploring subcultures and contemporary Australian life.
              </p>

              {/* Biography Section */}
              <h2 className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Biography and Career
              </h2>
              <p className="mb-4 leading-relaxed">
                Sid Caulfield excels in all things subculture. Want a deep dive into buying beers for your mates wholesale or how to ride your bike to the club and still be able to kiss someone? He's your man.
              </p>
              <p className="mb-4 leading-relaxed">
                Caulfield has been active in journalism since 2025, working as a freelance journalist and podcast producer. His work focuses on podcast production, social media listening, copywriting, and feature writing.
              </p>

              {/* Notable Works Section */}
              <h2 className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Notable Works
              </h2>
              <p className="mb-4 leading-relaxed">
                Caulfield is best known for his <a href="https://en.wikipedia.org/wiki/Special_Broadcasting_Service" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">SBS</a> documentary <em>"Running the Most Profitable Bunnings Sausage Sizzle of All Time"</em>, which received critical acclaim and won two Grammy Awards.
              </p>

              {/* Awards Section */}
              <h2 className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Awards and Recognition
              </h2>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li>Two Grammy Awards for "Sausage Sizzle" documentary</li>
              </ul>

              {/* Publications Section */}
              <h2 className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                Publications
              </h2>
              <p className="mb-4 leading-relaxed">
                Caulfield has contributed to numerous prominent publications including:
              </p>
              <ul className="list-disc ml-6 mb-4 leading-relaxed">
                <li><a href="https://en.wikipedia.org/wiki/Vice_Media" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">VICE</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Special_Broadcasting_Service" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">SBS</a> (Special Broadcasting Service)</li>
                <li>ABC Australia</li>
                <li>i-D</li>
              </ul>

              {/* References Section */}
              <h2 className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
                References
              </h2>
              <div className="text-sm leading-relaxed">
                <p className="mb-2">1. ^ "Sid Caulfield - Freelance Journalist". Retrieved 2025.</p>
              </div>
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
                  <img src={profilePic} alt="Sid Caulfield" className="w-full aspect-square object-cover" />
                  <div className="text-xs text-[#54595d] mt-1 mb-3">Caulfield in 2025</div>
                </div>
                
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Born</th>
                      <td className="py-2 px-2">Sidney Joseph Caulfield July 27, 2003 (age 22) East Melbourne, Victoria, AUS</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Occupation</th>
                      <td className="py-2 px-2">Freelance Journalist
Podcast Producer<br />
                        Podcast Producer
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Years active</th>
                      <td className="py-2 px-2">2025—present</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Education</th>
                      <td className="py-2 px-2"><a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University</a></td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Notable work</th>
                      <td className="py-2 px-2">
                        <em>"Running the Most Profitable Bunnings Sausage Sizzle of All Time"</em>
                      </td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Awards</th>
                      <td className="py-2 px-2">2 Grammy Awards</td>
                    </tr>
                    <tr className="border-t border-[#a2a9b1]">
                      <th className="text-left py-2 pr-2 align-top bg-[#eaecf0] px-2">Specialty</th>
                      <td className="py-2 px-2">
                        Podcast Production<br />
                        Social Media Listening<br />
                        Copywriting<br />
                        Writing
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
                    <a href="#" className="text-[#0645ad] hover:underline">Australian journalists</a> |{" "}
                    <a href="#" className="text-[#0645ad] hover:underline">Podcast producers</a> |{" "}
                    <a href="https://en.wikipedia.org/wiki/Royal_Melbourne_Institute_of_Technology" className="text-[#0645ad] hover:underline" target="_blank" rel="noopener noreferrer">RMIT University alumni</a>
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
          <p>This page was last edited on {new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
          <p className="mt-2">Content is available under CC BY-SA 4.0 unless otherwise noted.</p>
        </div>
      </footer>
    </div>;
};
export default Index;