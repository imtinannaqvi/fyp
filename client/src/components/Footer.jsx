import { Link } from "react-router-dom";
import { Search, Stethoscope, Zap, ScanLine, FileText, Github, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                💊
              </div>
              <span className="font-bold text-white text-lg">
                Medico<span className="text-blue-400">.</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered medicine safety platform built for Pakistan. Fighting self-medication, one search at a time.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-900 text-blue-300 px-2.5 py-1 rounded-full">
                🇵🇰 Made in Pakistan
              </span>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Features</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Medicine Search",   path: "/search",       icon: <Search size={13} /> },
                { label: "Symptom Checker",   path: "/symptoms",     icon: <Stethoscope size={13} /> },
                { label: "Drug Interactions", path: "/interactions", icon: <Zap size={13} /> },
                { label: "Fake Detector",     path: "/ocr",          icon: <ScanLine size={13} /> },
                { label: "Prescription Scan", path: "/prescription", icon: <FileText size={13} /> },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 text-sm hover:text-white transition"
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Login",           path: "/login" },
                { label: "Register",        path: "/register" },
                { label: "My Profile",      path: "/profile" },
                { label: "Saved Medicines", path: "/saved" },
                { label: "Search History",  path: "/history" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Disclaimer</h4>
            <p className="text-sm leading-relaxed">
              This platform is for educational purposes only. Always consult a qualified doctor before taking any medicine.
            </p>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-yellow-400 font-medium mb-1">⚠️ Medical Warning</p>
              <p className="text-xs leading-relaxed">
                Self-medication can be dangerous. Information on this site is AI-generated and should not replace professional medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} Medico Guidance. Final Year Project — All rights reserved.
          </p>
          <p className="text-xs">
            Built with React, Node.js, MongoDB & Groq AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;