import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Bookmark, Loader, Trash2, ChevronRight, Pill } from "lucide-react";

const SavedMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/user/saved-medicines");
        setMedicines(data.savedMedicines || []);
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRemove = async (medicineId) => {
    try {
      await API.delete(`/user/save-medicine/${medicineId}`);
      setMedicines(prev => prev.filter(m => m.medicine?._id !== medicineId));
      toast.success("Removed");
    } catch { toast.error("Failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b px-4 py-8 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Favorites</h1>
            <p className="text-gray-500 text-sm mt-1">{medicines.length} saved items</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Bookmark size={24} fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {medicines.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill size={40} className="text-gray-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">No Favorites Yet</h2>
            <p className="text-gray-400 text-sm mt-2 mb-8">Your saved medicines will appear here.</p>
            <button onClick={() => navigate("/search")} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Start Searching</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((item, i) => {
              const med = item.medicine;
              if (!med) return null;
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      {med.name.charAt(0)}
                    </div>
                    <button onClick={() => handleRemove(med._id)} className="text-gray-300 hover:text-red-500 transition p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{med.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-medium">{med.brand}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${med.requiresPrescription ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {med.requiresPrescription ? 'Rx Required' : 'Over Counter'}
                    </span>
                    <button onClick={() => navigate(`/search?q=${med.name}`)} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                      View <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMedicines;