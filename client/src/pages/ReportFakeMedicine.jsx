import { useState } from "react";
import { AlertTriangle, Upload, CheckCircle, Camera, FileText, MapPin, Loader, ShieldAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import MediBot from "../components/MediBot";

const ReportFakeMedicine = () => {
  const [formData, setFormData] = useState({
    medicineName: "", batchNumber: "", manufacturer: "",
    purchaseLocation: "", city: "", suspicionReason: "",
    reporterName: "", reporterPhone: "", reporterEmail: ""
  });
  const [images, setImages]     = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId]   = useState("");
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) { toast.error("Maximum 3 images allowed"); return; }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.purchaseLocation || !formData.city || !formData.suspicionReason || !formData.reporterPhone) {
      toast.error("Please fill all required fields"); return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/fake-report/submit", formData);
      setReportId(data.reportId);
      setSubmitted(true);
      toast.success("Report submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Report Submitted!</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-2 text-sm">Your report ID:</p>
          <p className="text-2xl font-black text-blue-600 mb-6">{reportId}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
            Authorities will investigate and contact you if needed. Thank you for helping protect Pakistan's healthcare.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ medicineName:"",batchNumber:"",manufacturer:"",purchaseLocation:"",city:"",suspicionReason:"",reporterName:"",reporterPhone:"",reporterEmail:"" }); setImages([]); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2";
  const sectionClass = "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 mb-5";

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Report Fake Medicine</h1>
              <p className="text-blue-200 text-sm">Help protect others by reporting suspicious medicines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-6 flex gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Why Report Fake Medicines?</h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Counterfeit medicines can be dangerous or ineffective. Your report helps DRAP take action and protect public health in Pakistan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Medicine Information */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
              Medicine Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Medicine Name <span className="text-red-500">*</span></label>
                <input type="text" name="medicineName" required value={formData.medicineName}
                  onChange={handleChange} placeholder="e.g., Panadol, Brufen" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Batch Number</label>
                  <input type="text" name="batchNumber" value={formData.batchNumber}
                    onChange={handleChange} placeholder="If visible on packaging" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Manufacturer</label>
                  <input type="text" name="manufacturer" value={formData.manufacturer}
                    onChange={handleChange} placeholder="Company name on packaging" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Reason for Suspicion <span className="text-red-500">*</span></label>
                <textarea name="suspicionReason" required value={formData.suspicionReason}
                  onChange={handleChange} rows={4} className={`${inputClass} resize-none`}
                  placeholder="Describe why you suspect this medicine is fake (e.g., unusual packaging, no effect, different color, spelling errors)" />
              </div>
            </div>
          </div>

          {/* Purchase Location */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-blue-600" />
              </div>
              Purchase Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Pharmacy/Store Name & Address <span className="text-red-500">*</span></label>
                <input type="text" name="purchaseLocation" required value={formData.purchaseLocation}
                  onChange={handleChange} placeholder="Where did you purchase this medicine?" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City <span className="text-red-500">*</span></label>
                <select name="city" required value={formData.city} onChange={handleChange}
                  className={`${inputClass} bg-white dark:bg-slate-700`}>
                  <option value="">Select City</option>
                  {["Lahore","Karachi","Islamabad","Rawalpindi","Peshawar","Multan","Faisalabad","Quetta","Sialkot","Gujranwala","Other"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload Images */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <Camera size={16} className="text-blue-600" />
              </div>
              Upload Images <span className="text-xs font-normal text-gray-400 ml-1">(Optional, max 3)</span>
            </h2>

            <div className="border-2 border-dashed border-blue-200 dark:border-slate-600 rounded-xl p-6 text-center hover:border-blue-400 transition">
              <Upload size={28} className="text-blue-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">Upload photos of the medicine, packaging or receipt</p>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl cursor-pointer transition text-sm">
                Choose Images
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(img)} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 dark:border-slate-600" />
                    <button type="button" onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition shadow">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reporter Information */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Your Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                <input type="text" name="reporterName" value={formData.reporterName}
                  onChange={handleChange} placeholder="Your name" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="reporterPhone" required value={formData.reporterPhone}
                    onChange={handleChange} placeholder="03XX-XXXXXXX" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                  <input type="email" name="reporterEmail" value={formData.reporterEmail}
                    onChange={handleChange} placeholder="your@email.com" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition flex items-center justify-center gap-2">
            {loading
              ? <><Loader size={20} className="animate-spin" /> Submitting Report...</>
              : <><AlertTriangle size={20} /> Submit Report</>}
          </button>
          <p className="text-xs text-gray-400 dark:text-slate-600 text-center">
            Your information will be kept confidential and used only for investigation purposes.
          </p>
        </form>
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default ReportFakeMedicine;