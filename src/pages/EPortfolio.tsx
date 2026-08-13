import { Link } from "react-router-dom";
import { ScrollTypeHeading } from "@/components/ScrollTypeHeading";

const EPortfolio = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Wikipedia Header */}
      <header className="bg-white border-b border-[#a7d7f9]" />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="bg-white border border-[#a7d7f9] p-6">
          {/* Title */}
          <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4">
            E-Portfolio: Sid Caulfield
          </h1>

          {/* Table of Contents */}
          <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-6 inline-block relative">
            <div className="font-bold mb-2 relative z-10">Contents</div>
            <ol className="list-decimal ml-6 text-sm text-[#0645ad] relative z-10">
              <li><a href="#introduction" className="hover:underline">Introduction</a></li>
              <li><a href="#case-studies" className="hover:underline">Case Studies</a>
                <ol className="list-decimal ml-4 text-[#0645ad]">
                  <li><a href="#hyde-and-seek" className="hover:underline">Hyde &amp; Seek — PR &amp; Communications</a></li>
                  <li><a href="#flow-mountain-bike" className="hover:underline">Flow Mountain Bike</a></li>
                  <li><a href="#mons-monday-podcast" className="hover:underline">The Mons Monday Podcast</a></li>
                </ol>
              </li>
              <li><a href="#education" className="hover:underline">Education</a></li>
              <li><a href="#skills" className="hover:underline">Skills and Areas of Expertise</a></li>
            </ol>
          </div>

          {/* Introduction */}
          <ScrollTypeHeading id="introduction" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            Introduction
          </ScrollTypeHeading>
          <p className="mb-4 leading-relaxed relative z-10">
            This page presents a closer look at Caulfield's professional work across public relations,
            digital publishing and audio production. Each case study below outlines the scope of the role,
            the work produced, and the skills developed. Work samples are marked as{" "}
            <span className="italic">placeholder — sample to be added</span> where not yet published.
          </p>

          {/* Case Studies */}
          <ScrollTypeHeading id="case-studies" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            Case Studies
          </ScrollTypeHeading>

          {/* Hyde & Seek */}
          <h3 id="hyde-and-seek" className="text-xl font-serif mt-4 mb-2">
            Hyde &amp; Seek — PR &amp; Communications Intern
          </h3>
          <p className="mb-2 leading-relaxed relative z-10">
            Since July 2026, Caulfield has supported strategic communications and media relations for
            clients across the fintech, tech and consumer sectors at Hyde &amp; Seek, a boutique PR agency,
            working directly with the Founding Director. His responsibilities include writing and pitching
            press releases and media alerts, building and maintaining media mapping and journalist tracking
            systems, and monitoring live news cycles to identify timely press opportunities for clients.
          </p>
          <p className="mb-2 leading-relaxed relative z-10">
            This placement has deepened his understanding of client servicing, research rigour and pitch
            development within an agency structure, and strengthened his grounding in brand-led thinking
            and integrated campaign execution.
          </p>
          <div className="border border-dashed border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-4 text-sm text-[#54595d] italic relative z-10">
            Placeholder — sample press release or media pitch to be added.
          </div>

          {/* Flow Mountain Bike */}
          <h3 id="flow-mountain-bike" className="text-xl font-serif mt-4 mb-2">
            Flow Mountain Bike — Content Syndication and Social Media Manager
          </h3>
          <p className="mb-2 leading-relaxed relative z-10">
            Since 2025, Caulfield has managed Flow Mountain Bike's social presence and content
            syndication, reaching a cumulative audience of 375,000. He redesigned the publication's
            syndication system and introduced Canva and Sprout Social, creating a collaborative workflow
            for the team, and plans, builds and sends Flow's weekly eDM to 30,000 subscribers, achieving a
            25–30% open rate.
          </p>
          <p className="mb-2 leading-relaxed relative z-10">
            This role has sharpened his instincts for audience interest, timing and engagement drivers,
            and given him practical experience lifting output, tightening processes and improving brand
            storytelling consistency across a large syndication network.
          </p>
          <div className="border border-dashed border-[#a2a9b1] bg-[#f8f9fa] p-4 mb-4 text-sm text-[#54595d] italic relative z-10">
            Placeholder — sample eDM or campaign screenshot to be added.
          </div>

          {/* Mons Monday Podcast */}
          <h3 id="mons-monday-podcast" className="text-xl font-serif mt-4 mb-2">
            The Mons Monday Podcast — Producer
          </h3>
          <p className="mb-2 leading-relaxed relative z-10">
            Caulfield pitched a profile-led podcast to Mons Monday and secured the collaboration through
            cold outreach in 2025, developing the podcast's strategy and systems for planning, recording,
            editing, feedback and distribution. The podcast debuted at number three on the Apple Australia
            Arts chart, and went on to secure two commercial partnerships, with LBDO and Krush Organics.
          </p>
          <p className="mb-4 leading-relaxed relative z-10">
            Producing the podcast end-to-end — from conceptualising and editing promotional video material
            to managing partner and audience communications — gave Caulfield a grounding in production
            workflow management and post-launch performance analysis.
          </p>
          <div className="relative mb-4">
            <iframe
              style={{ borderRadius: "12px", position: "relative", zIndex: 1 }}
              src="https://open.spotify.com/embed/show/3JoJaIgpNMKfDrsUTAx5e9?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="The Mons Monday Podcast"
            />
          </div>

          {/* Education */}
          <ScrollTypeHeading id="education" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
            Education
          </ScrollTypeHeading>
          <p className="mb-2 leading-relaxed relative z-10">
            Caulfield is completing a Bachelor of Communication (Journalism), with a minor in Politics and
            Communication, at RMIT University, Melbourne, graduating in 2026. His studies have built a
            grounding in research, ethics, and multi-platform storytelling that directly informs his
            professional writing and editorial work.
          </p>
          <p className="mb-4 leading-relaxed relative z-10">
            He previously completed one year of a Bachelor of Arts (Psychology and Linguistics) at the
            University of Melbourne, and studied Media, Studio Art, Linguistics and Indonesian for VCE at
            Belmont High School, Geelong, graduating with an ATAR of 90.25.
          </p>

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

          <div className="mt-8 text-center">
            <Link to="/" className="text-[#0645ad] hover:underline text-sm">
              ← Back to profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EPortfolio;
