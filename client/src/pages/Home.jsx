import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, X, ShieldAlert, Star, ChevronRight, Zap, ScanLine, FileText, Stethoscope, Heart } from "lucide-react";

const features = [
  { icon: "🔍", title: "Smart Medicine Search",     desc: "Full details, dosage, side effects and AI explanation instantly.", link: "/search" },
  { icon: "🩺", title: "Symptom Checker",           desc: "AI-powered medicine suggestions based on your symptoms.",          link: "/symptoms" },
  { icon: "⚡", title: "Drug Interaction Checker", desc: "Know if your medicines are safe to take together.",                link: "/interactions" },
  { icon: "📷", title: "Fake Medicine Detector",   desc: "AI detects counterfeit or unregistered medicines via image.",      link: "/ocr" },
  { icon: "📋", title: "Prescription Scanner",      desc: "Scan prescriptions to get full info on all prescribed medicines.", link: "/prescription" },
  { icon: "💊", title: "Personalized Dosage",       desc: "AI calculates your safe dose based on age, weight and conditions.", link: "/search" },
];

const risks = [
  { title: "Wrong Diagnosis",         desc: "Treating the wrong condition can worsen your actual illness." },
  { title: "Dangerous Side Effects",  desc: "Unmonitored drugs can trigger allergic reactions or organ damage." },
  { title: "Antibiotic Resistance",   desc: "Misuse makes future bacterial infections harder to treat." },
  { title: "Fatal Interactions",      desc: "Mixing medicines without advice can be life-threatening." },
];

const techStack = [
  { icon: "🔍", name: "AI Search Engine", role: "DB → OpenFDA → Groq AI pipeline" },
  { icon: "📷", name: "OCR Scanner",      role: "Computer vision fake detection" },
  { icon: "🧠", name: "Groq LLaMA 3.3",   role: "70B model for AI analysis" },
  { icon: "🗄️", name: "MongoDB Atlas",    role: "Verified medicine database" },
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

// ── MediBot ────────────────────────────────────────────────────────────────
const RobotAssistant = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const suggestions = [
    { label: "Search a medicine",       link: "/search",       icon: "🔍" },
    { label: "Check my symptoms",       link: "/symptoms",     icon: "🩺" },
    { label: "Check drug interactions", link: "/interactions", icon: "⚡" },
    { label: "Scan a medicine image",   link: "/ocr",           icon: "📷" },
    { label: "Scan my prescription",    link: "/prescription", icon: "📋" },
  ];
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
      {!open && (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2 text-[10px] md:text-xs font-medium text-gray-600 mr-1 mb-1 animate-bounce"
          style={{ animationDuration: "3s" }}>
          👋 Need help?
        </div>
      )}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[280px] md:w-64 overflow-hidden mb-2"
          style={{ animation: "slideUp 0.2s ease-out" }}>
          <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span>🤖</span>
              <p className="font-semibold text-sm">MediBot</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition">
              <X size={15} />
            </button>
          </div>
          <div className="p-3 space-y-1.5">
            {suggestions.map((s, i) => (
              <button key={s.link} onClick={() => { navigate(s.link); setOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-blue-50 transition text-left group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{s.label}</span>
                <ArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center pb-3 px-4">AI guidance is not a medical diagnosis.</p>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-900 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 relative"
      >
        {open ? <X size={20} className="text-white" /> : (
          <>
            <span className="text-2xl">🤖</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white">
              <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
            </span>
          </>
        )}
      </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredRisk, setHoveredRisk] = useState(null);

  const [aboutRef, aboutVisible]     = useFadeIn();
  const [warningRef, warningVisible] = useFadeIn();
  const [howRef, howVisible]         = useFadeIn();
  const [featRef, featVisible]       = useFadeIn();
  const [ctaRef, ctaVisible]         = useFadeIn();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${query.trim()}`);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideLeft { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .hero-gradient { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%); background-size: 200% 200%; animation: gradientShift 8s ease infinite; }
        .fade-up { animation: fadeSlideUp 0.6s ease-out forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

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

              <form onSubmit={handleSearch} className="fade-up stagger-4 flex flex-col sm:flex-row items-center gap-2 bg-white/10 sm:bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-2 sm:p-1.5 focus-within:bg-white/20 transition-all mb-4 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center w-full px-2">
                  <Search size={18} className="text-white/60 shrink-0" />
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Panadol, Brufen..." className="w-full text-sm text-white placeholder-white/50 focus:outline-none bg-transparent py-3 px-3" />
                </div>
                <button type="submit" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-8 py-3 rounded-xl transition-all shrink-0 shadow-lg">Search</button>
              </form>

              <div className="fade-up stagger-4 flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="text-[10px] md:text-xs text-white/50 self-center w-full sm:w-auto mb-1 sm:mb-0">Try searching:</span>
                {["Panadol", "Brufen", "Augmentin"].map((s) => (
                  <button key={s} onClick={() => navigate(`/search?q=${s}`)} className="text-[10px] md:text-xs text-white/70 hover:text-white px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all">{s}</button>
                ))}
              </div>
            </div>

            {/* Right: Feature Quick-Launch Grid (Visible on Desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: <Search size={20} />, label: "Smart Search", link: "/search" },
                { icon: <Stethoscope size={20} />, label: "Symptoms", link: "/symptoms" },
                { icon: <Zap size={20} />, label: "Interactions", link: "/interactions" },
                { icon: <ScanLine size={20} />, label: "Fake Detector", link: "/ocr" },
                { icon: <FileText size={20} />, label: "Prescription", link: "/prescription" },
                { icon: <Heart size={20} />, label: "Dosage Calc", link: "/search" },
              ].map((item, i) => (
                <button key={i} onClick={() => navigate(item.link)} className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all text-left backdrop-blur-md group shadow-xl">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">{item.icon}</div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS (Responsive 2x2 or 4x1) ────────────────────────────────── */}
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
        <section ref={aboutRef} className="py-16 md:py-24 border-b border-gray-100 overflow-hidden"
          style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? "none" : "translateY(20px)", transition: "all 0.8s ease" }}
        >
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">The Mission</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">Built for Pakistan's<br />Healthcare Gap.</h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6">
                Every year, thousands of Pakistanis suffer from counterfeit medicines, dangerous drug combinations and incorrect dosages because of limited access to verified data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {techStack.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="font-bold text-xs text-gray-900">{t.name}</p>
                      <p className="text-[10px] text-gray-500">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-square bg-blue-600 rounded-3xl rotate-3 absolute inset-0 opacity-10 scale-95" />
              <div className="aspect-square bg-white border-2 border-gray-100 rounded-3xl shadow-2xl relative flex flex-col items-center justify-center p-8 text-center">
                 <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={40} className="text-blue-600" />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-2">Verified Data</h3>
                 <p className="text-xs text-gray-400">Aggregating OpenFDA, local pharmacopeia, and Groq-processed AI insights for 99% accuracy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES (Responsive Grid) ─────────────────────────────────── */}
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
                <div key={i} onClick={() => navigate(f.link)}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex items-center text-blue-600 text-xs font-bold gap-1">
                    Try Now <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
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
                <button onClick={() => navigate("/search")} className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm hover:shadow-2xl transition-all">Search Medicine</button>
                <button onClick={() => navigate("/register")} className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">Create Free Account</button>
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

        <RobotAssistant />
      </div>
    </>
  );
};

export default Home;