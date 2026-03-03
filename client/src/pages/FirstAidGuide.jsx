import { useState } from "react";
import { Heart, Search, AlertCircle, Phone, ChevronDown, ChevronUp, Activity, Wind, Droplet, Flame, Skull, Bone, Brain, Thermometer } from "lucide-react";

const FirstAidGuide = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const guides = [
    {
      id: 1,
      title: "Heart Attack",
      icon: Heart,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      severity: "Critical",
      symptoms: ["Chest pain or pressure", "Shortness of breath", "Pain radiating to arm, neck, or jaw", "Cold sweat and nausea", "Lightheadedness"],
      steps: [
        "Call emergency services (1122) immediately - every second counts",
        "Help the person sit down in a comfortable position and keep them calm",
        "Loosen any tight clothing around neck and chest",
        "If person has prescribed nitroglycerin, help them take it",
        "If person has aspirin and is not allergic, give 300mg to chew slowly",
        "Monitor breathing and pulse - be prepared to perform CPR if trained",
        "Do NOT leave the person alone until help arrives"
      ]
    },
    {
      id: 2,
      title: "Choking",
      icon: Wind,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      severity: "Critical",
      symptoms: ["Unable to breathe, speak, or cough effectively", "Clutching throat with hands", "Blue or pale skin color", "Loss of consciousness"],
      steps: [
        "Ask 'Are you choking?' - if they cannot speak, act immediately",
        "Call for someone to dial 1122 while you help",
        "Stand behind the person and wrap your arms around their waist",
        "Make a fist with one hand, place it above the navel",
        "Grasp fist with other hand and give 5 quick upward thrusts",
        "Continue cycles of 5 thrusts until object is expelled",
        "If person becomes unconscious, lower to ground and begin CPR"
      ]
    },
    {
      id: 3,
      title: "Severe Bleeding",
      icon: Droplet,
      iconColor: "text-red-700",
      bgColor: "bg-red-50",
      severity: "High",
      symptoms: ["Blood spurting or flowing continuously", "Wound not clotting", "Blood soaking through bandages", "Signs of shock (pale, weak, rapid pulse)"],
      steps: [
        "Call 1122 immediately for severe or uncontrolled bleeding",
        "Wear protective gloves if available to prevent infection",
        "Apply firm, direct pressure with clean cloth or gauze",
        "Maintain continuous pressure for at least 10-15 minutes",
        "If blood soaks through, add more cloth on top - do not remove original",
        "Elevate injured area above heart level if possible and no fracture suspected",
        "Apply pressure to arterial pressure points if direct pressure fails",
        "Keep person warm and lying down to prevent shock"
      ]
    },
    {
      id: 4,
      title: "Burns",
      icon: Flame,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      severity: "Medium",
      symptoms: ["First degree: Red, painful skin", "Second degree: Blisters and severe pain", "Third degree: White, charred, or leathery skin", "Swelling and possible shock"],
      steps: [
        "Remove person from heat source immediately and ensure safety",
        "Cool the burn with cool (not ice cold) running water for 10-20 minutes",
        "Remove jewelry, watches, and tight clothing before swelling begins",
        "Cover burn with sterile, non-stick dressing or clean cloth",
        "Do NOT apply ice, butter, oil, ointments, or break blisters",
        "Give over-the-counter pain reliever if needed (paracetamol or ibuprofen)",
        "Seek immediate medical attention for large burns, face/hand burns, or third-degree burns"
      ]
    },
    {
      id: 5,
      title: "Poisoning",
      icon: Skull,
      iconColor: "text-purple-700",
      bgColor: "bg-purple-50",
      severity: "Critical",
      symptoms: ["Nausea and vomiting", "Difficulty breathing or chest pain", "Confusion or altered consciousness", "Burns or redness around mouth", "Unusual odor on breath"],
      steps: [
        "Call Poison Control Center (1222) or emergency services (1122) immediately",
        "Do NOT induce vomiting unless specifically instructed by medical professionals",
        "If conscious and able to swallow, rinse mouth thoroughly with water",
        "Keep the poison container or substance for identification",
        "Note the time of exposure and amount ingested if known",
        "Follow poison control instructions exactly as given",
        "Monitor breathing, pulse, and level of consciousness continuously",
        "Be prepared to perform CPR if person stops breathing"
      ]
    },
    {
      id: 6,
      title: "Fracture (Broken Bone)",
      icon: Bone,
      iconColor: "text-gray-700",
      bgColor: "bg-gray-50",
      severity: "High",
      symptoms: ["Severe pain at injury site", "Visible deformity or abnormal angle", "Swelling and bruising", "Inability to move or bear weight", "Bone protruding through skin (open fracture)"],
      steps: [
        "Do NOT attempt to move or straighten the injured area",
        "Call 1122 for severe fractures, open fractures, or suspected spine injury",
        "Control any bleeding with direct pressure using clean cloth",
        "Apply ice pack wrapped in cloth to reduce swelling (20 minutes on, 20 off)",
        "Immobilize the injured area with splint if trained - include joints above and below",
        "Keep person still, warm, and comfortable while waiting for help",
        "Monitor for signs of shock (pale skin, rapid pulse, confusion)",
        "Do NOT give food or drink in case surgery is needed"
      ]
    },
    {
      id: 7,
      title: "Seizure",
      icon: Brain,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      severity: "High",
      symptoms: ["Sudden uncontrolled shaking or jerking", "Loss of consciousness", "Stiff or rigid body", "Foaming at mouth", "Loss of bladder or bowel control"],
      steps: [
        "Stay calm and note the time when seizure starts",
        "Clear the area of furniture and dangerous objects",
        "Cushion the person's head with something soft (pillow, folded jacket)",
        "Do NOT put anything in the person's mouth - they cannot swallow their tongue",
        "Do NOT try to restrain or hold the person down",
        "After shaking stops, gently turn person on their side (recovery position)",
        "Stay with person until fully conscious and oriented",
        "Call 1122 if: seizure lasts over 5 minutes, person has multiple seizures, person is injured, pregnant, or diabetic"
      ]
    },
    {
      id: 8,
      title: "Heatstroke",
      icon: Thermometer,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      severity: "Critical",
      symptoms: ["Body temperature above 40°C (104°F)", "Hot, dry skin or heavy sweating", "Confusion or altered mental state", "Rapid, strong pulse", "Headache and dizziness", "Nausea and possible unconsciousness"],
      steps: [
        "Call 1122 immediately - heatstroke is life-threatening",
        "Move person to cool, shaded, or air-conditioned area immediately",
        "Remove excess clothing and loosen tight garments",
        "Cool person rapidly using cool water spray, wet towels, or fan",
        "Apply ice packs to neck, armpits, and groin (major blood vessels)",
        "If conscious and able to swallow, give cool water to sip slowly",
        "Monitor body temperature and continue cooling until it drops below 39°C",
        "Watch for signs of shock and be prepared to perform CPR"
      ]
    }
  ];

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "Critical": return "bg-red-100 text-red-700 border-red-300";
      case "High": return "bg-orange-100 text-orange-700 border-orange-300";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">First Aid Guide</h1>
          </div>
          <p className="text-gray-600">Emergency first aid instructions for common medical situations</p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 text-lg mb-3">Emergency Contact Numbers - Pakistan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a href="tel:1122" className="flex items-center gap-3 bg-white rounded-xl p-4 hover:bg-red-100 transition-colors border border-red-200">
                  <Phone size={20} className="text-red-600" />
                  <div>
                    <div className="text-xs text-gray-600">Emergency Ambulance</div>
                    <div className="font-bold text-red-900 text-lg">1122</div>
                  </div>
                </a>
                <a href="tel:1222" className="flex items-center gap-3 bg-white rounded-xl p-4 hover:bg-red-100 transition-colors border border-red-200">
                  <Phone size={20} className="text-red-600" />
                  <div>
                    <div className="text-xs text-gray-600">Poison Control Center</div>
                    <div className="font-bold text-red-900 text-lg">1222</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emergency situation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGuides.map((guide) => {
            const IconComponent = guide.icon;
            return (
              <div key={guide.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <button
                  onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${guide.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                      <IconComponent size={28} className={guide.iconColor} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{guide.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-lg font-semibold border ${getSeverityColor(guide.severity)}`}>
                        {guide.severity} Priority
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {expandedId === guide.id ? 
                      <ChevronUp size={24} className="text-gray-400" /> : 
                      <ChevronDown size={24} className="text-gray-400" />
                    }
                  </div>
                </button>

                {expandedId === guide.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-6 mb-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-orange-600" />
                        Warning Signs & Symptoms:
                      </h4>
                      <ul className="space-y-2.5">
                        {guide.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                            <span className="text-red-600 font-bold mt-0.5">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" />
                        First Aid Steps:
                      </h4>
                      <ol className="space-y-3">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-800 pt-1 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Activity size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-amber-900 mb-2 text-center">⚠️ Important Medical Disclaimer</h3>
          <p className="text-xs text-amber-800 text-center leading-relaxed">
            This guide provides general first aid information based on international medical standards. It is NOT a substitute for professional medical training or emergency services. 
            Always call emergency services (1122) for serious medical emergencies. Consider taking certified first aid and CPR training courses from recognized organizations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstAidGuide;
