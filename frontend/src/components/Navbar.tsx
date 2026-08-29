"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, BarChart3, Navigation, BrainCircuit } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Map Dashboard", icon: <Navigation className="h-4 w-4" /> },
    { href: "/copilot", label: "AI Copilot", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/analytics", label: "Ocean Analytics", icon: <BarChart3 className="h-4 w-4" /> }
  ];

  return (
    <header className="border-b border-stone-200 bg-[#fcfbfa]/95 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-slate-800">
      {/* Title / Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-blue-800 to-indigo-900 p-2 rounded-xl border border-blue-200 shadow-md">
          <Compass className="h-6 w-6 text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-wider text-blue-950">
            INNOWAVE
          </h1>
          <p className="text-[10px] text-slate-500 font-mono">Collaborative Marine Agent Network</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-inner">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm transition duration-150 ${
                isActive
                  ? "bg-blue-900 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-stone-100"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Live Badges */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500">Agent Network:</span>
          <span className="text-emerald-700 font-bold">Online</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <BrainCircuit className="h-3.5 w-3.5 text-blue-900" />
          <span className="text-slate-500">Agent Sync:</span>
          <span className="text-blue-900 font-bold">Active</span>
        </div>
      </div>
    </header>
  );
}
