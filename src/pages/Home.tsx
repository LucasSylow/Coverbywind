import { motion } from "motion/react";
import { ArrowRight, Shield, Zap, RefreshCw, Star } from "lucide-react";
import { Link } from "react-router-dom";

const reviews = [
  {
    id: 1,
    title: "God oplevelse",
    text: '"God oplevelse med CoverByWind. Jeg er meget tilfreds med resultatet, og leveringen var hurtig. Derudover er de utroligt fleksible og imødekommende i hele processen."',
    author: "1S",
    avatar: "https://i.scdn.co/image/ab67616d00001e02a44c3a31023744d740db78a8"
  },
  {
    id: 2,
    title: "Vildt fedt samarbejde",
    text: '"Det er vildt fedt at samarbejde med “Cower By Wind” altid covers i kvalitet og man kan altid få det justerede hvis man ville have noget ændret/tilføjet. Vildt billigt, kæmpe anbefaling herfra!"',
    author: "ISSO",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTkTblu7Q8GyZ1pykbkqJynwqqbAB4kHwzgg&s"
  },
  {
    id: 3,
    title: "Kan varmt anbefales",
    text: '"Kan varmt anbefale CoverByWind. Jeg er meget tilfreds med både resultatet og den hurtige levering. Derudover har samarbejdet været nemt, da de er fleksible og gode til at tilpasse sig mine behov."',
    author: "DIAR",
    avatar: "https://i.postimg.cc/QNydf24F/Skaermbillede-2026-05-05-162933.png"
  },
  {
    id: 4,
    title: "Lynhurtig levering",
    text: '"Vi skulle bruge et cover akut, og wind fikset det lynhurtigt, skrev i deres dm på instagram, og det var klar efter en time, det er top!"',
    author: "ZULOO",
    avatar: "https://sbp.dk/wp-content/images/artists/63/zuloo-web.jpg"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-12 pb-12 w-full relative">
      <div 
        className="absolute top-[-10rem] left-[50%] -translate-x-1/2 w-[100vw] h-[100vh] pointer-events-none bg-cover bg-top bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://i.postimg.cc/sX6cbjqs/bg.png')",
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)"
        }}
      />
      
      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center flex flex-col items-center mb-32 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Nyt: Premium Telefon Covers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
        >
          Ekspert i at få dine <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            idéer visualiseret.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-zinc-400 max-w-2xl mb-10"
        >
          Vi har lavet coverarts for en stor håndfuld danske artister igennem 3 år nu, og har altid stræbet os efter at gøre hver enkelt kunde 100% tilfreds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <a
            href="https://www.instagram.com/coverbywind/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-semibold transition-colors flex items-center gap-2"
          >
            Se Vores Covers
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/om-os"
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-8 py-4 rounded-full font-semibold transition-colors"
          >
            Læs Mere
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10 mb-32">
        <FeatureCard
          icon={<Shield className="w-6 h-6 text-purple-400" />}
          title="Stilrent design"
          description="Vi har de nyeste tekniker indenfor coverdesign, og følger konstant branchens udvikling med nye ider m.m."
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6 text-purple-400" />}
          title="Hurtig levering"
          description="Vi bestræber os altid på at have dit cover klar til din udgivelse indenfor fristen, forvent dit cover klar indenfor 5 hverdage."
        />
        <FeatureCard
          icon={<RefreshCw className="w-6 h-6 text-purple-400" />}
          title="Års aftale"
          description="Spar penge, og få en års aftale hvor du får fri covers i et år, så uanset om du skal bruge 2 eller 15 covers er det inkluderet"
        />
      </div>

      {/* Cases Section */}
      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          Se vores tidligere projekter
        </h2>
        <div className="w-full rounded-[2rem] overflow-hidden border border-zinc-800/80 p-2 bg-[#111111] shadow-xl">
          <img 
            src="https://i.postimg.cc/ZnyJdRhF/Skaermbillede-2026-05-05-160026.png" 
            alt="Cases" 
            className="w-full h-auto rounded-[1.5rem] object-cover border border-zinc-800/50"
          />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-full relative z-10 flex flex-col items-center mt-32 overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Tag ikke kun vores ord for det
        </h2>
        <div className="flex items-center gap-2 mb-12">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
            ))}
          </div>
          <p className="text-zinc-400 font-medium">
            <span className="text-white">4.9/5</span>
          </p>
        </div>

        <div className="w-full overflow-hidden pb-8 relative">
          {/* Fading edges */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
            {[...reviews, ...reviews, ...reviews, ...reviews].map((review, idx) => (
              <div 
                key={`${review.id}-${idx}`}
                className="w-[280px] md:w-[320px] bg-[#111111] border border-zinc-800/80 rounded-[1.5rem] p-6 flex flex-col shrink-0 shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{review.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">{review.text}</p>
                <div className="border-t border-zinc-800/80 pt-4 flex items-center gap-3 mt-auto">
                  <img src={review.avatar} alt={review.author} className="w-8 h-8 rounded-full border border-zinc-700" />
                  <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{review.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#111111] border border-zinc-800/50 p-8 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full group-hover:bg-purple-500/10 transition-colors" />
      <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mt-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
