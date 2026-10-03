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
    >
      {/* Global Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.08] pointer-events-none z-[100] mix-blend-overlay" />
      {/* Left Panel - 50% Symmetrical Column */}
      <div className="hidden lg:flex w-1/2 relative bg-sky-50 overflow-hidden shadow-2xl z-20 group/left">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/left:scale-105 opacity-90 mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: "url('/login-bg-light.png')" }}
        />
        {/* Subtle gradient overlay to blend perfectly */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent opacity-60" />
        
        {/* System Description & Modules */}
        <div className="absolute bottom-12 left-12 lg:left-16 lg:bottom-16 max-w-[500px] p-8 bg-white/50 backdrop-blur-3xl rounded-[28px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/50 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] hover:bg-white/60 group animate-cardFadeIn translate-y-0">
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
              { name: "Finance", icon: <Landmark size={14} className="text-emerald-600" />, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", delay: "delay-[100ms]" },
              { name: "Invoice Center", icon: <Receipt size={14} className="text-orange-600" />, bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700", delay: "delay-[150ms]" },
              { name: "HR & Payroll", icon: <Users size={14} className="text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", delay: "delay-[200ms]" },
              { name: "CRM", icon: <Briefcase size={14} className="text-purple-600" />, bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", delay: "delay-[250ms]" },
            ].map((mod) => (
              <div key={mod.name} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${mod.bg} border ${mod.border} transition-all duration-500 hover:scale-[1.03] hover:shadow-md cursor-default animate-in fade-in zoom-in-95 fill-mode-both ${mod.delay}`}>
                <div className={`p-1.5 rounded-lg bg-white shadow-sm ${mod.text} transition-transform duration-500 group-hover:scale-110`}>
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
        
        {/* Modern ambient glowing orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-ambient1 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-sky-400/10 blur-[100px] pointer-events-none animate-ambient2 mix-blend-multiply" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none animate-ambient3 mix-blend-multiply" />
        
        {/* Center Container for the Form Card */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[460px] mx-auto bg-white rounded-[28px] p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60 ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
            
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="flex items-center gap-3 mb-2.5 text-slate-900 group/logo cursor-default">
                <div 
                  className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(72,84,204,0.4)] ring-4 ring-brand-500/10 transition-transform duration-700 group-hover/logo:rotate-12 group-hover/logo:scale-110" 
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                  P
                </div>
                <span className="text-[30px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Pixand Co</span>
              </div>
              <p className="text-[15px] font-medium text-slate-500 tracking-wide text-center">
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
                  <Label htmlFor="email" className="text-slate-600 font-bold text-[12px] tracking-wider uppercase mb-1">
                    Email Address
                  </Label>
                  <div className="relative transition-all duration-300">
                    <MdMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 group-focus-within:scale-110 transition-all duration-300" size={20} />
                    <Input 
                      id="email"
                      type="email" 
                      name="email"
                      placeholder="name@company.com" 
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 h-[52px] rounded-xl bg-white border-slate-200 focus-visible:ring-[3px] focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-[14.5px] font-medium transition-all duration-300 shadow-sm hover:border-brand-500/50 hover:shadow-md"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2 group mt-1">
                  <Label htmlFor="password" className="text-slate-600 font-bold text-[12px] tracking-wider uppercase mb-1">
                    Password
                  </Label>
                  <div className="relative transition-all duration-300">
                    <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 group-focus-within:scale-110 transition-all duration-300" size={20} />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      placeholder="••••••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 pr-12 h-[52px] rounded-xl bg-white border-slate-200 focus-visible:ring-[3px] focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-[14.5px] font-medium transition-all duration-300 shadow-sm hover:border-brand-500/50 hover:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 focus:outline-none transition-all duration-300 p-1 rounded-md hover:bg-brand-50 hover:scale-110"
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
                className="group/btn w-full h-[52px] rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(72,84,204,0.3)] hover:shadow-[0_12px_28px_rgba(72,84,204,0.4)] transition-all duration-300 flex items-center justify-center gap-2 mt-5 tracking-wide border border-brand-400/20 relative overflow-hidden"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                
                {loading ? "Authenticating..." : (
                  <>
                    Access Platform
                    <MdArrowForward size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1.5" />
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
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center px-6 pointer-events-none z-20">
          <p className="text-[12px] text-slate-400/80 font-bold tracking-[0.15em] uppercase">
            Pixand Co Cloud Infrastructure
          </p>
          <div className="flex items-center gap-2 mt-1.5 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)] animate-pulse" />
            <p className="text-[11px] text-slate-400/80 font-medium">
              System Operational • © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
