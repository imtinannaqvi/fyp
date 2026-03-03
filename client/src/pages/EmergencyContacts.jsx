import { useState } from "react";
import { Phone, MapPin, Clock, AlertTriangle, Hospital, Ambulance, Shield, Search, Heart } from "lucide-react";

const EmergencyContacts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const emergencyServices = [
    {
      name: "Emergency Ambulance",
      number: "1122",
      description: "24/7 Emergency Medical Services",
      icon: <Ambulance size={32} />,
      color: "blue",
      available: "24/7"
    },
    {
      name: "Rescue 1122",
      number: "1122",
      description: "Fire, Rescue & Emergency Services",
      icon: <Shield size={32} />,
      color: "blue",
      available: "24/7"
    },
    {
      name: "Poison Control Center",
      number: "1222",
      description: "National Poison Control Helpline",
      icon: <AlertTriangle size={32} />,
      color: "blue",
      available: "24/7"
    },
    {
      name: "Edhi Ambulance",
      number: "115",
      description: "Free Ambulance Service",
      icon: <Heart size={32} />,
      color: "blue",
      available: "24/7"
    }
  ];

  const hospitals = [
    {
      name: "Jinnah Hospital Lahore",
      phone: "042-99231441",
      emergency: "042-99231171",
      address: "Allama Shabbir Ahmad Usmani Road, Lahore",
      type: "Government",
      available: "24/7"
    },
    {
      name: "Services Hospital Lahore",
      phone: "042-99210085",
      emergency: "042-99211480",
      address: "Jail Road, Lahore",
      type: "Government",
      available: "24/7"
    },
    {
      name: "Shaukat Khanum Hospital",
      phone: "042-35905000",
      emergency: "042-35905000",
      address: "7-A Block R-3, Johar Town, Lahore",
      type: "Private",
      available: "24/7"
    },
    {
      name: "Aga Khan University Hospital",
      phone: "021-34864001",
      emergency: "021-34930051",
      address: "Stadium Road, Karachi",
      type: "Private",
      available: "24/7"
    },
    {
      name: "PIMS Hospital Islamabad",
      phone: "051-9261170",
      emergency: "051-9260500",
      address: "G-8/3, Islamabad",
      type: "Government",
      available: "24/7"
    },
    {
      name: "Lady Reading Hospital",
      phone: "091-9211430",
      emergency: "091-9211430",
      address: "Khyber Road, Peshawar",
      type: "Government",
      available: "24/7"
    }
  ];

  const consultationHotlines = [
    {
      name: "Sehat Kahani Telemedicine",
      number: "0800-SEHAT (73428)",
      description: "Free online doctor consultation",
      hours: "9 AM - 9 PM"
    },
    {
      name: "Marham Helpline",
      number: "042-32500989",
      description: "Doctor appointment & consultation",
      hours: "9 AM - 6 PM"
    },
    {
      name: "Shifa4U Helpline",
      number: "051-8463463",
      description: "Medical consultation & appointments",
      hours: "24/7"
    },
    {
      name: "Mental Health Helpline",
      number: "0800-00-HELP (4357)",
      description: "Free mental health support",
      hours: "24/7"
    }
  ];

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Phone size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
          </div>
          <p className="text-gray-600">Quick access to critical healthcare services in Pakistan</p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 text-lg">In Case of Emergency</h3>
              <p className="text-sm text-blue-800 mb-4">
                If you or someone else is experiencing a life-threatening emergency, call <strong>1122</strong> immediately or go to the nearest hospital emergency room.
              </p>
              <button
                onClick={() => handleCall("1122")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Phone size={18} /> Call 1122 Now
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-blue-600">{service.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock size={14} />
                    <span>{service.available}</span>
                  </div>
                  <button
                    onClick={() => handleCall(service.number)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Phone size={16} /> {service.number}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospitals */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Major Hospitals</h2>
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Hospital size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                        hospital.type === "Government" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {hospital.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-600" />
                    <span className="text-sm text-green-700 font-semibold">{hospital.available}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(hospital.emergency)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> Emergency
                  </button>
                  <button
                    onClick={() => handleCall(hospital.phone)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> Main
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Hotlines */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Doctor Consultation Hotlines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultationHotlines.map((hotline, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{hotline.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{hotline.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      <span>{hotline.hours}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCall(hotline.number)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md"
                >
                  <Phone size={16} /> {hotline.number}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800 text-center">
            <strong>Disclaimer:</strong> This information is provided for reference only. Always verify contact numbers before use. In life-threatening emergencies, call 1122 immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
