import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import {
  X, Heart, ArrowRight,
  Send, Loader, User, RotateCcw, Bot,
  Pill, AlertTriangle, Info, CheckCircle, ShieldAlert,
  Building2, FlaskConical, Stethoscope
} from "lucide-react";

const quickSuggestions = [
  { label: "Is Panadol safe daily?",           msg: "Is it safe to take Panadol every day?" },
  { label: "Antibiotic without prescription?", msg: "Can I take antibiotics without a doctor's prescription?" },
  { label: "Medicine interactions?",           msg: "How do I check if two medicines are safe together?" },
  { label: "Self-medication risks?",           msg: "What are the main risks of self-medication?" },
];

const parseMessage = (text) => {
  const parts = [];
  const regex = /\[GO:(\/[^\|]+)\|([^\]]+)\]/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "link", path: match[1], label: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
};

const RobotAvatar = ({ size = "sm" }) => {
  const dim = size === "sm" ? "w-7 h-7" : "w-10 h-10";
  const iconSize = size === "sm" ? 16 : 20;
  return (
    <div className={`${dim} rounded-xl flex items-center justify-center shrink-0`}
      style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
      <Bot size={iconSize} className="text-white" />
    </div>
  );
};

// ── Overdose Alert Card ───────────────────────────────────────────────────────
const OverdoseAlertCard = ({ medicine }) => {
  const { isDark } = useTheme();

  const body   = isDark ? { background: "#0f172a", border: "1px solid #7f1d1d" }
                        : { background: "#ffffff",  border: "1px solid #fca5a5" };
  const green  = isDark ? { background: "#052e16", border: "1px solid #16a34a" }
                        : { background: "#f0fdf4",  border: "1px solid #86efac" };
  const orange = isDark ? { background: "#431407", border: "1px solid #c2410c" }
                        : { background: "#fff7ed",  border: "1px solid #fed7aa" };
  const red    = isDark ? { background: "#3b0a0a", border: "1px solid #dc2626" }
                        : { background: "#fef2f2",  border: "1px solid #fecaca" };

  const consultOptions = [
    {
      icon: <Building2 size={12} />,
      label: "Nearest Hospital",
      color:  isDark ? "#60a5fa" : "#2563eb",
      bg:     isDark ? "#1e3a5f" : "#eff6ff",
      border: isDark ? "#2563eb" : "#bfdbfe",
    },
    {
      icon: <FlaskConical size={12} />,
      label: "Pharmacist",
      color:  isDark ? "#34d399" : "#059669",
      bg:     isDark ? "#052e16" : "#f0fdf4",
      border: isDark ? "#16a34a" : "#86efac",
    },
    {
      icon: <Stethoscope size={12} />,
      label: "Your Doctor",
      color:  isDark ? "#c084fc" : "#7c3aed",
      bg:     isDark ? "#2e1065" : "#faf5ff",
      border: isDark ? "#7c3aed" : "#d8b4fe",
    },
  ];

  return (
    <div className="mt-2 rounded-2xl overflow-hidden"
      style={{ ...body, boxShadow: isDark ? "0 4px 24px rgba(220,38,38,0.25)" : "0 4px 20px rgba(220,38,38,0.12)" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}
        className="px-3 py-2.5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          <ShieldAlert size={14} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-[11px] leading-tight">Multiple Dose Alert</p>
          <p className="text-red-200 text-[9px] leading-tight">Potential overdose — read carefully</p>
        </div>
        {medicine?.name && (
          <span style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
            className="text-[9px] text-white font-bold px-2 py-0.5 rounded-full shrink-0 truncate max-w-[80px]">
            {medicine.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-2">

        {/* Safe dosage */}
        {medicine?.dosage && (
          <div style={{ ...green, borderRadius: "10px" }} className="px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle size={10} className="text-green-500 shrink-0" />
              <p style={{ color: isDark ? "#4ade80" : "#15803d" }}
                className="text-[9px] font-bold uppercase tracking-wide">Recommended Safe Dosage</p>
            </div>
            <p style={{ color: isDark ? "#bbf7d0" : "#14532d" }} className="text-[10px] font-medium">
              {medicine.dosage}
            </p>
          </div>
        )}

        {/* Overdose risks */}
        {medicine?.sideEffects?.length > 0 && (
          <div style={{ ...orange, borderRadius: "10px" }} className="px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <AlertTriangle size={10} className="text-orange-500 shrink-0" />
              <p style={{ color: isDark ? "#fb923c" : "#c2410c" }}
                className="text-[9px] font-bold uppercase tracking-wide">Possible Overdose Effects</p>
            </div>
            <p style={{ color: isDark ? "#fed7aa" : "#7c2d12" }} className="text-[10px] leading-relaxed">
              {(Array.isArray(medicine.sideEffects) ? medicine.sideEffects : [medicine.sideEffects]).slice(0, 4).join(" · ")}
            </p>
          </div>
        )}

        {/* Immediate steps */}
        <div style={{ ...red, borderRadius: "10px" }} className="px-2.5 py-2">
          <p style={{ color: isDark ? "#f87171" : "#b91c1c" }}
            className="text-[9px] font-bold uppercase tracking-wide mb-1.5">Immediate Steps</p>
          {[
            "Stop taking any more doses immediately",
            "Drink a full glass of water and stay calm",
            "Do NOT induce vomiting unless told by a doctor",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 mb-1 last:mb-0">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p style={{ color: isDark ? "#fca5a5" : "#991b1b" }} className="text-[10px] leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* Consult a professional */}
        <div style={{
          background: isDark ? "#111827" : "#f8fafc",
          border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
          borderRadius: "10px"
        }} className="px-2.5 py-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Info size={10} style={{ color: isDark ? "#94a3b8" : "#64748b" }} />
            <p style={{ color: isDark ? "#94a3b8" : "#64748b" }}
              className="text-[9px] font-bold uppercase tracking-wide">Consult a Medical Professional</p>
          </div>
          <p style={{ color: isDark ? "#cbd5e1" : "#475569" }} className="text-[10px] leading-relaxed mb-2">
            Contact one of the following with your medicine packaging:
          </p>
          <div className="flex flex-col gap-1.5">
            {consultOptions.map((opt, i) => (
              <div key={i}
                style={{ background: opt.bg, border: `1px solid ${opt.border}`, borderRadius: "8px" }}
                className="flex items-center gap-2 px-2.5 py-2">
                <span style={{ color: opt.color }} className="shrink-0">{opt.icon}</span>
                <p style={{ color: opt.color }} className="text-[10px] font-semibold">{opt.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Medicine Info Card ────────────────────────────────────────────────────────
const MedicineCard = ({ medicine, onSearch }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 flex items-center gap-2">
        <Pill size={14} className="text-white shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs truncate">{medicine.name}</p>
          {medicine.brand && <p className="text-blue-100 text-[10px] truncate">{medicine.brand}</p>}
        </div>
        {medicine.requiresPrescription && (
          <span className="shrink-0 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">Rx</span>
        )}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {medicine.generic && (
          <div className="flex items-start gap-1.5">
            <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-600"><span className="font-medium text-gray-700">Generic: </span>{medicine.generic}</p>
          </div>
        )}
        {medicine.category && (
          <div className="flex items-start gap-1.5">
            <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-600"><span className="font-medium text-gray-700">Category: </span>{medicine.category}</p>
          </div>
        )}
        {medicine.dosage && (
          <div className="flex items-start gap-1.5">
            <CheckCircle size={11} className="text-green-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-600"><span className="font-medium text-gray-700">Dosage: </span>{medicine.dosage}</p>
          </div>
        )}
        {medicine.aiExplanation && (
          <div className="bg-blue-50 rounded-lg px-2 py-1.5 mt-1">
            <p className="text-[10px] text-blue-800 leading-relaxed">{medicine.aiExplanation}</p>
          </div>
        )}
        {medicine.sideEffects?.length > 0 && (
          <>
            <button onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-blue-600 font-medium hover:underline w-full text-left mt-1">
              {expanded ? <><ChevronUp size={12} className="inline" /> Hide details</> : <><ChevronDown size={12} className="inline" /> Show side effects & warnings</>}
            </button>
            {expanded && (
              <div className="flex items-start gap-1.5 pt-1">
                <AlertTriangle size={11} className="text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-gray-700">Side Effects:</p>
                  <p className="text-[10px] text-gray-600">
                    {Array.isArray(medicine.sideEffects) ? medicine.sideEffects.join(", ") : medicine.sideEffects}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="px-3 pb-2">
        <button onClick={() => onSearch(medicine.name)}
          className="w-full text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1">
          <ArrowRight size={11} /> View Full Details
        </button>
      </div>
    </div>
  );
};

const MediBot = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm MediBot. Ask me anything about medicine safety, self-medication risks, or how to use Medico Guidance. [GO:/awareness|Learn about Self-Medication]"
  }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];
  if (AUTH_PAGES.includes(location.pathname)) return null;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { data } = await API.post("/ai/medibot", {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't get a response. Please try again.",
        medicineFound: data.medicineFound || null,
        overdoseAlert: data.overdoseAlert || false,
      }]);
    } catch (err) {
      console.error("MediBot error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setMessages([{
    role: "assistant",
    content: "Hi! I'm MediBot. Ask me anything about medicine safety, self-medication risks, or how to use Medico Guidance. [GO:/awareness|Learn about Self-Medication]"
  }]);

  const handleMedicineSearch = (name) => { navigate(`/search?q=${encodeURIComponent(name)}`); setOpen(false); };

  const MessageBubble = ({ msg }) => {
    const isUser = msg.role === "user";
    const parts  = parseMessage(msg.content);
    return (
      <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {isUser
          ? <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 mt-0.5"><User size={14} className="text-white" /></div>
          : <div className="mt-0.5"><RobotAvatar size="sm" /></div>
        }
        <div className="max-w-[80%] flex flex-col gap-1">
          <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
            {parts.map((p, i) =>
              p.type === "text" ? <span key={i}>{p.content}</span> : (
                <button key={i} onClick={() => { navigate(p.path); setOpen(false); }}
                  className="mt-2 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition w-fit">
                  <ArrowRight size={11} /> {p.label}
                </button>
              )
            )}
          </div>
          {!isUser && msg.overdoseAlert && <OverdoseAlertCard medicine={msg.medicineFound} />}
          {!isUser && msg.medicineFound && !msg.overdoseAlert && (
            <MedicineCard medicine={msg.medicineFound} onSearch={handleMedicineSearch} />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .medibot-scroll::-webkit-scrollbar { width: 4px; }
        .medibot-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .medibot-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] flex flex-col items-end gap-2">

        {!open && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2 text-[10px] md:text-xs font-medium text-gray-600 mr-1 mb-1 animate-bounce flex items-center gap-1"
            style={{ animationDuration: "3s" }}>
            <Heart size={12} className="text-blue-600" /> Need help?
          </div>
        )}

        {open && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[300px] md:w-[320px] mb-2 flex flex-col"
            style={{ animation: "slideUp 0.2s ease-out", maxHeight: "calc(100vh - 140px)" }}>

            {/* Header */}
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">MediBot</p>
                  <p className="text-[10px] text-green-400">● Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} title="Reset chat" className="text-gray-400 hover:text-white transition">
                  <RotateCcw size={14} />
                </button>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 medibot-scroll">
              {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
              {loading && (
                <div className="flex gap-2">
                  <RobotAvatar size="sm" />
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
              {quickSuggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.msg)}
                  className="shrink-0 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 transition">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about any medicine..."
                  className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition shrink-0">
                  {loading ? <Loader size={12} className="text-white animate-spin" /> : <Send size={12} className="text-white" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center py-2 px-4 shrink-0 border-t border-gray-50">
              Not a medical diagnosis. Always consult a doctor.
            </p>
          </div>
        )}

        {/* Toggle Button */}
        <button onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
          style={{ background: open ? "#000000" : "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
          <Bot size={26} className="text-white" />
          {!open && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white">
              <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
            </span>
          )}
        </button>

      </div>
    </>
  );
};

export default MediBot;
