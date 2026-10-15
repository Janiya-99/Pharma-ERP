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
import { 
  LayoutDashboard, 
  Package, 
  Landmark, 
  Receipt, 
  Users, 
  Briefcase,
  ShieldCheck,
  Sparkles,
  Loader2
} from "lucide-react";

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
    <div className="fixed inset-0 flex w-full h-screen bg-slate-50 text-slate-800 z-50 overflow-hidden select-none">
      {/* LEFT PANEL - Symmetrical 50% Showcase (No flickering, crisp high-end aesthetics) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden z-20 group/left">
        {/* Crisp static high-resolution background with smooth hover parallax micro-scale */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover/left:scale-[1.02] opacity-95"
          style={{ backgroundImage: "url('/login-bg-light.png')" }}
        />

        {/* Sophisticated smooth lighting gradients - smooth blend into the card and scene */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/15 pointer-events-none" />

        {/* Floating Brand & Modules Glassmorphism Showcase Card */}
        <div className="absolute bottom-10 left-10 lg:left-14 lg:bottom-14 max-w-[530px] p-7 lg:p-8 bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 transition-all duration-500 hover:bg-white/85 hover:shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)]">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/60 mb-3.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10.5px] font-bold text-indigo-700 tracking-wider uppercase">
              Pharmaceutical Intelligence & Cloud ERP
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
            Pixand Co Enterprise Suite
          </h3>

          <p className="text-[13px] text-slate-600 leading-relaxed font-medium mb-6">
            Unified next-generation pharmaceutical infrastructure orchestrating compliance, cold-chain inventory distribution, multi-branch operations, and financial governance.
          </p>

          {/* Module Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { name: "Control Center", icon: <LayoutDashboard size={14} className="text-indigo-600" />, bg: "bg-indigo-50/90 hover:bg-indigo-100/90", border: "border-indigo-200/60", text: "text-indigo-800" },
              { name: "Inventory", icon: <Package size={14} className="text-teal-600" />, bg: "bg-teal-50/90 hover:bg-teal-100/90", border: "border-teal-200/60", text: "text-teal-800" },
              { name: "Finance", icon: <Landmark size={14} className="text-emerald-600" />, bg: "bg-emerald-50/90 hover:bg-emerald-100/90", border: "border-emerald-200/60", text: "text-emerald-800" },
              { name: "Invoice Center", icon: <Receipt size={14} className="text-amber-600" />, bg: "bg-amber-50/90 hover:bg-amber-100/90", border: "border-amber-200/60", text: "text-amber-800" },
              { name: "HR & Payroll", icon: <Users size={14} className="text-blue-600" />, bg: "bg-blue-50/90 hover:bg-blue-100/90", border: "border-blue-200/60", text: "text-blue-800" },
              { name: "CRM", icon: <Briefcase size={14} className="text-purple-600" />, bg: "bg-purple-50/90 hover:bg-purple-100/90", border: "border-purple-200/60", text: "text-purple-800" },
            ].map((mod) => (
              <div 
                key={mod.name} 
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${mod.bg} border ${mod.border} transition-all duration-200 hover:scale-[1.02] hover:shadow-sm cursor-default`}
              >
                <div className="p-1 rounded-lg bg-white shadow-xs shrink-0">
                  {mod.icon}
                </div>
                <span className={`text-[11.5px] font-bold ${mod.text} leading-tight`}>
                  {mod.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Card */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between relative z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-y-auto p-6 sm:p-12 lg:p-16">
        {/* Soft Ambient Glowing Highlights */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none" />

        {/* Top spacer */}
        <div className="hidden sm:block" />

        {/* Centered Modern Card */}
        <div className="w-full max-w-[440px] mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07)] border border-slate-100/90 ring-1 ring-slate-900/5 my-auto">
          {/* Brand Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] ring-4 ring-indigo-500/10 transition-transform duration-300 hover:scale-105"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              >
                P
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Pixand Co
              </span>
            </div>
            <p className="text-[12px] font-bold text-slate-400 tracking-wider uppercase text-center">
              Enterprise Pharmaceutical Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50/90 border border-red-200/80 p-3.5 flex items-start gap-2.5 shadow-xs">
                <div className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span className="text-[13px] font-semibold text-red-600 leading-snug">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5 group">
              <Label htmlFor="email" className="text-slate-500 font-bold text-[11px] tracking-wider uppercase">
                Email Address
              </Label>
              <div className="relative">
                <MdMailOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" size={19} />
                <Input 
                  id="email"
                  type="email" 
                  name="email"
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="pl-11 pr-4 h-[48px] rounded-xl bg-slate-50/80 border-slate-200 text-slate-900 text-sm font-medium transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 group">
              <Label htmlFor="password" className="text-slate-500 font-bold text-[11px] tracking-wider uppercase">
                Password
              </Label>
              <div className="relative">
                <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" size={19} />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="••••••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-11 pr-11 h-[48px] rounded-xl bg-slate-50/80 border-slate-200 text-slate-900 text-sm font-medium transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Recovery Options */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  className="w-4 h-4 rounded data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" 
                  defaultChecked 
                />
                <label
                  htmlFor="remember"
                  className="text-[13px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  Keep me logged in
                </label>
              </div>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert("Please contact your system administrator to reset credentials."); }}
                className="text-[12.5px] text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Recovery options?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="group/btn w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] text-white font-bold text-sm shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:shadow-[0_14px_30px_-5px_rgba(79,70,229,0.45)] transition-all duration-200 flex items-center justify-center gap-2 mt-2 tracking-wide disabled:opacity-50 relative overflow-hidden"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Platform</span>
                  <MdArrowForward size={17} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                </>
              )}
            </Button>

            {/* Request Access */}
            <div className="text-center mt-2 border-t border-slate-100 pt-5">
              <span className="text-[13px] text-slate-500 font-medium">New to Pixand Co? </span>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert("Contact Pixand Co Support or your system administrator to provision access."); }}
                className="text-[13px] text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Request access
              </a>
            </div>
          </form>
        </div>

        {/* Pinned Bottom Operational Footer */}
        <div className="flex flex-col items-center justify-center py-4 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <p className="text-[10.5px] text-slate-500 font-bold tracking-wider uppercase">
              System Operational • Cloud Infrastructure • © {new Date().getFullYear()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
