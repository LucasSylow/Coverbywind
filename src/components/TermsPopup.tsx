import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldAlert } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TermsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  customerCode: string;
}

export default function TermsPopup({ isOpen, onClose, customerCode }: TermsPopupProps) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "customers", customerCode), {
        hasAcceptedTerms: true
      });
      onClose();
    } catch (e) {
      console.error(e);
      // Fallback
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#111111] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3 bg-[#161616]">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Betingelser</h2>
                <p className="text-zinc-400 text-sm">Ved oprettelse af en bruger accepterer du følgende vilkår:</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-zinc-300 text-sm space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2 text-base">Levering</h3>
                <p className="leading-relaxed">
                  Leveringstiden på covers er op til 5 hverdage. Hverdage defineres som mandag til fredag og er undtaget helligdage. I sommerperioden kan der forekomme forlænget leveringstid på op til yderligere 3 hverdage.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2 text-base">Brugerkonto</h3>
                <p className="leading-relaxed">
                  Din konto er personlig og må ikke deles med andre. Overtrædelse heraf medfører øjeblikkelig suspension af kontoen samt permanent ophævelse af aftalen uden mulighed for genoprettelse eller kompensation.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2 text-base">Abonnement og refusion</h3>
                <p className="leading-relaxed">
                  Ved køb af abonnement accepterer du, at der ikke ydes refundering af allerede gennemførte betalinger.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2 text-base">Kommunikation og bestilling</h3>
                <p className="leading-relaxed">
                  Al kommunikation og bestilling af covers skal fremadrettet primært foregå via denne platform. Vores Instagram er fortsat tilgængelig for supporthenvendelser, men svartiden vil som udgangspunkt være hurtigere via platformen.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-[#161616] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setAccepted(!accepted)}
              >
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shadow-sm ${accepted ? 'bg-blue-600 border-blue-500' : 'bg-[#222] border-zinc-700 group-hover:border-zinc-500'}`}>
                  {accepted && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-medium text-zinc-300 select-none group-hover:text-white transition-colors">
                  Jeg har læst og accepterer betingelserne
                </span>
              </div>

              <button
                onClick={handleAccept}
                disabled={!accepted || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all w-full sm:w-auto justify-center ${
                  accepted 
                    ? 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? "Gemmer..." : "Fortsæt"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
