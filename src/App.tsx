import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Prices from "./pages/Prices";
import Yearly from "./pages/Yearly";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import LoginPopup from "./components/LoginPopup";
import { useState } from "react";

function AppContent() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-50 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <NavBar onLoginClick={() => setIsLoginOpen(true)} />
      <main className="pt-32 pb-12 px-6 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/priser" element={<Prices />} />
          <Route path="/abonnement" element={<Yearly />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {isLoginOpen && (
        <LoginPopup onClose={() => setIsLoginOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
