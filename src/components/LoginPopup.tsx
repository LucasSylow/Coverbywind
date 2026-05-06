import { X, ArrowRight, ShieldCheck, Crown, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

enum OperationType {
  GET = 'get',
  WRITE = 'write'
}

export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subCode, setSubCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (code: string) => {
    if (!code) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, "admins", auth.currentUser.uid), { secretPass: code });
          localStorage.setItem("cbw_admin_code", "true");
          navigate("/admin");
          onClose();
          return;
        } catch (err) {
          // Fall through to customer check
        }
      }

      const cleanCode = code.replace('#', '');
      const docRef = doc(db, "customers", cleanCode);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem("cbw_customer_code", cleanCode);
        localStorage.setItem("cbw_customer_type", data.type || "annual");
        navigate("/dashboard");
        onClose();
      } else {
        setErrorMsg("Koden blev ikke fundet i vores system.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Der skete en fejl. Prøv venligst igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (view === "login") {
        if (!email || !password) return;
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        
        const docRef = doc(db, "customers", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          localStorage.setItem("cbw_customer_code", uid);
          localStorage.setItem("cbw_customer_type", data.type || "regular");
        } else {
          // HEAL: If user exists in Auth but not in Firestore, create the doc
          await setDoc(doc(db, "customers", uid), {
            name: email.split('@')[0], // Fallback name
            email: email,
            createdAt: Date.now(),
            isRegular: true,
            type: "regular",
            orderNumber: uid,
            hasAcceptedTerms: false
          });
          localStorage.setItem("cbw_customer_code", uid);
          localStorage.setItem("cbw_customer_type", "regular");
        }
      } else {
        if (!email || !password || !name) return;
        const { createUserWithEmailAndPassword } = await import("firebase/auth");
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        try {
          await setDoc(doc(db, "customers", uid), {
            name,
            email,
            createdAt: Date.now(),
            isRegular: true,
            type: "regular",
            orderNumber: uid,
            hasAcceptedTerms: false
          });
        } catch (dbErr) {
          console.error("Database detail error:", dbErr);
          // If Firestore fails (e.g. permission), the Auth user still exists.
          // We still set values so they can at least get to dashboard where fallback might try again.
        }

        localStorage.setItem("cbw_customer_code", uid);
        localStorage.setItem("cbw_customer_type", "regular");
      }
      
      navigate("/dashboard");
      onClose();
    } catch (err: any) {
      console.error("Auth detail error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg("Denne e-mail er allerede i brug. Har du prøvet at logge ind i stedet?");
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg("Adgangskoden skal være på mindst 6 tegn.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg("Email/Password login er ikke aktiveret i Firebase Console.");
      } else {
        setErrorMsg("Ugyldig e-mail eller adgangskode.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(subCode);
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
        className="relative w-full max-w-5xl bg-[#111111] border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 relative z-0">
          
          {/* Main Box - Log ind / Opret konto */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {view === "login" ? "Log ind på din konto" : "Opret din konto"}
              </h2>
              <p className="text-zinc-400 text-sm">
                {view === "login" 
                  ? "Indtast din e-mail og adgangskode for at få adgang til din konto." 
                  : "Udfyld nedenstående for at oprette din kundekonto og bestille cover."}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              {view === "register" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                    Fulde navn
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Dit navn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="din@email.dk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Adgangskode
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password || (view === "register" && !name)}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{view === "login" ? "Log ind" : "Opret konto"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setView(view === "login" ? "register" : "login")}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors text-center mt-2"
              >
                {view === "login" 
                  ? "Har du ikke en konto? Opret her" 
                  : "Har du allerede en konto? Log ind her"}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-zinc-800"></div>
          <div className="md:hidden h-px bg-zinc-800 w-full my-4"></div>

          {/* Side Box - Års abonnement */}
          <div className="flex-[0.8] flex flex-col justify-center relative rounded-2xl p-6 overflow-hidden group">
            {/* Premium background with animated glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[#0a0a0a] m-[1px] rounded-[15px] z-0" />
            
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/50 via-purple-500/10 to-amber-500/20 opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-[#0a0a0a] m-[1px] rounded-[15px] z-0" />

            {/* Glowing orb in the background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2 flex items-center gap-2">
                  Års abonnement
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-amber-200/60 text-sm">
                  Har du årsabonnement, indtast din unikke kode her, for at tilgå din profil.
                </p>
              </div>

              <form onSubmit={handleSubSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="subCode" className="text-sm font-medium text-amber-500/80">
                    Adgangskode
                  </label>
                  <div className="relative">
                    <input
                      id="subCode"
                      type="password"
                      placeholder="Abonnement kode"
                      value={subCode}
                      onChange={(e) => setSubCode(e.target.value)}
                      className="w-full bg-[#111111]/80 border border-amber-500/20 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !subCode}
                  className="relative overflow-hidden mt-2 w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Tilgå profil</span>
                      <ArrowRight className="w-4 h-4 relative z-10" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

