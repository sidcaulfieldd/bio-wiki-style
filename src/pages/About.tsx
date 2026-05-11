import profilePic from "@/assets/profile_pic.gif";
import { Link } from "react-router-dom";

const sfPro = {
  fontFamily:
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const About = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#FF69B4] flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <h1
        style={sfPro}
        className="text-4xl md:text-6xl font-bold text-white mb-8 text-center tracking-tight relative z-10"
      >
        LET'S GET VISUAL
      </h1>
      <img
        src={profilePic}
        alt="Sid Caulfield"
        className="max-w-full max-h-[70vh] object-contain relative z-10"
      />

      <Link
        to="/"
        style={sfPro}
        className="fixed bottom-4 right-4 z-[9999] bg-white/90 hover:bg-white text-black text-sm font-medium px-3 py-1.5 rounded shadow-md transition-colors"
      >
        ← Back
      </Link>
    </div>
  );
};

export default About;
