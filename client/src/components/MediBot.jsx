import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Heart, Activity, ArrowRight, Search, Stethoscope, Zap, Camera, ClipboardList } from "lucide-react";

const MediBot = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const suggestions = [
    { label: "Search a medicine", link: "/search", icon: <Search size={16} /> },
    { label: "Check my symptoms", link: "/symptoms", icon: <Stethoscope size={16} /> },
    { label: "Check drug interactions", link: "/interactions", icon: <Zap size={16} /> },
    { label: "Scan a medicine image", link: "/ocr", icon: <Camera size={16} /> },
    { label: "Scan my prescription", link: "/prescription", icon: <ClipboardList size={16} /> },
  ];

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
        {!open && (
          <div 
            className="bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2 text-[10px] md:text-xs font-medium text-gray-600 mr-1 mb-1 animate-bounce flex items-center gap-1"
            style={{ animationDuration: "3s" }}
          >
            <Heart size={12} className="text-blue-600" /> Need help?
          </div>
        )}
        
        {open && (
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[280px] md:w-64 overflow-hidden mb-2"
            style={{ animation: "slideUp 0.2s ease-out" }}
          >
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Activity size={18} />
                <p className="font-semibold text-sm">MediBot</p>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-gray-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-3 space-y-1.5">
              {suggestions.map((s, i) => (
                <button 
                  key={s.link} 
                  onClick={() => { navigate(s.link); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-blue-50 transition text-left group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-blue-600">{s.icon}</span>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {s.label}
                  </span>
                  <ArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
            
            <p className="text-[10px] text-gray-400 text-center pb-3 px-4">
              AI guidance is not a medical diagnosis.
            </p>
          </div>
        )}
        
        <button 
          onClick={() => setOpen(!open)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-900 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 relative"
        >
          {open ? (
            <X size={20} className="text-white" />
          ) : (
            <>
              <Activity size={24} className="text-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white">
                <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default MediBot;
