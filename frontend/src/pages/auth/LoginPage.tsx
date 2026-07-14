import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { 
  MdVisibility, 
  MdVisibilityOff, 
  MdMailOutline,
  MdLockOutline
} from "react-icons/md";

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginUser(formData.email, formData.password);

    if (res.success) {
      if (res.softwareModules && res.softwareModules.length === 1) {
        const moduleCode = res.softwareModules[0].software_code;
        navigate(`/${moduleCode.toLowerCase().replace(/_/g, "-")}/dashboard`);
      } else {
        navigate("/modules");
      }
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-800">
      {/* Left Panel - Image with Curve */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-[#2A3477]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />

        {/* SVG Curve overlapping the image on the right edge */}
        <svg 
          className="absolute top-0 right-0 h-full w-[12vw] max-w-[180px] text-white z-10 translate-x-[1px]" 
          preserveAspectRatio="none" 
          viewBox="0 0 100 100"
        >
          <path d="M100,0 L100,100 L0,100 C35,70 35,30 0,0 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-[55%] xl:w-[50%] flex-col justify-center px-8 lg:px-20 xl:px-32 relative">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="flex items-center gap-2 mb-1 text-[#2A3477]">
              {/* Abstract simple icon replacing b.well heart */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-[#2A3477] flex items-center justify-center text-white font-bold text-xl shadow-md">
                P
              </div>
              <span className="text-4xl font-extrabold tracking-tight">Pixand Co</span>
            </div>
            <p className="text-[15px] font-semibold text-[#2A3477] tracking-wide">
              Enterprise Pharmaceutical System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Error Banner */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-[13px] font-medium text-red-600">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-3.5 pl-11 pr-4 text-[14px] text-slate-800 outline-none focus:border-[#2A3477] focus:ring-1 focus:ring-[#2A3477] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Enter password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-3.5 pl-11 pr-12 text-[14px] text-slate-800 outline-none focus:border-[#2A3477] focus:ring-1 focus:ring-[#2A3477] transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-[#2A3477] focus:ring-[#2A3477] cursor-pointer" 
                />
                <span className="text-[14px] text-slate-600 group-hover:text-slate-800 select-none">Remember me</span>
              </label>
              <a href="#" className="text-[14px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full rounded-full bg-[#2A3477] hover:bg-[#1E255A] py-3.5 text-white font-semibold text-[15px] shadow-lg shadow-indigo-900/20 hover:shadow-xl hover:shadow-indigo-900/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </button>

            {/* Sign up */}
            <div className="text-center mt-2">
              <span className="text-[14px] text-slate-600">Don't have an account? </span>
              <a href="#" className="text-[14px] text-indigo-500 font-medium hover:underline">Sign up.</a>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-center text-[12px] text-slate-500 leading-relaxed mb-6 max-w-xs mx-auto">
              By creating an account or logging in, you agree to the current Terms of Service and Privacy Policy
            </p>
            <div className="flex items-center justify-between px-2">
              <div className="text-[13px] text-slate-600 cursor-pointer hover:text-slate-800 flex items-center gap-1">
                English (ingles) <span className="text-[10px]">▼</span>
              </div>
              <div className="text-[13px] text-slate-600 cursor-pointer hover:text-slate-800 font-medium flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z M12 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2 5H10v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1h-2z"/>
                </svg>
                Get Support
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
