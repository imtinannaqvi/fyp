import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Stethoscope, Zap, ScanLine, FileText, Heart, Shield, AlertCircle } from "lucide-react";

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-gray-300 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Brand - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-white text-2xl tracking-tight block">
                  Medico<span className="text-blue-400">Guidance</span>
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400 max-w-sm">
              AI-powered medicine safety platform built for Pakistan. Fighting self-medication through intelligent healthcare solutions.
            </p>
            <div className="inline-flex items-center gap-2.5 bg-blue-950/50 text-blue-300 px-5 py-2.5 rounded-xl border border-blue-900/50 backdrop-blur-sm">
              <span className="text-xl">🇵🇰</span>
              <span className="text-sm font-bold">Made in Pakistan</span>
            </div>
          </div>

          {/* Features - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-base mb-6 uppercase tracking-wide flex items-center gap-2">
              Features
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Medicine Search",   path: "/search",       icon: <Search size={16} /> },
                { label: "Symptom Checker",   path: "/symptoms",     icon: <Stethoscope size={16} /> },
                { label: "Drug Interactions", path: "/interactions", icon: <Zap size={16} /> },
                { label: "Fake Detector",     path: "/ocr",          icon: <ScanLine size={16} /> },
                { label: "Prescription Scan", path: "/prescription", icon: <FileText size={16} /> },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                  >
                    <span className="text-blue-400 group-hover:text-blue-300">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-base mb-6 uppercase tracking-wide">
              Account
            </h4>
            <ul className="space-y-3.5">
              {!user ? (
                <>
                  <li>
                    <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/profile" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/saved" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Saved Medicines
                    </Link>
                  </li>
                  <li>
                    <Link to="/history" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Search History
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Disclaimer - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-base mb-6 uppercase tracking-wide">
              Important
            </h4>
            <p className="text-sm leading-relaxed text-gray-400 mb-5">
              This platform is for educational purposes only. Always consult a qualified healthcare professional.
            </p>
            <div className="bg-gradient-to-br from-amber-950/40 to-red-950/40 border border-amber-900/50 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-2">
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wide">
                  Medical Warning
                </p>
              </div>
              <p className="text-xs leading-relaxed text-gray-300">
                Self-medication can be dangerous. AI-generated information should not replace professional medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-400 font-medium">
                © {new Date().getFullYear()} <span className="text-white font-bold">MedicoGuidance</span>. Final Year Project.
              </p>
              <p className="text-xs text-gray-500 mt-1">All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-sm text-gray-400">Built with</span>
              <span className="px-3 py-1 bg-blue-950/50 text-blue-400 text-xs font-bold rounded-lg border border-blue-900/50">React</span>
              <span className="px-3 py-1 bg-green-950/50 text-green-400 text-xs font-bold rounded-lg border border-green-900/50">Node.js</span>
              <span className="px-3 py-1 bg-emerald-950/50 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-900/50">MongoDB</span>
              <span className="px-3 py-1 bg-purple-950/50 text-purple-400 text-xs font-bold rounded-lg border border-purple-900/50">Groq AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;