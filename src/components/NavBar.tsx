import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, ArrowUpRight, Wind, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function NavBar({ onLoginClick }: { onLoginClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [customerName, setCustomerName] = useState<string | null>(null);
  const adminCode = localStorage.getItem("cbw_admin_code") === "Peniscola123" ? "admin" : null;
  const customerCode = localStorage.getItem("cbw_customer_code");

  useEffect(() => {
    if (customerCode && !adminCode) {
      getDoc(doc(db, "customers", customerCode)).then(docSnap => {
        if (docSnap.exists()) {
          setCustomerName(docSnap.data().name);
        }
      });
    }
  }, [customerCode, adminCode]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("cbw_customer_code");
    localStorage.removeItem("cbw_admin_code");
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { name: "Forside", path: "/" },
    { name: "Priser", path: "/priser" },
    { name: "Års abonnement", path: "/abonnement" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
      <nav className="flex items-center justify-between w-full max-w-[1400px] bg-[#111111] border border-zinc-800/80 rounded-full px-4 py-2 shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center text-white px-2 transition-opacity hover:opacity-90">
          <img src="https://i.postimg.cc/HxZ2FYR0/logo.png" alt="Cover By Wind Logo" className="h-[34px] object-contain" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-zinc-400">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`hover:text-white transition-colors py-2 ${
                isActive(link.path) ? "text-white" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6 pr-2">
          {adminCode ? (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">
                Adminpanel
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log ud</span>
              </button>
            </div>
          ) : customerCode ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-white">Hej {customerName || "Kunde"}!</span>
              <Link to="/dashboard" className="text-purple-400 hover:text-purple-300">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log ud</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
              <span>Log ind</span>
            </button>
          )}
          
          <Link to="/priser" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full transition-colors">
            <span>Bestil nu</span>
            <div className="bg-black/25 p-1 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2 text-zinc-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium p-2 rounded-lg hover:bg-zinc-800 transition-colors ${
                isActive(link.path) ? "text-white bg-zinc-800/50" : "text-zinc-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-zinc-800 w-full my-2"></div>
          {adminCode ? (
            <>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-amber-500 font-medium p-2 hover:bg-zinc-800 rounded-lg">Adminpanel</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-medium text-red-400 p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Log ud</span>
              </button>
            </>
          ) : customerCode ? (
            <>
              <div className="text-zinc-300 font-medium p-2">Hej {customerName || "Kunde"}!</div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-purple-400 font-medium p-2 hover:bg-zinc-800 rounded-lg">Dashboard</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-medium text-red-400 p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Log ud</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
              className="flex items-center gap-2 text-lg font-medium text-zinc-300 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Log ind med ordrenummer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
