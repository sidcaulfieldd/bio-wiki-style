import profilePic from "@/assets/profile_pic.gif";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-[#FF69B4] flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 text-center tracking-tight">
        LET'S GET VISUAL
      </h1>
      <img
        src={profilePic}
        alt="Sid Caulfield"
        className="max-w-full max-h-[70vh] object-contain"
      />
    </div>
  );
};

export default About;
