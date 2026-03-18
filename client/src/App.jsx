import { Routes, Route } from "react-router-dom";
import './App.css'; // uppercase 'A'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MediBot from "./components/MediBot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import { MenuProvider } from "./context/MenuContext";
import SelfMedicationAwareness from "./pages/SelfMedicationAwareness";
import Compare from "./pages/Compare";
import SearchAnalytics from "./pages/admin/SearchAnalytics";

// Public Pages
import Home from "./pages/Home";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Protected Medical Tools & User Pages
import SmartSearch from "./pages/SmartSearch";
import MedicineDetail from "./pages/MedicineDetail";
import InteractionChecker from "./pages/InteractionChecker";
import OcrScanner from "./pages/OcrScanner";
import SymptomChecker from "./pages/SymptomChecker";
import PrescriptionScanner from "./pages/PrescriptionScanner";
// import EmergencyContacts from "./pages/EmergencyContacts";
// import FindPharmacy from "./pages/FindPharmacy";
import ReportFakeMedicine from "./pages/ReportFakeMedicine";
import HealthBlog from "./pages/HealthBlog";
import HealthCalculator from "./pages/HealthCalculator";
// import FirstAidGuide from "./pages/FirstAidGuide";
import Profile from "./pages/user/Profile";
import SavedMedicines from "./pages/user/SavedMedicines";
import SearchHistory from "./pages/user/SearchHistory";
import Reminders from "./pages/user/Reminders";


// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMedicines from "./pages/admin/Medicines";
import AddMedicine from "./pages/admin/AddMedicine";
import OcrHistory from "./pages/admin/OcrHistory";

function App() {
  return (
    <MenuProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Only the Landing Page is visible to everyone */}
          <Route path="/" element={<Home />} />

          {/* --- AUTH ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* --- PROTECTED ROUTES (Registration Required) --- */}
          
          {/* Search Features (Now Protected) */}
          <Route path="/search" element={<ProtectedRoute><SmartSearch /></ProtectedRoute>} />
          <Route path="/medicine/:id" element={<ProtectedRoute><MedicineDetail /></ProtectedRoute>} />

          {/* Medical Tools */}
          <Route path="/interactions" element={<ProtectedRoute><InteractionChecker /></ProtectedRoute>} />
          <Route path="/ocr" element={<ProtectedRoute><OcrScanner /></ProtectedRoute>} />
          <Route path="/symptoms" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><PrescriptionScanner /></ProtectedRoute>} />
          {/* <Route path="/emergency" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} /> */}
          {/* <Route path="/find-pharmacy" element={<ProtectedRoute><FindPharmacy /></ProtectedRoute>} /> */}
          <Route path="/report-fake" element={<ProtectedRoute><ReportFakeMedicine /></ProtectedRoute>} />
          <Route path="/health-blog" element={<ProtectedRoute><HealthBlog /></ProtectedRoute>} />
          <Route path="/health-calculator" element={<ProtectedRoute><HealthCalculator /></ProtectedRoute>} />
          <Route path="/awareness" element={<SelfMedicationAwareness />} />
          <Route path="/compare" element={<Compare />} />

          {/* <Route path="/first-aid" element={<ProtectedRoute><FirstAidGuide /></ProtectedRoute>} /> */}

          {/* User Account */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedMedicines /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><SearchHistory /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/medicines" element={<AdminRoute><AdminMedicines /></AdminRoute>} />
          <Route path="/admin/add-medicine" element={<AdminRoute><AddMedicine /></AdminRoute>} />
          <Route path="/admin/ocr-history" element={<AdminRoute><OcrHistory /></AdminRoute>} />
          <Route path="/admin/search-analytics" element={<SearchAnalytics />} />
          {/* Fallback for 404 */}
          <Route path="*" element={<div className="flex items-center justify-center h-full py-20 font-bold text-gray-400">Page Not Found</div>} />
          </Routes>
        </main>
        <Footer />
        <MediBot />
      </div>
    </MenuProvider>
  );
}

export default App;