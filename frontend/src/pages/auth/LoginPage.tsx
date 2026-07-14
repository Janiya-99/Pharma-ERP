import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { 
  MdVisibility, 
  MdVisibilityOff, 
  MdMailOutline,
  MdLockOutline,
  MdArrowForward
} from "react-icons/md";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { LayoutDashboard, Package, Landmark, Receipt, Users, Briefcase } from "lucide-react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div 
      className="fixed inset-0 flex w-full h-screen bg-slate-50 text-slate-800 z-50 overflow-hidden selection:bg-brand-500/30 relative"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Global Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.08] pointer-events-none z-[100] mix-blend-overlay" />
      {/* Left Panel - 50% Symmetrical Column */}
      <div className="hidden lg:flex w-1/2 relative bg-sky-50 overflow-hidden shadow-2xl z-20">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105 opacity-90 mix-blend-multiply"
          style={{ backgroundImage: "url('/login-bg-light.png')" }}
        />
        {/* Subtle gradient overlay to blend perfectly */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
        
        {/* System Description & Modules */}
        <div className="absolute bottom-12 left-12 max-w-[480px] p-7 bg-white/50 backdrop-blur-3xl rounded-[24px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/50 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] hover:bg-white/60 group">
          <h3 className="text-[15px] font-bold text-slate-900 mb-2.5 tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(72,84,204,0.8)]" />
            Pixand Co Enterprise Suite
          </h3>
          <p className="text-[13px] text-slate-700 leading-relaxed font-medium mb-6">
            Our next-generation pharmaceutical infrastructure unifies critical operations into a highly secure, high-performance cloud platform. Streamline workflows across your entire supply chain.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Control Center", icon: <LayoutDashboard size={14} className="text-indigo-600" />, bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700" },
              { name: "Inventory", icon: <Package size={14} className="text-teal-600" />, bg: "bg-teal-50", border: "border-teal-100", text: "text-teal-700" },
              { name: "Finance", icon: <Landmark size={14} className="text-emerald-600" />, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" },
              { name: "Invoice Center", icon: <Receipt size={14} className="text-orange-600" />, bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700" },
              { name: "HR & Payroll", icon: <Users size={14} className="text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700" },
              { name: "CRM", icon: <Briefcase size={14} className="text-purple-600" />, bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700" },
            ].map(mod => (
              <div key={mod.name} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${mod.bg} border ${mod.border} transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default`}>
                <div className={`p-1.5 rounded-lg bg-white shadow-sm ${mod.text}`}>
                  {mod.icon}
                </div>
                <span className={`text-[11px] font-bold ${mod.text} leading-tight`}>
                  {mod.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - 50% Symmetrical Column */}
      <div className="flex w-full lg:w-1/2 flex-col relative z-10 bg-gradient-to-br from-slate-50 via-white to-sky-50/50 overflow-hidden">
        
        {/* Modern ambient glow on the right side */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-[100px] pointer-events-none" />
        
        {/* Center Container for the Form Card */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[440px] mx-auto bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60 ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
            
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="flex items-center gap-3 mb-2 text-slate-900">
                <div 
                  className="w-11 h-11 bg-brand-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/10" 
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                  P
                </div>
                <span className="text-[28px] font-bold tracking-tight">Pixand Co</span>
              </div>
              <p className="text-[14px] font-medium text-slate-500 tracking-wide text-center">
                Enterprise Pharmaceutical System
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Error Banner */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 shadow-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="text-[13px] font-medium text-red-600 leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Email Field */}
                <div className="flex flex-col gap-2 group">
                  <Label htmlFor="email" className="text-slate-700 font-semibold text-[13px] tracking-wide uppercase">
                    Email Address
                  </Label>
                  <div className="relative transition-all duration-300">
                    <MdMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <Input 
                      id="email"
                      type="email" 
                      name="email"
                      placeholder="name@company.com" 
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-[14px] font-medium transition-all shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2 group">
                  <Label htmlFor="password" className="text-slate-700 font-semibold text-[13px] tracking-wide uppercase">
                    Password
                  </Label>
                  <div className="relative transition-all duration-300">
                    <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      placeholder="••••••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 pr-12 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-[14px] font-medium transition-all shadow-sm hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 focus:outline-none transition-colors p-1 rounded-md"
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2.5">
                  <Checkbox 
                    id="remember" 
                    className="w-[18px] h-[18px] rounded-[5px] data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500 shadow-sm" 
                    defaultChecked 
                  />
                  <label
                    htmlFor="remember"
                    className="text-[13px] font-medium leading-none cursor-pointer text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Keep me logged in
                  </label>
                </div>
                <a href="#" className="text-[13px] text-brand-500 hover:text-brand-600 font-semibold transition-colors">
                  Recovery options?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[15px] shadow-[0_4px_14px_0_rgba(72,84,204,0.39)] hover:shadow-[0_6px_20px_rgba(72,84,204,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "Authenticating..." : (
                  <>
                    Access Platform
                    <MdArrowForward size={18} />
                  </>
                )}
              </Button>

              {/* Sign up */}
              <div className="text-center mt-3 border-t border-slate-100 pt-6">
                <span className="text-[13.5px] text-slate-500 font-medium">New to Pixand Co? </span>
                <a href="#" className="text-[13.5px] text-brand-500 font-semibold hover:underline decoration-2 underline-offset-2">Request access</a>
              </div>
            </form>
          </div>
        </div>

        {/* Pinned Bottom Footer */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center px-6 pointer-events-none">
          <p className="text-[12px] text-slate-400 font-semibold tracking-[0.1em] uppercase">
            Pixand Co Cloud Infrastructure
          </p>
          <div className="flex items-center gap-2 mt-1.5 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <p className="text-[11px] text-slate-400 font-medium">
              System Operational • © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
