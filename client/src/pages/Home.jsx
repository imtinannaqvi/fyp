import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ShieldAlert, Star, ChevronRight, Zap, ScanLine, FileText, Stethoscope, Heart, AlertTriangle, Pill, Activity, Camera, ClipboardList, Calculator, ShieldCheck, Upload, CheckCircle, ArrowRight } from "lucide-react";
import { useMenu } from "../context/MenuContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: <Search size={32} />, title: "Smart Medicine Search",     desc: "Full details, dosage, side effects and AI explanation instantly.", link: "/search" },
  { icon: <Stethoscope size={32} />, title: "Symptom Checker",           desc: "AI-powered medicine suggestions based on your symptoms.",          link: "/symptoms" },
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
    { icon: <Upload size={20} />,      step: "1", title: "Upload Image",  desc: "Take a photo of the medicine packaging or label" },
    { icon: <ScanLine size={20} />,    step: "2", title: "AI Scan",       desc: "Our AI extracts text and checks against verified database" },
    { icon: <ShieldCheck size={20} />, step: "3", title: "Get Verdict",   desc: "See if medicine is FAKE, AUTHENTIC, or SUSPICIOUS instantly" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalPop 0.3s ease-out forwards" }}
      >
        {/* Red header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <X size={16} className="text-white" />
          </button>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Fake Medicine Detector</h2>
              <p className="text-red-200 text-xs mt-0.5">AI-powered counterfeit detection for Pakistan</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Pakistan Alert:</strong> Up to 40% of medicines may be counterfeit. Verify before consuming any medicine.
            </p>
          </div>

          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">How It Works</p>
          <div className="space-y-3 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
                <span className="text-xs font-black text-gray-300">0{s.step}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); onNavigate("/fake-detector"); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3 shadow-lg shadow-red-100">
              <ShieldAlert size={20} /> Detect Fake Medicine Now
            </button>
            <button
              onClick={() => { onClose(); onNavigate("/report-fake"); }}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-2xl border-2 border-gray-200 transition flex items-center justify-center gap-3">
              <AlertTriangle size={20} className="text-red-500" /> Report Fake Medicine
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            For educational purposes only. Always consult a pharmacist.
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

  const [aboutRef, aboutVisible]     = useFadeIn();
  const [featRef, featVisible]       = useFadeIn();
  const [ctaRef, ctaVisible]         = useFadeIn();

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
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideLeft { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .hero-gradient { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%); background-size: 200% 200%; animation: gradientShift 8s ease infinite; }
        .fade-up { animation: fadeSlideUp 0.6s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .hero-search-input { background-color: transparent !important; color: #111827 !important; border: none !important; outline: none !important; }
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
              <div className="fade-up stagger-1 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Star size={10} fill="currentColor" /> Pakistan's AI Medicine Safety Platform
              </div>
              <h1 className="fade-up stagger-2 text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                Know Your Medicine.<br />
                <span className="text-blue-300">Stay Safe.</span>
              </h1>
              <p className="fade-up stagger-3 text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Search any medicine, check interactions, scan prescriptions and detect fake medicines — powered by Groq AI.
              </p>

              <form onSubmit={handleSearch} className="fade-up stagger-4 flex flex-col sm:flex-row items-center gap-2 rounded-2xl p-2 sm:p-1.5 transition-all mb-4 max-w-md mx-auto lg:mx-0" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-center w-full px-2">
                  <Search size={18} style={{ color: '#9ca3af' }} className="shrink-0" />
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Panadol, Brufen..." style={{ backgroundColor: 'transparent', color: '#111827', outline: 'none', border: 'none' }} className="hero-search-input w-full text-sm py-3 px-3" />
                </div>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} className="w-full sm:w-auto font-bold text-sm px-8 py-3 rounded-xl transition-all shrink-0 shadow-lg hover:opacity-90">Search</button>
              </form>

              <div className="fade-up stagger-4 flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="text-[10px] md:text-xs text-white/50 self-center w-full sm:w-auto mb-1 sm:mb-0">Try searching:</span>
                {["Panadol", "Brufen", "Augmentin"].map((s) => (
                  <button key={s} onClick={() => navigate(`/search?q=${s}`)} className="text-[10px] md:text-xs text-white/70 hover:text-white px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all">{s}</button>
                ))}
              </div>
            </div>

            {/* Right: Feature Quick-Launch Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: <Search size={20} />,      label: "Smart Search",  link: "/search",   modal: false },
                { icon: <Stethoscope size={20} />, label: "Symptoms",      link: "/symptoms", modal: false },
                { icon: <Zap size={20} />,         label: "Interactions",  link: "/interactions", modal: false },
                { icon: <ScanLine size={20} />,    label: "Fake Detector", link: null,        modal: true },
                { icon: <FileText size={20} />,    label: "Prescription",  link: "/prescription", modal: false },
                { icon: <Heart size={20} />,       label: "Dosage Calc",   link: "/search",   modal: false },
              ].map((item, i) => (
                <button key={i}
                  onClick={() => item.modal ? setShowFakeModal(true) : navigate(item.link)}
                  className={`flex items-center gap-4 p-5 border rounded-2xl transition-all text-left backdrop-blur-md group shadow-xl ${
                    item.modal
                      ? "bg-red-500/20 hover:bg-red-500/30 border-red-400/30"
                      : "bg-white/5 hover:bg-white/15 border-white/10"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform ${
                    item.modal ? "bg-red-400/30" : "bg-white/10"
                  }`}>{item.icon}</div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10000", suffix: "+", label: "Medicines" },
              { value: "3", suffix: "-Layer", label: "AI Pipeline" },
              { value: "100", suffix: "%", label: "Free" },
              { value: "24", suffix: "/7", label: "Available" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-blue-600"><CountUp target={s.value} suffix={s.suffix} /></p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────────────────── */}
        <section ref={aboutRef} className="py-20 md:py-28 bg-white border-b border-gray-100 overflow-hidden"
          style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? "none" : "translateY(20px)", transition: "all 0.8s ease" }}
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4">The Mission</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Built for Pakistan's<br />
                <span className="text-blue-600">Healthcare Gap</span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                Every year, thousands of Pakistanis suffer from counterfeit medicines, dangerous drug combinations and incorrect dosages because of limited access to verified data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {techStack.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-300 transition-all group">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all flex-shrink-0">
                      <span className="text-blue-600">{t.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl rotate-2 absolute inset-0 opacity-40 scale-95" />
              <div className="aspect-square bg-white border-2 border-gray-200 rounded-3xl shadow-xl relative flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-all">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <ShieldAlert size={32} className="text-blue-600" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Data</h3>
                 <p className="text-xs text-gray-600 leading-relaxed">Aggregating OpenFDA, local pharmacopeia, and Groq-processed AI insights for 99% accuracy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────── */}
        <section ref={featRef} className="py-16 md:py-24 bg-gray-50"
          style={{ opacity: featVisible ? 1 : 0, transition: "opacity 1s ease" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Platform Features</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Everything You Need</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((f, i) => (
                <div key={i}
                  onClick={() => f.modal ? setShowFakeModal(true) : navigate(f.link)}
                  className={`bg-white p-6 rounded-2xl border hover:shadow-xl transition-all cursor-pointer group ${
                    f.modal
                      ? "border-red-200 hover:border-red-500"
                      : "border-gray-200 hover:border-blue-500"
                  }`}
                >
                  <div className={`mb-4 group-hover:scale-110 transition-transform inline-block ${
                    f.modal ? "text-red-600" : "text-blue-600"
                  }`}>{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                  <div className={`flex items-center text-xs font-bold gap-1 ${
                    f.modal ? "text-red-600" : "text-blue-600"
                  }`}>
                    Try Now <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEDICINE SAFETY AWARENESS ──────────────────────────────────── */}
        <section className="py-16 md:py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Important Safety Information</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Medicine Safety Guidelines</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Essential tips to ensure safe and effective medication use</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldAlert size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Always Consult Your Doctor</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Never self-medicate. Always consult a qualified healthcare professional before starting any new medication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Check Expiry Dates</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Always verify the expiration date before taking any medicine. Expired medications can be ineffective or harmful.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Follow Prescribed Dosage</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Take medications exactly as prescribed. Never increase or decrease dosage without medical advice.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Heart size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Store Properly</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Keep medicines in a cool, dry place away from direct sunlight and out of reach of children.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
                backgroundColor: isDark ? '#2d1515' : '#fff1f2',
                borderColor: isDark ? '#7f1d1d' : '#fecaca'
              }} className="border-2 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <ShieldAlert size={24} className="text-red-500 shrink-0" />
                <div>
                  <h3 style={{ color: isDark ? '#fca5a5' : '#111827' }} className="font-bold mb-2">Warning: Counterfeit Medicines</h3>
                  <p style={{ color: isDark ? '#fca5a5' : '#374151' }} className="text-sm leading-relaxed mb-3">
                    Pakistan faces a serious issue with fake medicines. Always purchase from licensed pharmacies and verify packaging authenticity. Use our Fake Medicine Detector to scan suspicious products.
                  </p>
                  <button
                    onClick={() => setShowFakeModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Detect Fake Medicine
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section ref={ctaRef} className="py-12 px-4">
          <div className="max-w-5xl mx-auto hero-gradient rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Stay Safe?</h2>
              <p className="text-blue-100 mb-10 text-sm md:text-base max-w-xl mx-auto">Join thousands of users making safer healthcare choices with AI. Start searching now.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate("/search")} style={{ backgroundColor: '#ffffff', color: '#1d4ed8' }} className="px-8 py-4 rounded-2xl font-black text-sm hover:shadow-2xl transition-all">Search Medicine</button>
                <button onClick={() => setShowFakeModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2">
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