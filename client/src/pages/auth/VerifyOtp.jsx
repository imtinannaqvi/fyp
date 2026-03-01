import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { ShieldCheck, Loader, RefreshCw } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email, otp });
      toast.success("Identity verified! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await API.post("/auth/resend-otp", { email });
      toast.success("A new code has been sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-white/50 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed px-4">
          We've sent a 6-digit verification code to <br />
          <span className="font-bold text-gray-800">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enter Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              required
              maxLength={6}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            {resending ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            Resend New Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;