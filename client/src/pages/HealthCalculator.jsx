import React, { useState } from 'react';
import { Calculator, Activity, Droplets, Flame, TrendingUp, User } from 'lucide-react';

const HealthCalculator = () => {
  const [activeTab, setActiveTab] = useState('bmi');
  
  // BMI States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  
  // Calorie States
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [calorieResult, setCalorieResult] = useState(null);
  
  // Water States
  const [waterWeight, setWaterWeight] = useState('');
  const [waterActivity, setWaterActivity] = useState('low');
  const [waterResult, setWaterResult] = useState(null);
  
  // Ideal Weight States
  const [idealHeight, setIdealHeight] = useState('');
  const [idealGender, setIdealGender] = useState('male');
  const [idealResult, setIdealResult] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    const bmi = (w / (h * h)).toFixed(1);
    
    let category = '';
    let color = '';
    let advice = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-yellow-600';
      advice = 'Consider consulting a nutritionist to gain healthy weight.';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-600';
      advice = 'Great! Maintain your healthy lifestyle.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-orange-600';
      advice = 'Consider regular exercise and balanced diet.';
    } else {
      category = 'Obese';
      color = 'text-red-600';
      advice = 'Consult a healthcare professional for guidance.';
    }
    
    setBmiResult({ bmi, category, color, advice });
  };

  const calculateCalories = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    const maintain = tdee;
    const lose = Math.round(tdee - 500);
    const gain = Math.round(tdee + 500);
    
    setCalorieResult({ maintain, lose, gain });
  };

  const calculateWater = (e) => {
    e.preventDefault();
    const w = parseFloat(waterWeight);
    
    // Base: 30-35ml per kg
    let baseWater = w * 33;
    
    // Activity adjustment
    const activityAdd = {
      low: 0,
      moderate: 500,
      high: 1000
    };
    
    const totalWater = Math.round((baseWater + activityAdd[waterActivity]) / 250); // glasses
    const liters = ((baseWater + activityAdd[waterActivity]) / 1000).toFixed(1);
    
    setWaterResult({ glasses: totalWater, liters });
  };

  const calculateIdealWeight = (e) => {
    e.preventDefault();
    const h = parseFloat(idealHeight);
    
    // Devine Formula
    let ideal;
    if (idealGender === 'male') {
      ideal = 50 + 2.3 * ((h / 2.54) - 60);
    } else {
      ideal = 45.5 + 2.3 * ((h / 2.54) - 60);
    }
    
    const min = Math.round(ideal * 0.9);
    const max = Math.round(ideal * 1.1);
    ideal = Math.round(ideal);
    
    setIdealResult({ ideal, min, max });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Calculator size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Health Calculator</h1>
          </div>
          <p className="text-gray-600">Calculate BMI, calories, water intake, and ideal weight</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('bmi')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bmi' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity size={18} />
            BMI
          </button>
          <button
            onClick={() => setActiveTab('calories')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'calories' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Flame size={18} />
            Calories
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'water' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Droplets size={18} />
            Water
          </button>
          <button
            onClick={() => setActiveTab('ideal')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ideal' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            Ideal Weight
          </button>
        </div>

        {/* BMI Calculator */}
        {activeTab === 'bmi' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">BMI Calculator</h2>
              <form onSubmit={calculateBMI} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 170"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Calculate BMI
                </button>
              </form>
            </div>

            {bmiResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Results</h2>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">{bmiResult.bmi}</div>
                  <div className={`text-2xl font-semibold ${bmiResult.color} mb-4`}>{bmiResult.category}</div>
                  <p className="text-gray-600">{bmiResult.advice}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-yellow-600 font-semibold">Underweight:</span>
                    <span className="text-gray-700">&lt; 18.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600 font-semibold">Normal:</span>
                    <span className="text-gray-700">18.5 - 24.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600 font-semibold">Overweight:</span>
                    <span className="text-gray-700">25 - 29.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-semibold">Obese:</span>
                    <span className="text-gray-700">&ge; 30</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calorie Calculator */}
        {activeTab === 'calories' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Calorie Needs</h2>
              <form onSubmit={calculateCalories} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="veryActive">Very Active (2x per day)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Calculate Calories
                </button>
              </form>
            </div>

            {calorieResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Calorie Goals</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="text-sm text-blue-600 font-semibold mb-1">Maintain Weight</div>
                    <div className="text-4xl font-bold text-blue-600">{calorieResult.maintain}</div>
                    <div className="text-sm text-gray-600 mt-1">calories/day</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-sm text-green-600 font-semibold mb-1">Lose Weight</div>
                    <div className="text-4xl font-bold text-green-600">{calorieResult.lose}</div>
                    <div className="text-sm text-gray-600 mt-1">calories/day (0.5 kg/week)</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                    <div className="text-sm text-orange-600 font-semibold mb-1">Gain Weight</div>
                    <div className="text-4xl font-bold text-orange-600">{calorieResult.gain}</div>
                    <div className="text-sm text-gray-600 mt-1">calories/day (0.5 kg/week)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Water Calculator */}
        {activeTab === 'water' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Water Intake Calculator</h2>
              <form onSubmit={calculateWater} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterWeight}
                    onChange={(e) => setWaterWeight(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
                  <select
                    value={waterActivity}
                    onChange={(e) => setWaterActivity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low (minimal exercise)</option>
                    <option value="moderate">Moderate (regular exercise)</option>
                    <option value="high">High (intense exercise)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Calculate Water Intake
                </button>
              </form>
            </div>

            {waterResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Water Goal</h2>
                <div className="text-center mb-8">
                  <Droplets size={80} className="text-blue-500 mx-auto mb-4" />
                  <div className="text-6xl font-bold text-blue-600 mb-2">{waterResult.glasses}</div>
                  <div className="text-xl text-gray-700 mb-4">glasses per day</div>
                  <div className="text-lg text-gray-600">({waterResult.liters} liters)</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Tips:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Drink a glass when you wake up</li>
                    <li>• Keep water bottle with you</li>
                    <li>• Drink before meals</li>
                    <li>• Increase intake during exercise</li>
                    <li>• Monitor urine color (pale yellow is good)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ideal Weight Calculator */}
        {activeTab === 'ideal' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ideal Weight Calculator</h2>
              <form onSubmit={calculateIdealWeight} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={idealHeight}
                    onChange={(e) => setIdealHeight(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={idealGender}
                    onChange={(e) => setIdealGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Calculate Ideal Weight
                </button>
              </form>
            </div>

            {idealResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Ideal Weight</h2>
                <div className="text-center mb-8">
                  <User size={80} className="text-blue-500 mx-auto mb-4" />
                  <div className="text-6xl font-bold text-blue-600 mb-2">{idealResult.ideal}</div>
                  <div className="text-xl text-gray-700 mb-6">kg</div>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="text-sm text-gray-600 mb-2">Healthy Range</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {idealResult.min} - {idealResult.max} kg
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This calculation uses the Devine Formula. Your ideal weight may vary based on body composition, 
                    muscle mass, and overall health. Consult a healthcare professional for personalized advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HealthCalculator;
