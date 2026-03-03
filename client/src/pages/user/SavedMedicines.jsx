import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Bookmark, Loader, Trash2, ChevronRight, Pill } from "lucide-react";
import MediBot from "../../components/MediBot";

const SavedMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Medicines</h1>
          <p className="text-gray-600">{medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} saved</p>
        </div>

        {medicines.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Saved Medicines</h2>
            <p className="text-gray-600 mb-6">Your saved medicines will appear here</p>
            <button 
              onClick={() => navigate("/search")} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Start Searching
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medicines.map((item, i) => {
              const med = item.medicine;
              if (!med) return null;
              return (
                <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold text-lg uppercase">
                          {/* Fixed by adding ?. to prevent the charAt error */}
                          {med.name?.charAt(0) || "M"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{med.name}</h3>
                          {med.brand && <p className="text-sm text-gray-600">{med.brand}</p>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                          med.requiresPrescription 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {med.requiresPrescription ? 'Prescription Required' : 'Over the Counter'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/search?q=${med.name}`)} 
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition flex items-center gap-1 font-medium text-sm"
                      >
                        View <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleRemove(med._id)} 
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
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