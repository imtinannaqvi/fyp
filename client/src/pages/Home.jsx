import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ShieldAlert, Star, ChevronRight, Zap, ScanLine, FileText, Stethoscope, Heart, AlertTriangle, Pill, Activity, Camera, ClipboardList, Calculator, ShieldCheck, Upload, CheckCircle, ArrowRight } from "lucide-react";
import { useMenu } from "../context/MenuContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: <Search size={32} />, title: "Smart Medicine Search",     desc: "Full details, dosage, side effects and AI explanation instantly.", link: "/search" },
  { icon: <Stethoscope size={32} />, title: "Symptom Checker",           desc: "AI-powered medicine suggestions based on your symptoms.",           link: "/symptoms" },
  { icon: <Zap size={32} />, title: "Drug Interaction Checker", desc: "Know if your medicines are safe to take together.",                link: "/interactions" },
  { icon: <Camera size={32} />, title: "Fake Medicine Detector",   desc: "AI detects counterfeit or unregistered medicines via image.",      link: null, modal: true },
  { icon: <ClipboardList size={32} />, title: "Prescription Scanner",      desc: "Scan prescriptions to get full info on all prescribed medicines.", link: "/prescription" },
  { icon: <Calculator size={32} />, title: "Personalized Dosage",       desc: "AI calculates your safe dose based on age, weight and conditions.", link: "/search" },
];

const techStack = [
  { icon: <Search size={20} />, name: "AI Search Engine", role: "DB → OpenFDA → Groq AI pipeline" },
  { icon: <Camera size={20} />, name: "OCR Scanner",      role: "Computer vision fake detection" },
  { icon: <Activity size={20} />, name: "Groq LLaMA 3.3",   role: "70B model for AI analysis" },
  { icon: <Pill size={20} />, name: "MongoDB Atlas",    role: "Verified medicine database" },
];

// ── Fade-in on scroll hook ─────────────────────────────────────────────────
const useFadeIn = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ── Animated number counter ────────────────────────────────────────────────
const CountUp = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const num = parseInt(target) || 0;
        let start = 0;
        const step = Math.ceil(num / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(num); clearInterval(timer); }
          else setCount(start);
        }, 35);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{isNaN(parseInt(target)) ? target : count}{suffix}</span>;
};

// ── Fake Medicine Modal ────────────────────────────────────────────────────
const FakeMedicineModal = ({ onClose, onNavigate }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const steps = [
    { icon: <Upload size={18} />,      step: "1", title: "Upload Image",   desc: "Photo of packaging or label" },
    { icon: <ScanLine size={18} />,    step: "2", title: "AI Scan",        desc: "Extracts text and checks DB" },
    { icon: <ShieldCheck size={18} />, step: "3", title: "Get Verdict",    desc: "See if FAKE or AUTHENTIC" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalPop 0.3s ease-out forwards" }}
      >
        {/* Blue header - Reduced padding */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 shrink-0 relative">
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <X size={14} className="text-white" />
          </button>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Fake Medicine Detector</h2>
              <p className="text-blue-200 text-[10px]">AI-powered detection for Pakistan</p>
            </div>
          </div>
        </div>

        {/* Body - Added Scroll if content too long */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-tight">
              <strong>Pakistan Alert:</strong> Up to 40% of medicines may be counterfeit. Verify before consuming.
            </p>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">How It Works</p>
          <div className="space-y-2 mb-5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">{s.title}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{s.desc}</p>
                </div>
                <span className="text-[10px] font-black text-gray-300">0{s.step}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => { onClose(); onNavigate("/fake-detector"); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md text-sm">
              <ShieldAlert size={18} /> Detect Fake Medicine Now
            </button>
            <button
              onClick={() => { onClose(); onNavigate("/report-fake"); }}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3.5 rounded-xl border-2 border-gray-200 transition flex items-center justify-center gap-2 text-sm">
              <AlertTriangle size={18} className="text-amber-500" /> Report Fake Medicine
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            Educational purposes only. Consult a pharmacist.
          </p>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isMenuOpen } = useMenu();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [showFakeModal, setShowFakeModal] = useState(false);

  const [aboutRef, aboutVisible] = useFadeIn();
  const [statsRef, statsVisible] = useFadeIn();
  const [featRef, featVisible]   = useFadeIn();
  const [safetyRef, safetyVisible] = useFadeIn();
  const [ctaRef, ctaVisible]     = useFadeIn();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const shouldShow = scrollY > 600;
      const nearFooter = scrollY + windowHeight > documentHeight - 300;
      setShowSticky(shouldShow && !nearFooter);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${query.trim()}`);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeSlideRight { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shimmerBg { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.35); } 70% { box-shadow: 0 0 0 18px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }
        @keyframes badgePop { 0% { transform: scale(0) rotate(-12deg); opacity: 0; } 70% { transform: scale(1.15) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes borderGlow { 0%,100% { border-color: #e5e7eb; box-shadow: none; } 50% { border-color: #93c5fd; box-shadow: 0 0 28px rgba(147,197,253,0.45); } }
        @keyframes textReveal { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .mission-pulse { animation: pulseRing 2.2s cubic-bezier(0.455,0.03,0.515,0.955) infinite; }
        .mission-badge-pop { animation: badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.8s both; }
        .mission-card-glow { animation: borderGlow 3s ease-in-out infinite; }
        .hero-gradient { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%); background-size: 200% 200%; animation: gradientShift 8s ease infinite; }
        .fade-up   { animation: fadeSlideUp   0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-right { animation: fadeSlideRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-left  { animation: fadeSlideLeft  0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .scale-in   { animation: scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-float { animation: floatY 3s ease-in-out infinite; }
        .stagger-1 { animation-delay: 0.15s; opacity: 0; }
        .stagger-2 { animation-delay: 0.3s;  opacity: 0; }
        .stagger-3 { animation-delay: 0.45s; opacity: 0; }
        .stagger-4 { animation-delay: 0.6s;  opacity: 0; }
        .stagger-5 { animation-delay: 0.75s; opacity: 0; }
        .stagger-6 { animation-delay: 0.9s;  opacity: 0; }
        .hero-search-input { background-color: transparent !important; color: #111827 !important; border: none !important; outline: none !important; }
        .feature-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 48px rgba(0,0,0,0.12); }
        .stat-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .stat-card:hover { transform: scale(1.08); }
        .safety-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .safety-card:hover { transform: translateY(-5px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); border-color: #93c5fd !important; }
        .tech-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .tech-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
        .icon-spin { transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
        .group:hover .icon-spin { transform: rotate(360deg); }
        .hero-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hero-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }
        .hero-btn:active { transform: scale(0.97); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes heroFadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroFadeRight { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
        .hero-item { opacity: 0; animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-item-right { opacity: 0; animation: heroFadeRight 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-d1 { animation-delay: 0.1s; } .hero-d2 { animation-delay: 0.25s; } .hero-d3 { animation-delay: 0.4s; }
        .hero-d4 { animation-delay: 0.55s; } .hero-d5 { animation-delay: 0.7s; }
        .hero-r1 { animation-delay: 0.2s; } .hero-r2 { animation-delay: 0.32s; } .hero-r3 { animation-delay: 0.44s; }
        .hero-r4 { animation-delay: 0.56s; } .hero-r5 { animation-delay: 0.68s; } .hero-r6 { animation-delay: 0.8s; }
        @keyframes statFadeUp { from { opacity: 0; transform: translateY(36px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes statLineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .stat-enter { opacity: 0; }
        .stat-enter.stat-visible { animation: statFadeUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stat-line { transform-origin: left; transform: scaleX(0); transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .stat-line.stat-visible { transform: scaleX(1); }
        @keyframes missionFadeLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes missionFadeRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes missionFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes missionCardPop { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes labelSlide { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shieldPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 0 12px rgba(37,99,235,0); } }
        .mission-label { opacity: 0; }
        .mission-label.about-visible { animation: labelSlide 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
        .mission-heading { opacity: 0; }
        .mission-heading.about-visible { animation: missionFadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.22s forwards; }
        .mission-para { opacity: 0; }
        .mission-para.about-visible { animation: missionFadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.36s forwards; }
        .mission-left { opacity: 0; }
        .mission-left.about-visible { animation: missionFadeLeft 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .mission-right { opacity: 0; }
        .mission-right.about-visible { animation: missionFadeRight 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; }
        .mission-tech-card { opacity: 0; }
        .mission-tech-card.about-visible { animation: missionCardPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .shield-pulse { animation: shieldPulse 2.4s ease-in-out infinite; }
        @keyframes featHeadFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes featCardIn { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes featIconPop { from { opacity: 0; transform: scale(0.5) rotate(-10deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        .feat-head { opacity: 0; }
        .feat-head.feat-visible { animation: featHeadFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .feat-subhead { opacity: 0; }
        .feat-subhead.feat-visible { animation: featHeadFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; }
        .feat-card { opacity: 0; }
        .feat-card.feat-visible { animation: featCardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .feat-icon { opacity: 0; }
        .feat-icon.feat-visible { animation: featIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes safetyFadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes safetyCardIn { from { opacity: 0; transform: translateY(32px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes safetyIconPop { from { opacity: 0; transform: scale(0.4) rotate(-15deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes safetyWarnSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .safety-head { opacity: 0; }
        .safety-head.safety-visible { animation: safetyFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        .safety-subhead { opacity: 0; }
        .safety-subhead.safety-visible { animation: safetyFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.12s forwards; }
        .safety-para { opacity: 0; }
        .safety-para.safety-visible { animation: safetyFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s forwards; }
        .safety-card { opacity: 0; }
        .safety-card.safety-visible { animation: safetyCardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .safety-icon { opacity: 0; }
        .safety-icon.safety-visible { animation: safetyIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .safety-warn { opacity: 0; }
        .safety-warn.safety-visible { animation: safetyWarnSlide 0.6s cubic-bezier(0.16,1,0.3,1) 0.55s forwards; }
      `}</style>

      {/* Fake Medicine Modal */}
      {showFakeModal && (
        <FakeMedicineModal
          onClose={() => setShowFakeModal(false)}
          onNavigate={navigate}
        />
      )}

      <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

        {showSticky && !isMenuOpen && (
          <div className="fixed top-16 lg:top-[calc(5rem+2.625rem)] left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg px-4 py-3 animate-slideDown">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2 rounded-xl p-1.5 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center flex-1 px-3">
                <Search size={18} style={{ color: '#9ca3af' }} className="shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine..." style={{ backgroundColor: 'transparent', color: '#111827', outline: 'none', border: 'none' }} className="hero-search-input w-full text-sm placeholder-gray-400 py-2.5 px-3" />
              </div>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} className="font-semibold text-sm px-8 py-2.5 rounded-lg transition-all hover:opacity-90">Search</button>
            </form>
          </div>
        )}

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="hero-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          
          <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="hero-item hero-d1 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Star size={10} fill="currentColor" /> Pakistan's AI Medicine Safety Platform
              </div>
              <h1 className="hero-item hero-d2 text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                Know Your Medicine.<br />
                <span className="text-blue-300">Stay Safe.</span>
              </h1>
              <p className="hero-item hero-d3 text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Search any medicine, check interactions, scan prescriptions and detect fake medicines — powered by Groq AI.
              </p>

              <form onSubmit={handleSearch} className="hero-item hero-d4 flex flex-col sm:flex-row items-center gap-2 rounded-2xl p-2 sm:p-1.5 transition-all mb-4 max-w-md mx-auto lg:mx-0" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-center w-full px-2">
                  <Search size={18} style={{ color: '#9ca3af' }} className="shrink-0" />
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Panadol, Brufen..." style={{ backgroundColor: 'transparent', color: '#111827', outline: 'none', border: 'none' }} className="hero-search-input w-full text-sm py-3 px-3" />
                </div>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} className="w-full sm:w-auto font-bold text-sm px-8 py-3 rounded-xl transition-all shrink-0 shadow-lg hover:opacity-90">Search</button>
              </form>

              <div className="hero-item hero-d5 flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="text-[10px] md:text-xs text-white/50 self-center w-full sm:w-auto mb-1 sm:mb-0">Try searching:</span>
                {["Panadol", "Brufen", "Augmentin"].map((s) => (
                  <button key={s} onClick={() => navigate(`/search?q=${s}`)} className="text-[10px] md:text-xs text-white/70 hover:text-white px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all">{s}</button>
                ))}
              </div>
            </div>

            {/* Right: Feature Quick-Launch Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: <Search size={20} />,      label: "Smart Search",  link: "/search",       modal: false },
                { icon: <Stethoscope size={20} />, label: "Symptoms",      link: "/symptoms",     modal: false },
                { icon: <Zap size={20} />,         label: "Interactions",  link: "/interactions", modal: false },
                { icon: <ScanLine size={20} />,    label: "Fake Detector", link: null,             modal: true  },
                { icon: <FileText size={20} />,    label: "Prescription",  link: "/prescription", modal: false },
                { icon: <Heart size={20} />,       label: "Dosage Calc",   link: "/search",       modal: false },
              ].map((item, i) => (
                <button key={i}
                  onClick={() => item.modal ? setShowFakeModal(true) : navigate(item.link)}
                  className={`hero-item-right hero-r${i+1} flex items-center gap-4 p-5 border rounded-2xl transition-all text-left backdrop-blur-md group shadow-xl bg-white/5 hover:bg-white/15 border-white/10`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform bg-white/10">
                    <span className="icon-spin">{item.icon}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────────── */}
        <section ref={statsRef} className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10000", suffix: "+", label: "Medicines", icon: <Pill size={18} /> },
              { value: "3",     suffix: "-Layer", label: "AI Pipeline", icon: <Activity size={18} /> },
              { value: "100",  suffix: "%", label: "Free", icon: <CheckCircle size={18} /> },
              { value: "24",   suffix: "/7", label: "Available", icon: <Zap size={18} /> },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`stat-enter stat-card text-center group ${statsVisible ? 'stat-visible' : ''}`}
                style={{ animationDelay: `${i * 0.13}s` }}
              >
                <div className="flex justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                    style={{
                      opacity: statsVisible ? 1 : 0,
                      transform: statsVisible ? 'scale(1)' : 'scale(0.5)',
                      transition: `opacity 0.5s ease ${0.1 + i * 0.13}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.13}s`
                    }}
                  >
                    {s.icon}
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-blue-600">
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <div
                  className={`stat-line h-0.5 bg-blue-200 rounded-full mx-auto mt-2 mb-1 w-8 ${statsVisible ? 'stat-visible' : ''}`}
                  style={{ transitionDelay: `${0.3 + i * 0.13}s` }}
                />
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────────────────── */}
        <section ref={aboutRef} className="py-20 md:py-28 bg-white border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — slides from left */}
            <div className={`mission-left order-2 lg:order-1 ${aboutVisible ? 'about-visible' : ''}`}>
              <p className={`mission-label ${aboutVisible ? 'about-visible' : ''} text-sm font-bold uppercase tracking-wider text-blue-600 mb-4`}>The Mission</p>
              <h2 className={`mission-heading ${aboutVisible ? 'about-visible' : ''} text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6`}>
                Built for Pakistan's<br />
                <span className="text-blue-600">Healthcare Gap</span>
              </h2>
              <p className={`mission-para ${aboutVisible ? 'about-visible' : ''} text-gray-600 text-base md:text-lg leading-relaxed mb-8`}>
                Every year, thousands of Pakistanis suffer from counterfeit medicines, dangerous drug combinations and incorrect dosages because of limited access to verified data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {techStack.map((t, i) => (
                  <div
                    key={i}
                    className={`mission-tech-card ${aboutVisible ? 'about-visible' : ''} tech-card flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl group`}
                    style={{ animationDelay: `${0.4 + i * 0.12}s` }}
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                      <span className="text-blue-600 group-hover:text-white transition-colors duration-300 icon-spin">{t.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — slides from right */}
            <div className={`mission-right order-1 lg:order-2 relative ${aboutVisible ? 'about-visible' : ''}`}>
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl rotate-2 absolute inset-0 opacity-40 scale-95" />
              <div className="aspect-square bg-white border-2 border-gray-100 rounded-3xl shadow-xl relative flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-all duration-500">

                {/* Animated badge */}
                {aboutVisible && (
                  <div className="mission-badge-pop absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">99% Accurate</div>
                )}

                {/* Shield icon with pulse */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-6 shield-pulse animate-float">
                  <ShieldAlert size={36} className="text-blue-600" />
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? 'none' : 'translateY(12px)', transition: 'opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s' }}
                >Verified Data</h3>

                <p
                  className="text-sm text-gray-500 leading-relaxed max-w-[220px]"
                  style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? 'none' : 'translateY(10px)', transition: 'opacity 0.5s ease 0.68s, transform 0.5s ease 0.68s' }}
                >Aggregating OpenFDA, local pharmacopeia, and Groq-processed AI insights for 99% accuracy.</p>

                {/* Animated divider line */}
                <div
                  className="h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-full mt-6 w-full"
                  style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'center', transition: 'opacity 0.5s ease 0.75s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.75s' }}
                />

                {/* 3 stat pills */}
                <div className="flex gap-3 mt-5">
                  {['OpenFDA', 'Groq AI', 'Local DB'].map((tag, i) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"
                      style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? 'translateY(0)' : 'translateY(10px)', transition: `opacity 0.4s ease ${0.82 + i * 0.1}s, transform 0.4s ease ${0.82 + i * 0.1}s` }}
                    >{tag}</span>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────── */}
        <section ref={featRef} className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className={`feat-head ${featVisible ? 'feat-visible' : ''} text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4`}>Platform Features</p>
              <h2 className={`feat-subhead ${featVisible ? 'feat-visible' : ''} text-3xl md:text-4xl font-black text-gray-900`}>Everything You Need</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  onClick={() => f.modal ? setShowFakeModal(true) : navigate(f.link)}
                  className={`feat-card ${featVisible ? 'feat-visible' : ''} feature-card bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-400 cursor-pointer group relative overflow-hidden`}
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  <div className="relative z-10">
                    <div className={`feat-icon ${featVisible ? 'feat-visible' : ''} mb-4 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                      <span className="icon-spin">{f.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">{f.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex items-center text-xs font-bold gap-1 text-blue-600">
                      Try Now <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEDICINE SAFETY AWARENESS ──────────────────────────────────── */}
        <section ref={safetyRef} className="py-16 md:py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">

            {/* Header */}
            <div className="text-center mb-12">
              <p className={`safety-head ${safetyVisible ? 'safety-visible' : ''} text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4`}>Important Safety Information</p>
              <h2 className={`safety-subhead ${safetyVisible ? 'safety-visible' : ''} text-3xl md:text-4xl font-black text-gray-900 mb-4`}>Medicine Safety Guidelines</h2>
              <p className={`safety-para ${safetyVisible ? 'safety-visible' : ''} text-gray-600 max-w-2xl mx-auto`}>Essential tips to ensure safe and effective medication use</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { icon: <ShieldAlert size={20} className="text-blue-600" />, iconBg: 'bg-blue-100', title: 'Always Consult Your Doctor', desc: 'Never self-medicate. Always consult a qualified healthcare professional before starting any new medication.' },
                { icon: <AlertTriangle size={20} className="text-amber-600" />, iconBg: 'bg-amber-100', title: 'Check Expiry Dates', desc: 'Always verify the expiration date before taking any medicine. Expired medications can be ineffective or harmful.' },
                { icon: <FileText size={20} className="text-blue-600" />, iconBg: 'bg-blue-100', title: 'Follow Prescribed Dosage', desc: 'Take medications exactly as prescribed. Never increase or decrease dosage without medical advice.' },
                { icon: <Heart size={20} className="text-green-600" />, iconBg: 'bg-green-100', title: 'Store Properly', desc: 'Keep medicines in a cool, dry place away from direct sunlight and out of reach of children.' },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`safety-card ${safetyVisible ? 'safety-visible' : ''} bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 hover:shadow-md transition-all duration-300`}
                  style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`safety-icon ${safetyVisible ? 'safety-visible' : ''} w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                    >
                      <span className="icon-spin">{card.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">{card.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning banner */}
            <div
              className={`safety-warn ${safetyVisible ? 'safety-visible' : ''} border-2 rounded-xl p-6`}
              style={{ backgroundColor: isDark ? '#0f1f3d' : '#eff6ff', borderColor: isDark ? '#1e3a5f' : '#bfdbfe' }}
            >
              <div className="flex items-start gap-4">
                <ShieldAlert size={24} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 style={{ color: isDark ? '#93c5fd' : '#111827' }} className="font-bold mb-2">Warning: Counterfeit Medicines</h3>
                  <p style={{ color: isDark ? '#93c5fd' : '#374151' }} className="text-sm leading-relaxed mb-3">
                    Pakistan faces a serious issue with fake medicines. Always purchase from licensed pharmacies and verify packaging authenticity. Use our Fake Medicine Detector to scan suspicious products.
                  </p>
                  <button
                    onClick={() => setShowFakeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    Detect Fake Medicine
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section ref={ctaRef} className="py-12 px-4"
          style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? "none" : "translateY(32px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}
        >
          <div className="max-w-5xl mx-auto hero-gradient rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Stay Safe?</h2>
              <p className="text-blue-100 mb-10 text-sm md:text-base max-w-xl mx-auto">Join thousands of users making safer healthcare choices with AI. Start searching now.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate("/search")} style={{ backgroundColor: '#ffffff', color: '#1d4ed8' }} className="px-8 py-4 rounded-2xl font-black text-sm hover:shadow-2xl transition-all">Search Medicine</button>
                <button onClick={() => setShowFakeModal(true)} className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2">
                  <ShieldAlert size={18} /> Detect Fake Medicine
                </button>
                {!user && (
                  <button onClick={() => navigate("/register")} className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">Create Free Account</button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER DISCLAIMER ──────────────────────────────────────────── */}
        <footer className="bg-white border-t border-gray-100 py-10 px-6 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Medico Guidance © 2026</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-full px-6 py-2 inline-block border border-amber-100">
            ⚠️ <strong>Medical Disclaimer:</strong> This AI tool is for information only. Always consult a doctor.
          </p>
        </footer>
      </div>
    </>
  );
};

export default Home;