import { 
  Maximize, 
  FileImage, 
  RefreshCcw, 
  Clock, 
  Zap, 
  Star, 
  ArrowRight, 
  Infinity, 
  Percent, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  HelpCircle, 
  Send 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import OrderPopup from "../components/OrderPopup";
import LoginPopup from "../components/LoginPopup";
import SubscriptionInfoPopup from "../components/SubscriptionInfoPopup";
import { auth } from "../firebase.ts";
import { onAuthStateChanged } from "firebase/auth";

export default function Prices() {
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [isSubscriptionInfoOpen, setIsSubscriptionInfoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleOrderClick = () => {
    if (!user || user.isAnonymous) {
      setIsLoginOpen(true);
    } else {
      setIsOrderPopupOpen(true);
    }
  };

  const handleSubscriptionClick = () => {
    setIsSubscriptionInfoOpen(true);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Hvor hurtigt bliver mit cover leveret?",
      answer: "Standard levering tager normalt op til 5 hverdage. Hvis du vælger Premium, rykker du foran i køen og får dit cover indenfor 2 hverdage."
    },
    {
      question: "Hvad hvis jeg ikke er tilfreds med resultatet?",
      answer: "Vi inkluderer altid rettelser (retakes) i prisen. Standard har 2 retakes, mens Premium giver dig op til 5. Vi arbejder tæt sammen med dig via din personlige kundeside for at sikre, at du elsker slutresultatet."
    },
    {
      question: "Hvordan fungerer årsabonnementet?",
      answer: "Abonnementet giver dig ubegrænset adgang til coverarts i et helt år. Du logger bare ind og bestiller via formularen, hvorefter vi går i gang. Derudover bliver du en del af vores eksklusive Instagram community-gruppe."
    },
    {
      question: "Hvilke formater modtager jeg mit cover i?",
      answer: "Du modtager altid dit cover i 3000x3000px (standard for streamingtjenester) i både JPG og PNG format for maksimal kvalitet."
    }
  ];

  return (
    <div className="flex flex-col items-center pt-16 pb-32 px-4 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -z-10" />
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 italic uppercase tracking-tighter">
          Priser & <span className="text-purple-500">Pakker</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Gør din musik visuelt komplet med professionelt designet coverart. 
          Vælg den løsning, der passer bedst til dit behov.
        </p>
      </motion.div>

      {/* Main Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-32">
        {/* Standard Pack */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#111111] border border-zinc-800/80 rounded-[2.5rem] p-8 md:p-10 flex flex-col hover:border-zinc-700 transition-all shadow-2xl relative group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-zinc-700 transition-colors">
              <FileImage className="w-8 h-8 text-zinc-400" />
            </div>
            <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-widest">Single</span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 italic uppercase">Standard Cover</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Til den seriøse artist der har brug for et professionelt look til en skarp pris.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tighter">300</span>
              <span className="text-zinc-500 font-bold text-xl uppercase italic">kr.</span>
            </div>
          </div>

          <div className="space-y-5 mb-10 flex-1">
            <PricingFeature icon={<Maximize className="w-4 h-4" />} text="3000 x 3000 px (Ready for Pitch)" />
            <PricingFeature icon={<CheckCircle2 className="w-4 h-4" />} text="JPG & PNG Høj opløsning" />
            <PricingFeature icon={<RefreshCcw className="w-4 h-4" />} text="2 Rettelser inkluderet" />
            <PricingFeature icon={<Clock className="w-4 h-4" />} text="5 Hverdages levering" />
          </div>

          <button 
            onClick={handleOrderClick}
            className="w-full py-5 bg-white text-black font-black uppercase italic tracking-wider rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl"
          >
            Bestil Standard
          </button>
        </motion.div>
        
        {/* Premium Pack */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#111111] border-2 border-purple-500/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)] relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase py-2 px-6 rounded-bl-2xl italic tracking-widest z-10">
            Priority
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-500 fill-purple-500" />
            </div>
            <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest">Populær</span>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 italic uppercase">Premium Cover</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Når det skal gå hurtigt og du vil have fuld fleksibilitet og fokus.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tighter">450</span>
              <span className="text-purple-500 font-bold text-xl uppercase italic">kr.</span>
            </div>
          </div>

          <div className="space-y-5 mb-10 flex-1">
            <PricingFeature icon={<Zap className="w-4 h-4 text-purple-400" />} text="Alt fra Standard pakken" />
            <PricingFeature icon={<ShieldCheck className="w-4 h-4 text-purple-400" />} text="Forrest i køen (Priority)" />
            <PricingFeature icon={<RefreshCcw className="w-4 h-4 text-purple-400" />} text="5 Rettelser inkluderet" />
            <PricingFeature icon={<Clock className="w-4 h-4 text-purple-400" />} text="2 Hverdages levering" />
          </div>

          <button 
            onClick={handleOrderClick}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black uppercase italic tracking-wider rounded-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98] shadow-xl"
          >
            Bestil Premium
          </button>
        </motion.div>
      </div>

      {/* Subscription Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-5xl mb-32"
      >
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent -z-10" />
          
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-bold uppercase tracking-wide mb-8">
                <Users className="w-4 h-4" />
                <span>UBEGRÆNSET COVERS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 italic uppercase tracking-tight">
                Årsabonnement & <br /><span className="text-purple-500">Community</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg">
                Vores populæreste løsning til dig, der ønsker ubegrænset coverarts i et helt år. 
                Uanset om du udgiver 5 eller 20 sange, er alt inkluderet i én fast pris.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1 italic">Pris pr. år</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">999</span>
                    <span className="text-zinc-400 font-bold text-xl uppercase italic">kr.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubscriptionClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase italic tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] group"
              >
                <span>Tilmeld Abonnement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BenefitCard 
                  icon={<Infinity className="w-6 h-6 text-purple-400" />}
                  title="Ubegrænset"
                  desc="Ingen grænse for antal covers du kan bestille pr. år."
                />
                <BenefitCard 
                  icon={<Percent className="w-6 h-6 text-purple-400" />}
                  title="Besparelse"
                  desc="Tjen pengene hjem allerede efter 3-4 udgivelser."
                />
                <BenefitCard 
                  icon={<Users className="w-6 h-6 text-purple-400" />}
                  title="Community"
                  desc="Direkte adgang til gruppechatten på Instagram."
                />
                <BenefitCard 
                  icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
                  title="Bonus"
                  desc="Få sparring og feedback på din musik af andre artister."
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl mb-32">
        <div className="text-center mb-16">
          <HelpCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">
            Ofte stillede <span className="text-zinc-600">spørgsmål</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden transition-all"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-6 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">{faq.question}</span>
                <ArrowRight className={`w-5 h-5 text-zinc-600 transition-transform ${activeFaq === index ? "rotate-90 text-purple-500" : ""}`} />
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10 italic uppercase">Klar til at starte din næste udgivelse?</h2>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
          Opret din profil i dag og få adgang til din egen kundeside, hvor du kan bestille, chatte og modtage dine covers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
          <button 
            onClick={handleOrderClick}
            className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black uppercase italic tracking-wider rounded-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Bestil dit cover her
          </button>
          <a 
            href="/dashboard"
            className="w-full sm:w-auto px-10 py-5 bg-black/20 backdrop-blur-md border border-white/20 text-white font-black uppercase italic tracking-wider rounded-2xl hover:bg-black/30 transition-all flex items-center justify-center gap-3"
          >
            <span>Min Kundeside</span>
            <Send className="w-5 h-5" />
          </a>
        </div>
      </motion.div>

      <OrderPopup isOpen={isOrderPopupOpen} onClose={() => setIsOrderPopupOpen(false)} />
      <SubscriptionInfoPopup isOpen={isSubscriptionInfoOpen} onClose={() => setIsSubscriptionInfoOpen(false)} />
      {isLoginOpen && <LoginPopup onClose={() => setIsLoginOpen(false)} />}
    </div>
  );
}

function PricingFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 group/item">
      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/item:border-zinc-600 transition-colors">
        {icon}
      </div>
      <span className="text-zinc-300 text-sm font-medium tracking-wide">{text}</span>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-[1.5rem] hover:border-purple-500/30 transition-colors">
      <div className="mb-4">{icon}</div>
      <h4 className="text-white font-bold italic uppercase mb-2 text-sm tracking-wider">{title}</h4>
      <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

