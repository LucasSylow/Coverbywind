import React, { useState, useEffect } from "react";
import { User, Clock, CheckCircle2, XCircle, Plus, Send, Image as ImageIcon } from "lucide-react";
import { db, auth, handleFirestoreError } from "../firebase";
import { collection, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import TermsPopup from "../components/TermsPopup";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

type Status = "Afventer" | "Gennemført" | "Annulleret";

interface Cover {
  id: string;
  artist: string;
  track: string;
  status: Status;
  date: string;
  imageUrl?: string;
  downloadUrl?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [covers, setCovers] = useState<Cover[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{name: string, orderNumber: string, imageUrl: string, expirationDate?: string, hasAcceptedTerms?: boolean} | null>(null);

  useEffect(() => {
    const code = localStorage.getItem("cbw_customer_code");
    if (!code) {
      navigate("/");
      return;
    }
    
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "customers", code);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             const data = docSnap.data();
             setCustomerInfo({
               name: data.name || "Kunde",
               orderNumber: data.orderNumber || code,
               imageUrl: data.imageUrl || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
               expirationDate: data.expirationDate || "",
               hasAcceptedTerms: data.hasAcceptedTerms || false
             });
          } else {
             localStorage.removeItem("cbw_customer_code");
             navigate("/");
             return;
          }
          
          const unsubOrders = onSnapshot(collection(db, `customers/${code}/orders`), (snapshot) => {
            const list: Cover[] = [];
            snapshot.docs.forEach(d => {
               const data = d.data();
               list.push({
                 id: d.id,
                 artist: data.artist || "",
                 track: data.track || "",
                 status: data.status || "Afventer",
                 date: data.date || "",
                 imageUrl: data.imageUrl || "",
                 downloadUrl: data.downloadUrl || ""
               });
            });
            // basic sort: newest first assume created format allows sort
            setCovers(list.reverse());
          }, err => handleFirestoreError(err, OperationType.LIST, `customers/${code}/orders`));
          
          return () => unsubOrders();
        } catch (err) {
           console.error("Error loading dashboard", err);
        }
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  const [newOrder, setNewOrder] = useState({
    artist: "",
    track: "",
    email: "",
    ideas: "",
    link: "",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");
    setOrderSuccess(false);
    const code = localStorage.getItem("cbw_customer_code");
    if (!code) return;

    const hasPendingOrder = covers.some(cover => cover.status === "Afventer");
    if (hasPendingOrder) {
      setOrderError("Du har allerede et cover der er i gang med at blive lavet, vent venligst med at oprette en ny bestilling til det igangværende cover er blevet færdigjort");
      return;
    }

    try {
      const orderId = `CBW-${Math.floor(10000 + Math.random() * 90000)}`;
      await setDoc(doc(db, `customers/${code}/orders`, orderId), {
        artist: newOrder.artist,
        track: newOrder.track,
        email: newOrder.email,
        status: "Afventer",
        date: new Date().toLocaleDateString("da-DK"),
        createdAt: Date.now(),
        ideas: newOrder.ideas,
        link: newOrder.link
      });
      
      setNewOrder({ artist: "", track: "", email: "", ideas: "", link: "" });
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `customers/${code}/orders`);
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "Gennemført":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Afventer":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Annulleret":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusClass = (status: Status) => {
    switch (status) {
      case "Gennemført":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Afventer":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Annulleret":
        return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const allPreviousCovers = covers;
  const waitingCovers = covers.filter((c) => c.status === "Afventer");

  const customerCode = localStorage.getItem("cbw_customer_code") || "";

  return (
    <div className="pt-8 pb-24 max-w-6xl mx-auto w-full">
      <TermsPopup 
        isOpen={customerInfo !== null && !customerInfo.hasAcceptedTerms} 
        onClose={() => setCustomerInfo(prev => prev ? {...prev, hasAcceptedTerms: true} : prev)}
        customerCode={customerCode}
      />
      {/* Profile Header */}
      <div className="bg-[#111111] border border-zinc-800/80 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <img
            src={customerInfo?.imageUrl || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hej, {customerInfo?.name || "Kunde"}</h1>
            <div className="flex flex-col gap-2 items-start">
              <p className="text-zinc-400">Ordrenummer: <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded ml-1">#{customerInfo?.orderNumber || "..."}</span></p>
              {customerInfo?.expirationDate && (() => {
                 const diffTime = new Date(customerInfo.expirationDate).getTime() - new Date().getTime();
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 return (
                   <p className="text-sm font-medium bg-amber-500/10 text-amber-500 inline-block px-3 py-1 rounded-full border border-amber-500/20">
                     Dit abonnement udløber om {diffDays > 0 ? diffDays : 0} {diffDays === 1 ? 'dag' : 'dage'} ({new Date(customerInfo.expirationDate).toLocaleDateString("da-DK")})
                   </p>
                 );
              })()}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="relative z-10 w-full md:w-auto overflow-hidden rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
          <div className="flex items-center justify-center gap-2">
            <span className="relative z-10">Åben fælleschat</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Orders info) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Waiting Covers */}
          <div className="bg-[#111111] border border-zinc-800/80 rounded-[2rem] p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-500" />
              I gangværende covers
            </h2>
            
            {waitingCovers.length > 0 ? (
              <div className="flex flex-col gap-4">
                {waitingCovers.map((cover) => (
                  <div key={cover.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{cover.track}</h4>
                      <p className="text-zinc-400 text-sm mt-1">{cover.artist} • Bestilt: {cover.date}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 shrink-0 ${getStatusClass(cover.status)}`}>
                      {getStatusIcon(cover.status)}
                      {cover.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                Ingen covers afventer for øjeblikket.
              </div>
            )}
          </div>

          {/* All Previous Covers */}
          <div className="bg-[#111111] border border-zinc-800/80 rounded-[2rem] p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              Tidligere covers
            </h2>
            
            <div className="flex flex-col gap-4">
              {allPreviousCovers.map((cover) => (
                <div key={cover.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors hover:bg-zinc-900/80">
                  <div className="flex items-center gap-4">
                    {cover.imageUrl ? (
                      <img src={cover.imageUrl} alt={cover.track} className="w-16 h-16 rounded-xl object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{cover.track}</h4>
                      <p className="text-zinc-400 text-sm mt-1">{cover.artist} • Dato: {cover.date}</p>
                      {cover.downloadUrl && (
                        <a href={cover.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                          Download Filer
                        </a>
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 shrink-0 ${getStatusClass(cover.status)}`}>
                    {getStatusIcon(cover.status)}
                    {cover.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Order Form) */}
        <div className="lg:col-span-1">
          <div className="bg-[#111111] border border-purple-500/20 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] sticky top-32">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-400" />
              Bestil nyt cover
            </h2>
            <p className="text-zinc-400 text-sm mb-6">Udfyld formularen for at starte processen med dit næste coverart.</p>

            {orderError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed flex items-start gap-3">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{orderError}</p>
              </div>
            )}

            {orderSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm leading-relaxed flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Bestilling modtaget, du vil modtage coveret på din mail indenfor 5 hverdage, skulle vi have spørgsmål vil vi ligeledes kontakte dig på den angivet mail</p>
              </div>
            )}

            <form onSubmit={handleOrderSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="artist" className="text-sm font-medium text-zinc-300">Kunstner navn *</label>
                <input
                  id="artist"
                  type="text"
                  required
                  value={newOrder.artist}
                  onChange={(e) => setNewOrder({ ...newOrder, artist: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="F.eks. LARS S."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">E-mail *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={newOrder.email}
                  onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="din@email.dk"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="track" className="text-sm font-medium text-zinc-300">Track titel *</label>
                <input
                  id="track"
                  type="text"
                  required
                  value={newOrder.track}
                  onChange={(e) => setNewOrder({ ...newOrder, track: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="F.eks. Sommernat"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ideas" className="text-sm font-medium text-zinc-300">Idéer til coveret *</label>
                <textarea
                  id="ideas"
                  required
                  rows={4}
                  value={newOrder.ideas}
                  onChange={(e) => setNewOrder({ ...newOrder, ideas: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                  placeholder="Beskriv stilen, farver, mood eller elementer du ønsker..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="link" className="text-sm font-medium text-zinc-300">Link til sangen for inspiration (valgfri)</label>
                <input
                  id="link"
                  type="url"
                  value={newOrder.link}
                  onChange={(e) => setNewOrder({ ...newOrder, link: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="F.eks. Dropbox, Soundcloud, Drive..."
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98]"
              >
                <span>Opret bestilling</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="mt-8">
            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </div>
        </div>

      </div>
    </div>
  );
}
