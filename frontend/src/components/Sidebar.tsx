"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Navigation, 
  MessageSquare, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  FileText, 
  Settings, 
  BrainCircuit, 
  Radio,
  X,
  Fish,
  Download,
  Wifi,
  WifiOff,
  HardDrive,
  User,
  LogIn,
  LogOut,
  Anchor
} from "lucide-react";
import DataModeToggle from "@/components/DataModeToggle";
import { usePWA } from "@/context/PWAContext";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onOpenSettings?: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onOpenSettings, onCloseMobile, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [focusParam, setFocusParam] = useState<string | null>(null);
  const { isOffline, isInstallable, isInstalled, installPWA, lastSyncTime } = usePWA();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setFocusParam(params.get("focus"));
    }
  }, [pathname]);

  const navSections = [
    {
      title: "Command",
      items: [
        {
          label: "Marine Map",
          href: "/",
          icon: <Navigation className="h-4 w-4 flex-shrink-0" />,
          isActive: pathname === "/" && !focusParam
        },
        {
          label: "Ask INNOWAVE",
          href: "/copilot",
          icon: <MessageSquare className="h-4 w-4 flex-shrink-0" />,
          isActive: pathname === "/copilot"
        }
      ]
    },
    {
      title: "Intelligence",
      items: [
        {
          label: "Ocean Analytics",
          href: "/analytics",
          icon: <BarChart3 className="h-4 w-4 flex-shrink-0" />,
          isActive: pathname === "/analytics"
        },
        {
          label: "Research Mode",
          href: "/research",
          icon: <FileText className="h-4 w-4 flex-shrink-0 text-blue-900" />,
          isActive: pathname === "/research",
          badge: "Dossier"
        },
        {
          label: "Likely Local Species",
          href: "/?focus=species",
          icon: <Fish className="h-4 w-4 flex-shrink-0 text-teal-600" />,
          isActive: pathname === "/" && focusParam === "species",
          badge: "CMFRI"
        }
      ]
    },
    {
      title: "Workspace",
      items: [
        ...(isInstallable && !isInstalled ? [{
          label: "Install INNOWAVE App",
          href: "#",
          icon: <Download className="h-4 w-4 flex-shrink-0 text-amber-500 animate-bounce" />,
          isAction: true,
          badge: "PWA",
          onClick: () => {
            installPWA();
            if (onCloseMobile) onCloseMobile();
          }
        }] : []),
        {
          label: "Settings",
          href: "#",
          icon: <Settings className="h-4 w-4 flex-shrink-0" />,
          isAction: true,
          onClick: () => {
            if (onOpenSettings) onOpenSettings();
            if (onCloseMobile) onCloseMobile();
          }
        }
      ]
    }
  ];

  return (
    <aside className={`w-[230px] min-w-[230px] max-w-[230px] h-screen bg-[#FCFBFA] border-r border-stone-200/90 flex flex-col justify-between select-none ${isMobile ? 'shadow-2xl' : ''}`}>
      {/* Top Branding Section */}
      <div className="flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between">
          <Link 
            href="/" 
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="bg-gradient-to-tr from-blue-900 to-indigo-800 p-2 rounded-xl border border-blue-300/30 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-blue-950 font-sans">
                  INNOWAVE
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-mono font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight -mt-0.5">
                Marine Agent Network
              </p>
            </div>
          </Link>

          {/* Close button on mobile drawer */}
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav className="px-3 py-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                {section.title}
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                {section.items.map((item: any) => {
                  if (item.isAction) {
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-950 hover:bg-stone-100/80 transition-all duration-150 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-500 group-hover:text-blue-900 transition-colors">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 relative ${
                        item.isActive
                          ? "bg-blue-900 text-white font-bold shadow-xs shadow-blue-900/20"
                          : "text-slate-600 hover:text-blue-950 hover:bg-stone-100/80 font-medium"
                      }`}
                    >
                      {/* Left accent bar for active item */}
                      {item.isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full" />
                      )}

                      <div className="flex items-center gap-2.5">
                        <span className={item.isActive ? "text-white" : "text-slate-500"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            item.isActive
                              ? "bg-blue-800 text-amber-300"
                              : "bg-blue-50 text-blue-900 border border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer: User Card + Agent Network Status & IndexedDB Storage Indicator */}
      <div className="p-3 border-t border-stone-200/80 bg-[#F9F7F4]/70 flex flex-col gap-2">
        {/* Logged in User Tile or Sign In Button */}
        {isAuthenticated && user ? (
          <div className="bg-white border border-stone-200/90 p-2.5 rounded-xl shadow-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 shadow-2xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-blue-950 truncate leading-tight">{user.full_name}</p>
                  <p className="text-[9.5px] font-mono text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Log out"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
            {user.role === "fisherman" && user.role_details?.boat_name && (
              <div className="text-[10px] font-mono text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-150 truncate">
                🚢 {user.role_details.boat_name} ({user.role_details.boat_registration || "IND"})
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-850 hover:to-indigo-850 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In / Register</span>
          </Link>
        )}

        {/* Network & Local Cache Status */}
        <div className="flex items-center justify-between bg-white border border-stone-200/90 px-2.5 py-2 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isOffline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              )}
            </span>
            <span className="text-[11px] font-medium text-slate-600">
              {isOffline ? "Offshore Cache:" : "Agent Network:"}
            </span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            isOffline 
              ? "text-amber-800 bg-amber-50 border-amber-300" 
              : "text-emerald-700 bg-emerald-50 border-emerald-200/60"
          }`}>
            {isOffline ? "Cached" : "Online"}
          </span>
        </div>

        {/* Sync status metadata strip */}
        <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-3 w-3 text-blue-900" />
            <span>Last Sync</span>
          </div>
          <span className="text-blue-900 font-bold truncate max-w-[90px]" title={lastSyncTime}>
            {lastSyncTime ? lastSyncTime.split(",")[1] || lastSyncTime : "Active"}
          </span>
        </div>

        {/* Data Mode: Offline | Live Labeled Toggle */}
        <DataModeToggle compact={true} />
      </div>
    </aside>
  );
}

