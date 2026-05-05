import { useState } from "react";
import { User, Clock, CheckCircle2, XCircle, Plus, Send, Image as ImageIcon } from "lucide-react";

type Status = "Afventer" | "Gennemført" | "Annulleret";

interface Cover {
  id: string;
  artist: string;
  track: string;
  status: Status;
  date: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [covers, setCovers] = useState<Cover[]>([
    {
      id: "CBW-10482",
      artist: "Test Artist",
      track: "Sommernat",
      status: "Gennemført",
      date: "01/05/2026",
      imageUrl: "https://i.postimg.cc/tgQ5WmQB/c35.png",
    },
    {
      id: "CBW-10483",
      artist: "Test Artist",
      track: "Mørket",
      status: "Annulleret",
      date: "02/05/2026",
    },
    {
      id: "CBW-10484",
      artist: "Test Artist",
      track: "Fremtiden",
      status: "Afventer",
      date: "04/05/2026",
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    artist: "",
    track: "",
    email: "",
    ideas: "",
    link: "",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoverItem: Cover = {
      id: `CBW-${Math.floor(10000 + Math.random() * 90000)}`,
      artist: newOrder.artist,
      track: newOrder.track,
      status: "Afventer",
      date: new Date().toLocaleDateString("da-DK"),
    };
    
    setCovers([newCoverItem, ...covers]);
    setNewOrder({ artist: "", track: "", email: "", ideas: "", link: "" });
    // In a real app, this would send data to the backend.
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 5000);
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

  return (
    <div className="pt-8 pb-24 max-w-6xl mx-auto w-full">
      {/* Profile Header */}
      <div className="bg-[#111111] border border-zinc-800/80 rounded-3xl p-8 mb-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <img
          src="https://i.pravatar.cc/150?img=11"
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover relative z-10"
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Velkommen tilbage, Lars!</h1>
          <p className="text-zinc-400">Ordrenummer: <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded ml-1">#CBW-10482</span></p>
        </div>
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
        </div>

      </div>
    </div>
  );
}
