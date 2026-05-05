import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export default function OrderPopup({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#111111] pointer-events-auto border border-zinc-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Bestil Cover / Abonnement</h2>
              <p className="text-zinc-400 mb-8 text-center text-sm leading-relaxed">
                For at bestille skal du kontakte os direkte over Instagram. Vi sidder klar til at hjælpe dig med din næste udgivelse!
              </p>
              
              <a
                href="https://www.instagram.com/coverbywind/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r gap-2 from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] flex items-center justify-center"
              >
                Åbn Instagram
              </a>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
