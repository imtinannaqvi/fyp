import { useState } from "react";
import { BookOpen, Search, Calendar, User, ExternalLink } from "lucide-react";

const HealthBlog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Real health articles from credible sources (WHO, CDC, NIH, Medical Journals)
  const articles = [
    {
      id: 1,
      title: "Antimicrobial Resistance: A Global Health Threat",
      excerpt: "WHO reports that antimicrobial resistance is one of the top 10 global public health threats. Learn how misuse of antibiotics contributes to drug-resistant infections.",
      category: "Research",
      source: "World Health Organization",
      date: "2024-01-20",
      readTime: "8 min",
      url: "https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance"
    },
    {
      id: 2,
      title: "Diabetes Prevention: Evidence-Based Strategies",
      excerpt: "CDC research shows that lifestyle changes can prevent or delay type 2 diabetes in people at high risk. Diet, exercise, and weight management are key factors.",
      category: "Prevention",
      source: "Centers for Disease Control",
      date: "2024-01-18",
      readTime: "6 min",
      url: "https://www.cdc.gov/diabetes/prevention/index.html"
    },
    {
      id: 3,
      title: "Cardiovascular Disease: Leading Cause of Death Globally",
      excerpt: "WHO data reveals CVDs are the leading cause of death globally, taking 17.9 million lives annually. Most cardiovascular diseases can be prevented by addressing risk factors.",
      category: "Research",
      source: "World Health Organization",
      date: "2024-01-15",
      readTime: "7 min",
      url: "https://www.who.int/health-topics/cardiovascular-diseases"
    },
    {
      id: 4,
      title: "Mental Health: Depression and Anxiety Disorders",
      excerpt: "NIH studies show depression affects over 280 million people worldwide. Understanding symptoms and seeking early treatment can significantly improve outcomes.",
      category: "Mental Health",
      source: "National Institutes of Health",
      date: "2024-01-12",
      readTime: "9 min",
      url: "https://www.nimh.nih.gov/health/topics/depression"
    },
    {
      id: 5,
      title: "Vaccination: Protecting Communities Through Immunization",
      excerpt: "WHO confirms vaccines prevent 3.5-5 million deaths annually. Immunization is one of the most cost-effective health interventions available.",
      category: "Prevention",
      source: "World Health Organization",
      date: "2024-01-10",
      readTime: "5 min",
      url: "https://www.who.int/health-topics/vaccines-and-immunization"
    },
    {
      id: 6,
      title: "Hypertension: The Silent Killer",
      excerpt: "CDC reports 1.28 billion adults worldwide have hypertension. Most people with hypertension don't feel symptoms, making regular blood pressure checks crucial.",
      category: "Research",
      source: "Centers for Disease Control",
      date: "2024-01-08",
      readTime: "6 min",
      url: "https://www.cdc.gov/bloodpressure/index.htm"
    },
    {
      id: 7,
      title: "Cancer Prevention: Reducing Your Risk",
      excerpt: "WHO research indicates 30-50% of cancers are preventable. Avoiding tobacco, maintaining healthy weight, and regular screening are key prevention strategies.",
      category: "Prevention",
      source: "World Health Organization",
      date: "2024-01-05",
      readTime: "10 min",
      url: "https://www.who.int/health-topics/cancer"
    },
    {
      id: 8,
      title: "Nutrition: Essential for Health and Development",
      excerpt: "WHO guidelines emphasize balanced nutrition prevents malnutrition and noncommunicable diseases. Proper diet supports immune function and overall health.",
      category: "Nutrition",
      source: "World Health Organization",
      date: "2024-01-03",
      readTime: "7 min",
      url: "https://www.who.int/health-topics/nutrition"
    },
    {
      id: 9,
      title: "Physical Activity: Key to Healthy Living",
      excerpt: "WHO recommends 150-300 minutes of moderate aerobic activity weekly. Regular physical activity reduces risk of heart disease, diabetes, and several cancers.",
      category: "Prevention",
      source: "World Health Organization",
      date: "2023-12-28",
      readTime: "5 min",
      url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
    },
    {
      id: 10,
      title: "Tuberculosis: Global Health Emergency",
      excerpt: "WHO reports TB caused 1.3 million deaths in 2022. Early detection and proper treatment are essential to control this infectious disease.",
      category: "Research",
      source: "World Health Organization",
      date: "2023-12-25",
      readTime: "8 min",
      url: "https://www.who.int/health-topics/tuberculosis"
    },
    {
      id: 11,
      title: "Maternal and Child Health: Critical First 1000 Days",
      excerpt: "UNICEF research shows the first 1000 days from pregnancy to age 2 are critical for child development. Proper nutrition and healthcare during this period have lifelong impacts.",
      category: "Maternal Health",
      source: "UNICEF",
      date: "2023-12-20",
      readTime: "9 min",
      url: "https://www.unicef.org/nutrition"
    },
    {
      id: 12,
      title: "Hepatitis: Silent Epidemic Affecting Millions",
      excerpt: "WHO data shows 354 million people live with hepatitis B or C. Most are unaware of their infection, highlighting the need for testing and treatment access.",
      category: "Research",
      source: "World Health Organization",
      date: "2023-12-15",
      readTime: "7 min",
      url: "https://www.who.int/health-topics/hepatitis"
    }
  ];

  const categories = ["all", "Research", "Prevention", "Mental Health", "Nutrition", "Maternal Health"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Health Blog</h1>
          </div>
          <p className="text-gray-600">Expert articles on medicine safety, health tips, and disease prevention</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden group flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-lg font-semibold">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">{article.readTime}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span className="font-semibold">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                  >
                    Read Full Article <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2 text-center">About These Articles</h3>
          <p className="text-xs text-blue-800 text-center leading-relaxed">
            All articles are sourced from credible international health organizations including WHO, CDC, NIH, and UNICEF. 
            Click "Read Full Article" to access the original source. Information is for educational purposes only. 
            Always consult qualified healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthBlog;
