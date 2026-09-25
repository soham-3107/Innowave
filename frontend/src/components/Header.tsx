"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  MapPin, 
  Search, 
  ChevronRight, 
  ChevronDown,
  X,
  Sliders, 
  ShieldAlert,
  Compass,
  Command,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  LogOut,
  LogIn,
  Fish,
  Microscope,
  Building2,
  Anchor,
  Phone
} from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { useAuth } from "@/context/AuthContext";
import { 
  COASTAL_REGIONS, 
  REGION_DATA, 
  searchCoastalRegions, 
  CoastalRegion 
} from "@/data/coastalRegions";

const PAGE_NAMES: Record<string, string> = {
  "/": "Marine Map",
  "/copilot": "Ask INNOWAVE (Copilot)",
  "/analytics": "Ocean Analytics",
  "/research": "Research Mode"
};

interface HeaderProps {
  onToggleMobileDrawer: () => void;
  onOpenSettings?: () => void;
}

export default function Header({ onToggleMobileDrawer, onOpenSettings }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOffline, isInstallable, isInstalled, installPWA } = usePWA();
  const { user, isAuthenticated, logout } = useAuth();

  const [activeLocation, setActiveLocation] = useState("mumbai");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter coastal regions in real time based on user search query
  const filteredRegions = searchCoastalRegions(searchQuery);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  // Reset highlighted index when filtered regions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Initialize and sync active location across tabs and components
  useEffect(() => {
    const saved = localStorage.getItem("innowave-active-location");
    if (saved && REGION_DATA[saved]) {
      setActiveLocation(saved);
    }

    const handleStorageChange = (e?: any) => {
      const current = (e?.detail) || localStorage.getItem("innowave-active-location");
      if (current && REGION_DATA[current]) {
        setActiveLocation(current);
      }
    };

    window.addEventListener("innowave-location-changed", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("innowave-location-changed", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLocationSelect = (locKey: string) => {
    if (!REGION_DATA[locKey]) return;
    setActiveLocation(locKey);
    localStorage.setItem("innowave-active-location", locKey);
    window.dispatchEvent(new CustomEvent("innowave-location-changed", { detail: locKey }));
    setIsSearchOpen(false);
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsSearchOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredRegions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredRegions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredRegions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredRegions.length) {
        handleLocationSelect(filteredRegions[highlightedIndex].key);
      } else if (filteredRegions.length > 0) {
        handleLocationSelect(filteredRegions[0].key);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSearchOpen(false);
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  const currentRegion = REGION_DATA[activeLocation] || REGION_DATA.mumbai;
  const currentPageTitle = PAGE_NAMES[pathname] || "Intelligence";

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "fisherman":
        return { icon: <Fish className="h-3 w-3 text-blue-800" />, label: "Fisherman", bg: "bg-blue-50 text-blue-900 border-blue-200" };
      case "researcher":
        return { icon: <Microscope className="h-3 w-3 text-teal-800" />, label: "Researcher", bg: "bg-teal-50 text-teal-900 border-teal-200" };
      case "official":
        return { icon: <Building2 className="h-3 w-3 text-indigo-800" />, label: "Official", bg: "bg-indigo-50 text-indigo-900 border-indigo-200" };
      default:
        return { icon: <User className="h-3 w-3 text-slate-700" />, label: "Mariner", bg: "bg-stone-100 text-slate-700 border-stone-200" };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="h-14 min-h-[56px] border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 text-slate-800">
      {/* Left: Mobile Drawer Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileDrawer}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-blue-950 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Context Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
          <span className="font-semibold text-slate-700 hidden sm:inline">
            {currentRegion.basin}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-bold text-blue-950 truncate max-w-[140px] sm:max-w-none">
            {currentRegion.name}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
          <span className="text-blue-900 font-semibold truncate bg-blue-50 px-2 py-0.5 rounded-md border border-blue-150 text-[11px]">
            {currentPageTitle}
          </span>
        </div>
      </div>

      {/* Right: User Profile, Region Search Bar, and Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* PWA Install Button */}
        {isInstallable && !isInstalled && (
          <button
            onClick={installPWA}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold px-2.5 py-1.2 rounded-xl text-xs shadow-xs hover:shadow transition-all cursor-pointer border border-blue-700/50"
            title="Install INNOWAVE to Home Screen for Offline Offshore Access"
          >
            <Download className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Connectivity Status Indicator */}
        <div 
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-mono font-semibold border ${
            isOffline 
              ? "bg-amber-50 text-amber-900 border-amber-300" 
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
          title={isOffline ? "Offline: local offline cache active" : "Online: live telemetry sync"}
        >
          {isOffline ? (
            <>
              <WifiOff className="h-3 w-3 text-amber-600 animate-pulse" />
              <span>OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi className="h-3 w-3 text-emerald-600" />
              <span>LIVE</span>
            </>
          )}
        </div>

        {/* Global Coast / Region Search Bar with Live Autocomplete */}
        <div className="relative" ref={searchContainerRef}>
          <div
            className={`flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-white focus-within:bg-white border ${
              isSearchOpen ? "border-blue-900 ring-2 ring-blue-900/15 bg-white" : "border-stone-200 hover:border-stone-300"
            } px-2.5 py-1 rounded-xl shadow-2xs transition-all`}
          >
            <Search className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isSearchOpen ? "text-blue-900 font-bold" : "text-slate-500"}`} />
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchOpen) setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={isSearchOpen ? "Search coast (e.g. Kochi, Goa)..." : `${currentRegion.name}`}
              className="bg-transparent text-xs font-bold text-blue-950 placeholder:text-slate-500 focus:outline-none w-28 sm:w-36 md:w-44 truncate"
              title="Search and switch coastal region"
              aria-label="Search coastal regions"
              aria-expanded={isSearchOpen}
              aria-haspopup="listbox"
              role="combobox"
            />

            {/* Clear Button or Dropdown Indicator */}
            {searchQuery ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(prev => !prev);
                  if (!isSearchOpen) {
                    searchInputRef.current?.focus();
                  }
                }}
                className="text-slate-400 hover:text-blue-900 p-0.5 rounded transition-colors cursor-pointer"
                title="Toggle coastal list"
                aria-label="Toggle coastal list"
              >
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isSearchOpen ? "rotate-180 text-blue-900" : ""}`} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Panel */}
          {isSearchOpen && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
              role="listbox"
            >
              {/* Header Label */}
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-stone-100 text-[10.5px] font-mono text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  {searchQuery ? `Matching Coasts (${filteredRegions.length})` : "Supported Coastal Sectors"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  ↑↓ Navigate • ↵ Select
                </span>
              </div>

              {/* Suggestions List */}
              <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region, idx) => {
                    const isActive = activeLocation === region.key;
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={region.key}
                        type="button"
                        onClick={() => handleLocationSelect(region.key)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        role="option"
                        aria-selected={isActive}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isHighlighted
                            ? "bg-blue-50/90 text-blue-950 font-semibold"
                            : "hover:bg-stone-50 text-slate-800"
                        } ${isActive ? "border border-blue-200/60 bg-blue-50/40" : ""}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                            isActive 
                              ? "bg-blue-900 text-white shadow-2xs" 
                              : isHighlighted 
                              ? "bg-blue-100 text-blue-900" 
                              : "bg-stone-100 text-slate-600"
                          }`}>
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-blue-950 truncate">
                                {region.name}
                              </span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-mono truncate block">
                              {region.state} • {region.basin}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isActive ? (
                            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60">
                              {region.basin.includes("Arabian") ? "AS" : "BoB"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  /* No matching coast found state */
                  <div className="p-4 text-center">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-xs text-slate-800 mb-0.5">
                      No matching coast found
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug max-w-[220px] mx-auto">
                      Try searching <span className="font-semibold text-blue-900">&ldquo;Kochi&rdquo;</span>, <span className="font-semibold text-blue-900">&ldquo;Mumbai&rdquo;</span>, <span className="font-semibold text-blue-900">&ldquo;Goa&rdquo;</span>, <span className="font-semibold text-blue-900">&ldquo;Chennai&rdquo;</span>, <span className="font-semibold text-blue-900">&ldquo;Veraval&rdquo;</span>, or <span className="font-semibold text-blue-900">&ldquo;Vizag&rdquo;</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Jump Footer */}
              <div className="pt-2 mt-1 border-t border-stone-150 px-2 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                <span className="text-slate-400">Current Sector:</span>
                <span className="font-bold text-blue-900">{currentRegion.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE & AUTH CONTROLS */}
        {isAuthenticated && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center gap-2 bg-[#FAF8F5] hover:bg-white border border-stone-200 hover:border-blue-900/40 p-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="View your maritime profile"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-900 to-indigo-800 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-blue-950 truncate max-w-[110px] leading-tight">
                  {user.full_name.split(" ")[0]}
                </span>
                <span className="text-[9.5px] font-mono text-slate-500 capitalize">
                  {user.role}
                </span>
              </div>
            </button>

            {/* User Profile Dropdown Modal */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-stone-150 pb-3 mb-3">
                  <div>
                    <span className="font-extrabold text-sm text-blue-950 block">
                      {user.full_name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {user.email}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${roleInfo.bg}`}>
                    {roleInfo.icon}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 py-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-semibold text-slate-800">{user.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Default Zone:</span>
                    <span className="font-bold text-blue-900 capitalize">
                      {REGION_DATA[user.default_region]?.name || `${user.default_region} Coast`}
                    </span>
                  </div>

                  {/* Role specific info */}
                  {user.role === "fisherman" && user.role_details.boat_name && (
                    <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-150 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vessel:</span>
                        <span className="font-bold text-blue-950">{user.role_details.boat_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reg No:</span>
                        <span className="font-bold text-blue-900">{user.role_details.boat_registration}</span>
                      </div>
                    </div>
                  )}

                  {user.role === "researcher" && user.role_details.institution_name && (
                    <div className="bg-teal-50/70 p-2 rounded-xl border border-teal-150 space-y-1">
                      <span className="text-slate-400 block text-[10px]">Institution:</span>
                      <span className="font-bold text-teal-950 block leading-tight">{user.role_details.institution_name}</span>
                    </div>
                  )}

                  {user.role === "official" && user.role_details.department_name && (
                    <div className="bg-indigo-50/70 p-2 rounded-xl border border-indigo-150 space-y-1">
                      <span className="text-slate-400 block text-[10px]">Department:</span>
                      <span className="font-bold text-indigo-950 block leading-tight">{user.role_details.department_name}</span>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-150 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800 uppercase">
                      <ShieldAlert className="h-3 w-3" />
                      <span>SOS Emergency Contact</span>
                    </div>
                    <p className="text-slate-800 font-semibold">{user.emergency_contact_name}</p>
                    <p className="text-rose-900 font-bold">{user.emergency_contact_phone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-2 border-t border-stone-150 flex items-center justify-between">
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="text-[11px] text-blue-900 hover:underline font-semibold"
                  >
                    Switch Account
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 font-bold text-xs cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-850 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs hover:shadow transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Log In</span>
            </Link>
          </div>
        )}

        {/* Quick Settings Action */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl text-slate-500 hover:text-blue-950 hover:bg-stone-100 border border-stone-200/80 transition-all cursor-pointer shadow-2xs"
            title="Open Platform Preferences"
          >
            <Sliders className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
