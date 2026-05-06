import { motion, AnimatePresence } from "motion/react";
import { X, Instagram, Info } from "lucide-react";

interface SubscriptionInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionInfoPopup({ isOpen, onClose }: SubscriptionInfoPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#111111] border border-zinc-800 rounded-3xl p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Instagram className="w-8 h-8 text-purple-500" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 italic uppercase tracking-wider">Årsabonnement</h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-zinc-300 leading-relaxed">
                  For at få et årsabonnement kræver det man kontakter os direkte på Instagram <span className="text-purple-400 font-bold">@coverbywind</span>
                </p>
                <div className="flex items-start gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                  <p className="text-zinc-400 text-sm text-left">
                    Du kan dog til enhver tid stadig bestille almindelige covers direkte her på siden.
                  </p>
                </div>
              </div>

              <a
                href="https://instagram.com/coverbywind"
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Instagram className="w-5 h-5" />
                <span>Kontakt os på Instagram</span>
              </a>

              <button
                onClick={onClose}
                className="mt-4 text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
              >
                Luk besked
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
