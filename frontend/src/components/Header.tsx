"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  MapPin, 
  Search, 
  ChevronRight, 
  Sliders, 
  ShieldAlert,
  Compass,
  Command
} from "lucide-react";

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

  const [activeLocation, setActiveLocation] = useState("mumbai");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Initialize and sync active location
  useEffect(() => {
    const saved = localStorage.getItem("innowave-active-location") || localStorage.getItem("orca-active-location");
    if (saved && REGION_DATA[saved]) {
      setActiveLocation(saved);
    }

    const handleStorageChange = () => {
      const current = localStorage.getItem("innowave-active-location") || localStorage.getItem("orca-active-location");
      if (current && REGION_DATA[current]) {
        setActiveLocation(current);
      }
    };

    window.addEventListener("innowave-location-changed", handleStorageChange);
    window.addEventListener("orca-location-changed", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("innowave-location-changed", handleStorageChange);
      window.removeEventListener("orca-location-changed", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLocationSelect = (locKey: string) => {
    setActiveLocation(locKey);
    localStorage.setItem("innowave-active-location", locKey);
    localStorage.setItem("orca-active-location", locKey);
    window.dispatchEvent(new CustomEvent("innowave-location-changed", { detail: locKey }));
    window.dispatchEvent(new CustomEvent("orca-location-changed", { detail: locKey }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    // Check if user is searching for a region
    const matchedRegion = Object.keys(REGION_DATA).find(
      key => key.includes(query) || REGION_DATA[key].name.toLowerCase().includes(query)
    );

    if (matchedRegion) {
      handleLocationSelect(matchedRegion);
      setSearchQuery("");
      setShowSearchModal(false);
      return;
    }

    // Otherwise redirect query into copilot
    router.push(`/copilot?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setShowSearchModal(false);
  };

  const currentRegion = REGION_DATA[activeLocation] || REGION_DATA.mumbai;
  const currentPageTitle = PAGE_NAMES[pathname] || "Intelligence";

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

      {/* Right: Location Selector, Global Search, and Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search zones, coordinates, ask..."
              className="bg-[#FAF8F5] hover:bg-white focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 pl-8 pr-12 py-1.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 w-44 lg:w-60 transition-all font-sans"
            />
            <kbd className="absolute right-2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-stone-200 rounded pointer-events-none shadow-2xs">
              /
            </kbd>
          </div>
        </form>

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
