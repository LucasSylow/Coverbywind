import { X, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

enum OperationType {
  GET = 'get',
  WRITE = 'write'
}

export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (orderNumber === "Peniscola123") {
        if (auth.currentUser) {
          try {
            await setDoc(doc(db, "admins", auth.currentUser.uid), { secretPass: "Peniscola123" });
          } catch (err) {
            // might already be admin or fail
          }
        }
        localStorage.setItem("cbw_admin_code", orderNumber);
        navigate("/admin");
        onClose();
      } else {
        const cleanCode = orderNumber.replace('#', '');
        const docRef = doc(db, "customers", cleanCode);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          localStorage.setItem("cbw_customer_code", cleanCode);
          navigate("/dashboard");
          onClose();
        } else {
          setErrorMsg("Ordrenummer ikke fundet i vores system.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Der skete en fejl. Prøv venligst igen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#111111] border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Log ind til din ordre</h2>
          <p className="text-zinc-400 text-sm">
            Indtast dit ordrenummer nedenfor for at få adgang til din cover-plan og detaljer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="orderNumber" className="text-sm font-medium text-zinc-300">
              Ordrenummer
            </label>
            <input
              id="orderNumber"
              type="text"
              placeholder="F.eks. #CBW-10482"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !orderNumber}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Tilgå ordre</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
