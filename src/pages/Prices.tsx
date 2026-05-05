import { Maximize, FileImage, RefreshCcw, Clock, Zap, Star, ArrowRight, Infinity, Percent, Users } from "lucide-react";

export default function Prices() {
  return (
    <div className="flex flex-col items-center pt-8 pb-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vores Pakker</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Få visuel identitet til din næste udgivelse
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {/* Standard Coverart */}
        <div className="bg-[#111111] border border-zinc-800/80 rounded-[2rem] p-6 md:p-8 flex flex-col hover:border-zinc-700 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <img 
            src="https://i.postimg.cc/tgQ5WmQB/c35.png" 
            alt="Standard Coverart" 
            className="w-16 h-16 mb-5 rounded-2xl shadow-lg border border-zinc-800/50"
          />
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Standard Coverart</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Perfekt til dig som skal bruge et coverart til din næste udgivelse.
            </p>
            
            <div className="flex flex-col gap-1 items-start">
              <span className="text-zinc-500 line-through text-sm font-medium">500 kr.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">300</span>
                <span className="text-zinc-400 font-medium tracking-wide">kr.</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-zinc-800 via-zinc-700/50 to-zinc-800 mb-6" />

          <ul className="flex flex-col gap-4 flex-1 mb-8">
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-zinc-300">
                <Maximize className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">3000 x 3000 størrelse, klar til at blive pitchet</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-zinc-300">
                <FileImage className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">Høj opløsning i både JPG format og PNG format</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-zinc-300">
                <RefreshCcw className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">Op til 2 retakes, hvis man ikke er tilfreds</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-zinc-300">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">Levering indenfor 5 hverdage</span>
            </li>
          </ul>

          <a 
            href="https://www.instagram.com/coverbywind/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] mt-auto text-center block"
          >
            Bestil Nu
          </a>
        </div>
        
        {/* Premium Coverart */}
        <div className="bg-[#111111] border-2 border-purple-500/50 rounded-[2rem] p-6 md:p-8 flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.15)] relative group mt-4 md:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none rounded-[2rem]" />
          
          <div className="absolute top-0 right-6 bg-gradient-to-b from-purple-500 to-purple-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest py-1.5 px-3 rounded-b-xl shadow-lg flex items-center gap-1.5 z-20">
            <Star className="w-3 h-3 fill-current" /> Mest Populær
          </div>

          <img 
            src="https://i.postimg.cc/tgQ5WmQB/c35.png" 
            alt="Premium Coverart" 
            className="w-16 h-16 mb-5 rounded-2xl shadow-lg border border-purple-500/30 ring-4 ring-purple-500/10 relative z-10"
          />

          
          <div className="mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Premium Coverart</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Perfekt til dig som skal bruge et coverart til din næste udgivelse.
            </p>
            
            <div className="flex flex-col gap-1 items-start">
              <span className="text-zinc-500 line-through text-sm font-medium">700 kr.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">450</span>
                <span className="text-purple-400 font-medium tracking-wide">kr.</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-zinc-800 via-purple-500/30 to-zinc-800 mb-6" />

          <ul className="flex flex-col gap-4 flex-1 mb-8 relative z-10">
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400">
                <Maximize className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">3000 x 3000 størrelse, klar til at blive pitchet</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400">
                <FileImage className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed">Høj opløsning i både JPG format og PNG format</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400">
                <RefreshCcw className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed font-medium">Op til 5 retakes, hvis man ikke er tilfreds</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-0.5 bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400">
                <Zap className="w-3.5 h-3.5 fill-purple-400" />
              </div>
              <span className="text-zinc-300 text-sm leading-relaxed font-medium">Levering indenfor 2 hverdage</span>
            </li>
          </ul>

          <a 
            href="https://www.instagram.com/coverbywind/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] mt-auto text-center block relative z-10"
          >
            Bestil Nu
          </a>
        </div>
      </div>

      {/* Års aftale / Community */}
      <div className="w-full max-w-4xl px-4 mt-20">
        <div className="bg-[#111111] border border-purple-500/30 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row gap-10 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden group">
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
    </div>
  );
}
