import { ArrowRight, Infinity, Percent, Users } from "lucide-react";

export default function Yearly() {
  return (
    <div className="pt-16 pb-24 max-w-4xl mx-auto px-4">
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 pt-8">Års abonnement</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Få et godt tilbud på fri covers for et helt år, bestil alle de covers du skal bruge til din udgivelse uden betaling for hver gang
        </p>
      </div>

      <div className="bg-[#111111] border border-purple-500/30 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row gap-10 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden group mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Bliv en del af vores community</h2>
          <p className="text-zinc-400 leading-relaxed max-w-md mb-8">
            Vores populæreste løsning til dig, der ønsker ubegrænset coverarts i et helt år, uanset om du skal bruge 2 eller 19 covers, så er det alt sammen inkluderet.
          </p>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-extrabold text-white">999</span>
            <span className="text-zinc-500 font-medium tracking-wide">kr. / år</span>
          </div>
          
          <div className="mt-auto md:mt-0">
            <a 
              href="https://www.instagram.com/coverbywind/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]"
            >
              <span>Tilmeld abonnement</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 bg-[#1a1a1a]/80 backdrop-blur-sm border md:min-w-[340px] border-zinc-800/80 rounded-[1.5rem] p-6 shadow-inner relative z-10">
          <h4 className="text-lg font-bold text-white mb-4">Dette får du:</h4>
          <div className="h-px w-full bg-zinc-800/80 mb-6" />
          
          <ul className="flex flex-col gap-6">
            <li className="flex items-start gap-4">
              <div className="mt-1">
                <Infinity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h5 className="text-zinc-200 font-bold mb-1">Ubegrænset coverarts</h5>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Bestil dit cover via vores hjemmeside, uden enkeltbetaling hver gang
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1">
                <Percent className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h5 className="text-zinc-200 font-bold mb-1">En god pris</h5>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Dette tilbud gør det ofte mere økonomisk tiltrækkende for de artister som har planer om at udgive mere end 2 sange i løbet af et år.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h5 className="text-zinc-200 font-bold mb-1">En del af communityet</h5>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Bliv en del af vores gruppechat på instagram, hvor vi alle skriver og sparer sammen.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
