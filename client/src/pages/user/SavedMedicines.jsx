import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Bookmark, Loader, Trash2, ChevronRight, Pill, Calendar, Shield } from "lucide-react";
import MediBot from "../../components/MediBot";

const SavedMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Medicines</h1>
          <p className="text-gray-600">{medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} in your collection</p>
        </div>

        {medicines.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bookmark size={40} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Saved Medicines</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start building your medicine collection by saving items from search results</p>
            <button 
              onClick={() => navigate("/search")} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              Browse Medicines <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((item) => {
              const med = item.medicine;
              if (!med) return null;
              const isHovered = hoveredId === med._id;
              return (
                <div 
                  key={med._id} 
                  onMouseEnter={() => setHoveredId(med._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                          <Pill size={24} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{med.name}</h3>
                          {med.brand && <p className="text-sm text-gray-500">{med.brand}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-5">
                      {med.genericName && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 font-medium mt-0.5">Generic:</span>
                          <span className="text-xs text-gray-700 flex-1">{med.genericName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={med.requiresPrescription ? 'text-red-600' : 'text-green-600'} />
                        <span className={`text-xs font-semibold ${
                          med.requiresPrescription ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {med.requiresPrescription ? 'Prescription Required' : 'Over the Counter'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/search?q=${med.name}`)} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        View Details
                        <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleRemove(med._id)} 
                        className={`p-2.5 rounded-lg transition-all ${
                          isHovered 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default SavedMedicines;