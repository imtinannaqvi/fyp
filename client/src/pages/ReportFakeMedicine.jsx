import { useState } from "react";
import { AlertTriangle, Upload, CheckCircle, Camera, FileText, MapPin, Loader } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";

const ReportFakeMedicine = () => {
  const [formData, setFormData] = useState({
    medicineName: "",
    batchNumber: "",
    manufacturer: "",
    purchaseLocation: "",
    city: "",
    suspicionReason: "",
    reporterName: "",
    reporterPhone: "",
    reporterEmail: ""
  });
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medicineName || !formData.purchaseLocation || !formData.city || !formData.suspicionReason || !formData.reporterPhone) {
      toast.error("Please fill all required fields");
      return;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Report Submitted Successfully!</h2>
          <p className="text-gray-600 mb-2">
            Thank you for reporting. Your report ID is:
          </p>
          <p className="text-2xl font-bold text-blue-600 mb-6">{reportId}</p>
          <p className="text-sm text-gray-600 mb-6">
            Authorities will investigate and contact you if needed. You can track your report status from your profile.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                medicineName: "",
                batchNumber: "",
                manufacturer: "",
                purchaseLocation: "",
                city: "",
                suspicionReason: "",
                reporterName: "",
                reporterPhone: "",
                reporterEmail: ""
              });
              setImages([]);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Report Fake Medicine</h1>
          </div>
          <p className="text-gray-600">Help protect others by reporting suspicious or counterfeit medicines</p>
        </div>

        {/* Alert Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2 text-lg">Why Report Fake Medicines?</h3>
              <p className="text-sm text-blue-800">
                Counterfeit medicines can be dangerous or ineffective. Your report helps authorities take action and protect public health in Pakistan.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Medicine Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-blue-600" />
              </div>
              Medicine Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicine Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="medicineName"
                  required
                  value={formData.medicineName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Panadol, Brufen"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="If available"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Suspicion <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="suspicionReason"
                  required
                  value={formData.suspicionReason}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe why you suspect this medicine is fake (e.g., unusual packaging, no effect, different color)"
                />
              </div>
            </div>
          </div>

          {/* Purchase Location */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin size={18} className="text-blue-600" />
              </div>
              Purchase Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pharmacy/Store Name & Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="purchaseLocation"
                  required
                  value={formData.purchaseLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Where did you purchase this medicine?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select City</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Images */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera size={18} className="text-blue-600" />
              </div>
              Upload Images (Optional)
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <Upload size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Upload photos of the medicine, packaging, or receipt (Max 3 images)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer transition-all"
              >
                Choose Images
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reporter Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="reporterPhone"
                    required
                    value={formData.reporterPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="reporterEmail"
                    value={formData.reporterEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-8 bg-gray-50">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <AlertTriangle size={20} />
                  Submit Report
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your information will be kept confidential and used only for investigation purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFakeMedicine;
