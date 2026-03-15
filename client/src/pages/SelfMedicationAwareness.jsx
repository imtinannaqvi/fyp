import { useState } from "react";
import { AlertTriangle, Shield, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "78%", label: "Pakistanis self-medicate without consulting a doctor", source: "WHO Pakistan Report" },
  { value: "50%", label: "Antibiotic purchases in Pakistan require no prescription", source: "Journal of Infection Prevention" },
  { value: "3rd", label: "Pakistan ranks 3rd globally in antibiotic misuse", source: "Global Antibiotic Report" },
  { value: "40%", label: "Liver failure cases linked to Paracetamol overdose", source: "JPMA Study" },
  { value: "60%", label: "Patients share leftover medicines with family members", source: "NCBI Pakistan Survey" },
  { value: "₨2B+", label: "Annual economic burden of antibiotic resistance in Pakistan", source: "Health Ministry Report" },
];

const risks = [
  { icon: "🫀", title: "Heart & Blood Pressure", desc: "NSAIDs like Ibuprofen and Aspirin raise blood pressure and increase heart attack risk with unsupervised long-term use." },
  { icon: "🫁", title: "Kidney Damage", desc: "Regular use of Brufen and Ponstan without guidance slowly damages kidney function, leading to chronic kidney disease." },
  { icon: "🧫", title: "Liver Toxicity", desc: "Exceeding Paracetamol (Panadol) safe limits causes severe liver damage — a leading cause of liver failure in Pakistan." },
  { icon: "🦠", title: "Antibiotic Resistance", desc: "Taking Amoxicillin or Ciprofloxacin without a prescription makes bacteria resistant, making future infections untreatable." },
  { icon: "🧠", title: "Mental Health & Addiction", desc: "Misusing sleeping tablets and sedatives like Alprazolam (Xanax) leads to dependency, memory loss, and withdrawal." },
  { icon: "🫃", title: "Stomach Ulcers", desc: "Long-term unsupervised pain medicines damage the stomach lining, causing ulcers and dangerous internal bleeding." },
];

const categories = [
  { name: "Antibiotics",           emoji: "🦠", risk: "Critical",     examples: "Amoxicillin, Ciprofloxacin, Flagyl, Augmentin", desc: "Most misused class of medicine in Pakistan. Never take without a culture test and prescription. Incomplete courses create superbugs." },
  { name: "Painkillers (NSAIDs)",  emoji: "💊", risk: "High",         examples: "Brufen, Ponstan, Aspirin, Diclofenac",           desc: "Taken daily by millions for pain without supervision. Causes stomach ulcers, kidney damage, and cardiovascular issues over time." },
  { name: "Paracetamol",           emoji: "🟡", risk: "Moderate",     examples: "Panadol, Calpol, Panadol Extra",                 desc: "Considered 'safe' but overdose is the #1 cause of acute liver failure. Never exceed 4g/day. Dangerous with alcohol." },
  { name: "Sedatives & Sleeping",  emoji: "😴", risk: "Critical",     examples: "Alprazolam (Xanax), Diazepam, Clonazepam",      desc: "Highly addictive. Freely available in Pakistan despite being controlled substances. Causes severe withdrawal and brain damage." },
  { name: "Antacids & Gastric",    emoji: "🫃", risk: "Low-Moderate", examples: "Omeprazole, Gaviscon, Pepto-Bismol",             desc: "Overuse masks serious conditions like ulcers or stomach cancer. Long-term PPI use causes magnesium deficiency and bone loss." },
  { name: "Steroids",              emoji: "💉", risk: "Critical",     examples: "Prednisolone, Dexamethasone, Betnesol",          desc: "Misused for quick relief of pain and swelling. Causes diabetes, weight gain, bone loss, and immune suppression with overuse." },
];

const riskColor = {
  "Critical":     "bg-blue-100 text-blue-800",
  "High":         "bg-blue-50 text-blue-700",
  "Moderate":     "bg-gray-100 text-gray-700",
  "Low-Moderate": "bg-gray-50 text-gray-600",
};

const quizQuestions = [
  {
    q: "Is it safe to take leftover antibiotics for a new infection?",
    options: ["Yes, if symptoms are similar", "No, always consult a doctor first", "Yes, antibiotics work for all infections", "Only if it's the same antibiotic brand"],
    correct: 1,
    explanation: "Each infection requires a specific antibiotic based on the bacteria type. Using leftover antibiotics contributes to resistance and may not treat your current infection.",
  },
  {
    q: "What is the safest maximum daily dose of Paracetamol (Panadol) for an adult?",
    options: ["8 tablets (500mg each)", "6 tablets (500mg each)", "4 tablets (500mg each) — max 2g", "No limit, it's completely safe"],
    correct: 2,
    explanation: "The maximum safe adult dose is 4g per day (8 x 500mg tablets). Exceeding this causes liver damage. Never take with alcohol.",
  },
  {
    q: "What is the danger of stopping antibiotics early when you feel better?",
    options: ["You will recover faster", "Bacteria can become resistant and return stronger", "There is no danger", "You save money on medicine"],
    correct: 1,
    explanation: "Stopping antibiotics early leaves some bacteria alive. These surviving bacteria can develop resistance, making the infection harder to treat next time.",
  },
  {
    q: "A family member takes Amlodipine for blood pressure. Can you take the same medicine?",
    options: ["Yes, same medicine works for everyone", "Yes, if your symptoms are the same", "No, dosage and medicine type must be determined by a doctor", "Only if you take half the dose"],
    correct: 2,
    explanation: "Blood pressure medicines are personalized. The wrong medicine or dose can cause dangerous drops in pressure, heart rhythm problems, or organ damage.",
  },
  {
    q: "Which food should you AVOID when taking most antibiotics?",
    options: ["Rice and bread", "Dairy products like milk and yogurt", "Fruits and vegetables", "Water and juices"],
    correct: 1,
    explanation: "Dairy products bind to certain antibiotics (like Tetracycline and Ciprofloxacin) and prevent their absorption into the bloodstream, making them ineffective.",
  },
  {
    q: "How long can you safely take Ibuprofen (Brufen) without consulting a doctor?",
    options: ["As long as pain persists", "1–3 days maximum", "1 week", "There is no time limit"],
    correct: 1,
    explanation: "Ibuprofen should not be taken for more than 1–3 days without medical advice. Longer use causes stomach ulcers, kidney strain, and cardiovascular risk.",
  },
];

// ── Quiz Component ────────────────────────────────────────────────────────────
const Quiz = () => {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers]   = useState([]);
  const [finished, setFinished] = useState(false);

  const q = quizQuestions[current];

  const handleSelect = (idx) => { if (selected === null) setSelected(idx); };

  const handleNext = () => {
    const newAnswers = [...answers, { correct: selected === q.correct }];
    setAnswers(newAnswers);
    if (current + 1 < quizQuestions.length) { setCurrent(current + 1); setSelected(null); }
    else setFinished(true);
  };

  const handleRestart = () => { setCurrent(0); setSelected(null); setAnswers([]); setFinished(false); };

  const score = answers.filter(a => a.correct).length;

  const getScoreMsg = () => {
    if (score === quizQuestions.length) return { msg: "Perfect Score! 🎉 You are very well informed about medicine safety.", color: "text-blue-600" };
    if (score >= 4) return { msg: "Good Knowledge! 👍 A little more awareness will keep you fully safe.", color: "text-blue-500" };
    if (score >= 2) return { msg: "Needs Improvement ⚠️ Please read the awareness sections above carefully.", color: "text-gray-600" };
    return { msg: "High Risk ❌ You may be unknowingly harming your health. Please read this page carefully.", color: "text-gray-700" };
  };

  if (finished) {
    const { msg, color } = getScoreMsg();
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="text-6xl mb-4">{score === quizQuestions.length ? "🏆" : score >= 4 ? "👍" : score >= 2 ? "⚠️" : "❌"}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
        <p className="text-5xl font-extrabold my-4">
          <span className="text-blue-600">{score}</span>
          <span className="text-gray-300 text-2xl">/{quizQuestions.length}</span>
        </p>
        <p className={`font-semibold text-lg mb-6 ${color}`}>{msg}</p>
        <div className="space-y-2 mb-8 text-left">
          {quizQuestions.map((qq, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${answers[i]?.correct ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-200"}`}>
              {answers[i]?.correct
                ? <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                : <XCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium text-gray-800">{qq.q}</p>
                {!answers[i]?.correct && (
                  <p className="text-xs text-gray-500 mt-1">✅ Correct: <span className="font-semibold text-blue-600">{qq.options[qq.correct]}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleRestart}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition">
          <RotateCcw size={18} /> Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="h-2 bg-gray-100">
        <div className="h-2 bg-blue-600 transition-all duration-500"
          style={{ width: `${(current / quizQuestions.length) * 100}%` }} />
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Question {current + 1} of {quizQuestions.length}
          </span>
          <span className="text-sm text-gray-400">{Math.round((current / quizQuestions.length) * 100)}% complete</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-6">{q.q}</h3>
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            let style = "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
            if (selected !== null) {
              if (i === q.correct)                          style = "border-blue-500 bg-blue-50 cursor-default";
              else if (i === selected && i !== q.correct)  style = "border-gray-400 bg-gray-100 cursor-default";
              else                                          style = "border-gray-200 bg-gray-50 opacity-50 cursor-default";
            }
            return (
              <div key={i} onClick={() => handleSelect(i)}
                className={`border-2 rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${style}`}>
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                  ${selected !== null && i === q.correct ? "border-blue-500 bg-blue-500 text-white" :
                    selected !== null && i === selected && i !== q.correct ? "border-gray-400 bg-gray-400 text-white" :
                    "border-gray-300 text-gray-500"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-gray-800">{opt}</span>
              </div>
            );
          })}
        </div>
        {selected !== null && (
          <div className={`rounded-xl p-4 mb-6 flex gap-3 ${selected === q.correct ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}>
            {selected === q.correct
              ? <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              : <XCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-semibold mb-1 ${selected === q.correct ? "text-blue-700" : "text-gray-600"}`}>
                {selected === q.correct ? "Correct!" : "Incorrect!"}
              </p>
              <p className="text-sm text-gray-600">{q.explanation}</p>
            </div>
          </div>
        )}
        <button onClick={handleNext} disabled={selected === null}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition">
          {current + 1 === quizQuestions.length ? "See Results" : "Next Question →"}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SelfMedicationAwareness() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    { q: "Why is self-medication so dangerous in Pakistan?", a: "Pakistan has very easy over-the-counter access to prescription medicines, high doctor consultation costs, and deep-rooted cultural habits of sharing medicines. This combination creates one of the world's highest rates of antibiotic resistance and medicine-related organ damage." },
    { q: "Is it ever safe to take medicine without a doctor?", a: "Only for well-known mild conditions — like a standard 500mg Paracetamol for a minor headache. For anything recurring, chronic, requiring antibiotics, or involving multiple medicines — always consult a licensed doctor." },
    { q: "Can food affect how medicines work?", a: "Absolutely. Dairy blocks some antibiotics. Citrus juices interact with blood pressure and cholesterol medicines. Spicy food worsens gastric medicines. Tea and caffeine affect iron absorption. Always check food interactions before taking any medicine." },
    { q: "What are the most misused medicines in Pakistan?", a: "Panadol, Brufen, Flagyl, Amoxicillin, Augmentin, Alprazolam (Xanax), Disprin, Omeprazole, and Dexamethasone are the most frequently misused medicines without prescriptions in Pakistan." },
    { q: "What should I do instead of self-medicating?", a: "Use Medico Guidance to understand your medicine, check dosage guidelines, verify drug interactions, and read about side effects. Then consult a licensed doctor for proper diagnosis and prescription." },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <AlertTriangle size={16} /> Awareness Initiative — Medico Guidance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Self-Medication is<br />
            <span className="text-blue-200">Silently Harming Pakistan</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Over 78% of Pakistanis take medicines without a doctor's advice. It feels convenient —
            but the damage to kidneys, liver, and resistance to antibiotics is very real and often irreversible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate("/search")}
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
              🔍 Check Your Medicine Safely
            </button>
            <button onClick={() => document.getElementById("quiz").scrollIntoView({ behavior: "smooth" })}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3 rounded-xl border border-white/30 transition-all">
              🧠 Take Awareness Quiz
            </button>
          </div>
        </div>
      </div>

      {/* ── Statistics ── */}
      <div className="bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-white text-2xl font-bold mb-2">Pakistan Self-Medication Statistics</h2>
          <p className="text-center text-gray-400 text-sm mb-10">Based on WHO, JPMA, and NCBI research reports</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all">
                <p className="text-4xl font-extrabold text-blue-400 mb-2">{s.value}</p>
                <p className="text-sm text-gray-300 mb-3">{s.label}</p>
                <p className="text-xs text-gray-500 italic">{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What is Self Medication ── */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What is Self-Medication?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Self-medication means treating yourself with medicines without a doctor's diagnosis or prescription —
            including taking leftover medicines, sharing with family, or freely buying prescription drugs from a pharmacy.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: "💊", text: "Taking antibiotics for every fever or cold" },
            { emoji: "😴", text: "Using sleeping tablets without prescription" },
            { emoji: "🤝", text: "Sharing medicines with family members" },
            { emoji: "🔁", text: "Repeating old prescriptions without re-consultation" },
            { emoji: "🏪", text: "Buying prescription-only drugs from pharmacy freely" },
            { emoji: "📱", text: "Following medicine advice from social media or WhatsApp" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <span className="text-2xl">{item.emoji}</span>
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Medicine Category Risks ── */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">High-Risk Medicine Categories</h2>
            <p className="text-gray-600">Most commonly misused medicine types in Pakistan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{cat.emoji}</span>
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${riskColor[cat.risk]}`}>{cat.risk}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Examples: <span className="font-medium text-gray-600">{cat.examples}</span></p>
                <p className="text-sm text-gray-600 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Long Term Health Risks ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Long-Term Health Consequences</h2>
          <p className="text-gray-600">What years of self-medication does to your body</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risks.map((risk, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
              <span className="text-4xl mb-4 block">{risk.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{risk.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{risk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Do's and Don'ts ── */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Do's & Don'ts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Shield size={20} /> What You SHOULD Do
              </h3>
              <ul className="space-y-3">
                {[
                  "Always consult a doctor before taking any medicine",
                  "Read the medicine label and check expiry date",
                  "Check drug interactions before combining medicines",
                  "Complete the full antibiotic course as prescribed",
                  "Store medicines away from heat and moisture",
                  "Use Medico Guidance to verify medicine information",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> What You Should AVOID
              </h3>
              <ul className="space-y-3">
                {[
                  "Never take antibiotics without a doctor's prescription",
                  "Don't share your medicines with family or friends",
                  "Don't double dose if you miss a scheduled dose",
                  "Never take NSAIDs on an empty stomach",
                  "Don't stop medicines suddenly without consulting doctor",
                  "Never follow unverified social media medicine advice",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 font-bold mt-0.5">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Quiz ── */}
      <div id="quiz" className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            🧠 Interactive Quiz
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How Safe Are You With Medicines?</h2>
          <p className="text-gray-600">Test your knowledge with {quizQuestions.length} real-world medicine safety questions</p>
        </div>
        <Quiz />
      </div>

      {/* ── FAQ ── */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition">
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <span className="text-blue-600 ml-4 font-bold">{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-3">Take Control of Your Health Today</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Use Medico Guidance to search any medicine, check interactions, verify dosage, and protect yourself and your family.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate("/search")}
            className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
            🔍 Search a Medicine
          </button>
          <button onClick={() => navigate("/reminders")}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-8 py-3 rounded-xl transition-all">
            ⏰ Set Medicine Reminder
          </button>
        </div>
      </div>

    </div>
  );
}