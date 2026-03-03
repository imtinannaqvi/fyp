import { useState } from "react";
import { DollarSign, Search, TrendingDown, Store, MapPin, Phone } from "lucide-react";

const PriceComparison = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const medicines = [
    {
      name: "Panadol 500mg",
      generic: "Paracetamol",
      prices: [
        { pharmacy: "Fazal Din Pharmacy", location: "Lahore", price: 45, phone: "042-35714567" },
        { pharmacy: "Shifaa Pharmacy", location: "Islamabad", price: 48, phone: "051-2651234" },
        { pharmacy: "Medix Pharmacy", location: "Karachi", price: 42, phone: "021-34531234" }
      ]
    },
    {
      name: "Brufen 400mg",
      generic: "Ibuprofen",
      prices: [
        { pharmacy: "Fazal Din Pharmacy", location: "Lahore", price: 85, phone: "042-35714567" },
        { pharmacy: "Health Plus Pharmacy", location: "Rawalpindi", price: 82, phone: "051-5551234" },
        { pharmacy: "City Pharmacy", location: "Karachi", price: 88, phone: "021-35871234" }
      ]
    },
    {
      name: "Augmentin 625mg",
      generic: "Amoxicillin + Clavulanic Acid",
      prices: [
        { pharmacy: "Metro Pharmacy", location: "Islamabad", price: 320, phone: "051-2871234" },
        { pharmacy: "Sehat Pharmacy", location: "Lahore", price: 315, phone: "042-36661234" },
        { pharmacy: "Care Pharmacy", location: "Peshawar", price: 325, phone: "091-5841234" }
      ]
    },
    {
      name: "Disprin 300mg",
      generic: "Aspirin",
      prices: [
        { pharmacy: "Fazal Din Pharmacy", location: "Lahore", price: 35, phone: "042-35714567" },
        { pharmacy: "Medix Pharmacy", location: "Karachi", price: 38, phone: "021-34531234" },
        { pharmacy: "Shifaa Pharmacy", location: "Islamabad", price: 36, phone: "051-2651234" }
      ]
    }
  ];

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.generic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLowestPrice = (prices) => Math.min(...prices.map(p => p.price));
  const getSavings = (prices) => Math.max(...prices.map(p => p.price)) - Math.min(...prices.map(p => p.price));

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Medicine Price Comparison</h1>
          </div>
          <p className="text-gray-600">Compare prices across pharmacies and save money on medicines</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicine name or generic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Medicine Cards */}
        <div className="space-y-6">
          {filteredMedicines.map((medicine, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{medicine.name}</h3>
                    <p className="text-sm text-gray-600">Generic: {medicine.generic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Lowest Price</p>
                    <p className="text-2xl font-bold text-green-600">Rs. {getLowestPrice(medicine.prices)}</p>
                    {getSavings(medicine.prices) > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-700 mt-1">
                        <TrendingDown size={14} />
                        <span>Save up to Rs. {getSavings(medicine.prices)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {medicine.prices.sort((a, b) => a.price - b.price).map((priceInfo, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        priceInfo.price === getLowestPrice(medicine.prices)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {priceInfo.price === getLowestPrice(medicine.prices) && (
                        <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-lg font-bold mb-2">
                          BEST PRICE
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Store size={16} className="text-blue-600" />
                        <h4 className="font-bold text-gray-900 text-sm">{priceInfo.pharmacy}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-gray-400" />
                        <p className="text-xs text-gray-600">{priceInfo.location}</p>
                      </div>
                      
                      <p className="text-2xl font-bold text-gray-900 mb-3">Rs. {priceInfo.price}</p>
                      
                      <button
                        onClick={() => handleCall(priceInfo.phone)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Phone size={14} /> Call Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Medicines Found</h3>
            <p className="text-gray-600">Try searching for a different medicine</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800 text-center">
            <strong>Note:</strong> Prices are approximate and may vary. Always verify with the pharmacy before purchasing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceComparison;
