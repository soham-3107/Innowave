"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Compass, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Fish, 
  Microscope, 
  Building2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Authentication failed. Please verify your credentials.");
    }
  };

  // Quick 1-click demo switcher helper for presentations
  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setErrorMessage("");
    setIsLoading(true);
    const res = await login(demoEmail, "demo1234");
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Quick login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-blue-900 to-indigo-900 p-2.5 rounded-2xl border border-blue-400/30 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-7 w-7 text-white animate-spin-slow" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-wider text-blue-950 font-sans block leading-none">
                INNOWAVE
              </span>
              <span className="text-[11px] text-slate-500 font-mono tracking-tight">
                Autonomous Marine Intelligence Suite
              </span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-2">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Access personalized vessel telemetry, radar overlays, and AI copilot navigation.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@innowave.in"
                  className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Default Demo: demo1234
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-850 hover:to-indigo-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="pt-3 border-t border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                1-Click Demo Profiles
              </span>
              <span className="text-[10px] text-slate-400 font-normal">For Evaluators</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("fisherman@innowave.in")}
                className="w-full bg-[#FAF8F5] hover:bg-blue-50/70 border border-stone-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-100 text-blue-900 rounded-lg group-hover:bg-blue-900 group-hover:text-white transition-colors">
                    <Fish className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Capt. Rajesh Patil</span>
                    <span className="block text-[10px] text-slate-500 font-mono">Fisherman (Matsya Sagar IV • Mumbai)</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("researcher@innowave.in")}
                className="w-full bg-[#FAF8F5] hover:bg-teal-50/70 border border-stone-200 hover:border-teal-300 p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Microscope className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Dr. Priya Nair</span>
                    <span className="block text-[10px] text-slate-500 font-mono">Researcher (CMFRI • Kochi)</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("official@innowave.in")}
                className="w-full bg-[#FAF8F5] hover:bg-indigo-50/70 border border-stone-200 hover:border-indigo-300 p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-100 text-indigo-900 rounded-lg group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Cmdr. Vivek Sharma</span>
                    <span className="block text-[10px] text-slate-500 font-mono">Govt Official (ICG Regional HQ • Goa)</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-900 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center pt-2 border-t border-stone-150">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{" "}
              <Link href="/signup" className="font-bold text-blue-900 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
