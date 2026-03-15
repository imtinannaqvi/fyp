import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader, Eye, EyeOff } from "lucide-react";

const Register = () => {

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:""
  });

  const [showPass,setShowPass] = useState(false);
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();

    if(form.password.length < 6){
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try{

      await API.post("/auth/register",form);

      toast.success("Account created!");

      navigate("/verify-otp",{state:{email:form.email}});

    }catch(err){
      toast.error(err.response?.data?.message || "Registration failed");
    }finally{
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-blue-100">

        <div className="text-center mb-8">

          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">MG</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Join MedicoGuidance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Full Name
            </label>

            <div className="relative mt-1">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>

            <div className="relative mt-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>

            <div className="relative mt-1">

              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>

              <input
                type={showPass ? "text":"password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={()=>setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18}/>
                Creating...
              </>
            ) : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Register;