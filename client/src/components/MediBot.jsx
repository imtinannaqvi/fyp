import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  X, Heart, ArrowRight,
  Send, Loader, User, RotateCcw
} from "lucide-react";

const ROBOT_IMG = "https://cdn-icons-png.flaticon.com/512/4711/4711987.png";

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
  return (
    <div className={`${dim} rounded-xl bg-gray-900 flex items-center justify-center shrink-0 overflow-hidden`}>
      <img
        src={ROBOT_IMG}
        alt="MediBot"
        className="w-full h-full object-cover p-0.5"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.parentNode.innerHTML = '<span style="font-size:16px">🤖</span>';
        }}
      />
    </div>
  );
};

const MediBot = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 I'm MediBot. Ask me anything about medicine safety, self-medication risks, or how to use Medico Guidance. [GO:/awareness|Learn about Self-Medication]" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

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
      const reply = data.reply || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("MediBot error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: "assistant", content: "Hi! 👋 I'm MediBot. Ask me anything about medicine safety, self-medication risks, or how to use Medico Guidance. [GO:/awareness|Learn about Self-Medication]" }]);
  };

  const MessageBubble = ({ msg }) => {
    const isUser = msg.role === "user";
    const parts  = parseMessage(msg.content);
    return (
      <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {isUser ? (
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <User size={14} className="text-white" />
          </div>
        ) : (
          <div className="mt-0.5"><RobotAvatar size="sm" /></div>
        )}
        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"
        }`}>
          {parts.map((p, i) =>
            p.type === "text" ? (
              <span key={i}>{p.content}</span>
            ) : (
              <button key={i} onClick={() => { navigate(p.path); setOpen(false); }}
                className="mt-2 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition w-fit">
                <ArrowRight size={11} /> {p.label}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .medibot-scroll::-webkit-scrollbar { width: 4px; }
        .medibot-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .medibot-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">

        {!open && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2 text-[10px] md:text-xs font-medium text-gray-600 mr-1 mb-1 animate-bounce flex items-center gap-1"
            style={{ animationDuration: "3s" }}>
            <Heart size={12} className="text-blue-600" /> Need help?
          </div>
        )}

        {open && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[300px] md:w-[320px] mb-2 flex flex-col"
            style={{ animation: "slideUp 0.2s ease-out", maxHeight: "calc(100vh - 140px)" }}>

            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                  <img src={ROBOT_IMG} alt="MediBot" className="w-8 h-8 object-contain"
                    onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-size:20px">🤖</span>'; }}
                  />
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

            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
              {quickSuggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.msg)}
                  className="shrink-0 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                  {s.label}
                </button>
              ))}
            </div>

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

        {/* ── Toggle button: ALWAYS shows robot, never X ── */}
        <button onClick={() => setOpen(!open)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-900 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 relative overflow-hidden">
          <img
            src={ROBOT_IMG}
            alt="MediBot"
            className="w-8 h-8 md:w-9 md:h-9 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.innerHTML += '<span style="font-size:22px">🤖</span>';
            }}
          />
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