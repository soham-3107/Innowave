import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  MapPin, 
  Search, 
  ChevronRight, 
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

const REGION_DATA: Record<string, { name: string; basin: string }> = {
  mumbai: { name: "Mumbai Coast", basin: "Arabian Sea" },
  goa: { name: "Goa Coast", basin: "Arabian Sea" },
  kochi: { name: "Kochi Coast", basin: "Arabian Sea" },
  chennai: { name: "Chennai Coast", basin: "Bay of Bengal" },
  veraval: { name: "Veraval Coast", basin: "Arabian Sea" },
  vizag: { name: "Visakhapatnam Coast", basin: "Bay of Bengal" }
};

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Initialize and sync active location
  useEffect(() => {
    const saved = localStorage.getItem("innowave-active-location");
    if (saved && REGION_DATA[saved]) {
      setActiveLocation(saved);
    }

    const handleStorageChange = () => {
      const current = localStorage.getItem("innowave-active-location");
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
    setActiveLocation(locKey);
    localStorage.setItem("innowave-active-location", locKey);
    window.dispatchEvent(new CustomEvent("innowave-location-changed", { detail: locKey }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const matchedRegion = Object.keys(REGION_DATA).find(
      key => key.includes(query) || REGION_DATA[key].name.toLowerCase().includes(query)
    );

    if (matchedRegion) {
      handleLocationSelect(matchedRegion);
      setSearchQuery("");
      setShowSearchModal(false);
      return;
    }

    router.push(`/copilot?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setShowSearchModal(false);
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

      {/* Right: User Profile, Location Selector, and Actions */}
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

        {/* Global Location Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-stone-200 px-2.5 py-1 rounded-xl shadow-2xs hover:border-stone-300 transition-colors">
          <MapPin className="h-3.5 w-3.5 text-blue-900 flex-shrink-0" />
          <select
            value={activeLocation}
            onChange={(e) => handleLocationSelect(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-950 focus:outline-none cursor-pointer pr-1"
            title="Switch coastal surveillance sector"
          >
            {Object.entries(REGION_DATA).map(([key, data]) => (
              <option key={key} value={key}>
                {data.name}
              </option>
            ))}
          </select>
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
                    <span className="font-bold text-blue-900 capitalize">{user.default_region} Coast</span>
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


