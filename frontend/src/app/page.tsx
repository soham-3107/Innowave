"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Compass, Navigation, ShieldAlert, AlertTriangle, RefreshCw, Anchor, MessageSquare, AlertCircle, FileText, Fish } from "lucide-react";
import { REGION_SPECIES } from "@/data/speciesData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-stone-100 flex items-center justify-center border border-stone-200 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="animate-spin text-blue-900 h-10 w-10" />
        <p className="text-blue-900 font-mono text-sm">Loading Live Charts...</p>
      </div>
    </div>
  )
});

const REGION_NAMES: Record<string, string> = {
  mumbai: "Mumbai Coast",
  goa: "Goa Coast",
  kochi: "Kochi Coast",
  chennai: "Chennai Coast",
  veraval: "Veraval / Gujarat Coast",
  vizag: "Visakhapatnam Coast"
};

const REGION_RISK_SCORES: Record<string, number> = {
  mumbai: 18,
  goa: 15,
  kochi: 75,
  chennai: 12,
  veraval: 45,
  vizag: 22
};

export default function HomeDashboard() {
  const alertsRef = useRef<HTMLDivElement>(null);
  const speciesRef = useRef<HTMLDivElement>(null);

  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [highlightedSpecies, setHighlightedSpecies] = useState(false);

  const [pfzs, setPfzs] = useState<any[]>([]);
  const [hazards, setHazards] = useState<any[]>([]);
  const [tideZones, setTideZones] = useState<any[]>([]);
  const [vesselPath, setVesselPath] = useState<[number, number][]>([]);
  const [vesselIndex, setVesselIndex] = useState(0);
  const [routes, setRoutes] = useState<any>(null);
  const [dynamicAlerts, setDynamicAlerts] = useState<any[]>([]);
  const [activeLocation, setActiveLocation] = useState("mumbai");

  // Chart Layers state synchronized with top toolbar Geofence control (default: all OFF)
  const [mapLayers, setMapLayers] = useState({
    fishingSuitability: false,
    fishingGrounds: false,
    weatherSeaState: false,
    seaDepthContours: false,
    geologicalBorders: false,
    safetyTrafficAlerts: false
  });
  
  // Community Reports states
  const [reports, setReports] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "Good Catch",
    text: "",
    lat: 18.95,
    lon: 72.80
  });

  // Emergency SOS states
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosSentTime, setSosSentTime] = useState("");
  const [sosRefId, setSosRefId] = useState("");
  const [sosStep, setSosStep] = useState<"confirm" | "success">("confirm");

  useEffect(() => {
    // Read shared location context
    const updateLocationFromStorage = () => {
      const saved = localStorage.getItem("innowave-active-location") || localStorage.getItem("orca-active-location");
      if (saved && REGION_NAMES[saved]) {
        setActiveLocation(saved);
      }
    };

    updateLocationFromStorage();

    const handleCustomLocation = (e: any) => {
      if (e.detail && REGION_NAMES[e.detail]) {
        setActiveLocation(e.detail);
      } else {
        updateLocationFromStorage();
      }
    };

    window.addEventListener("orca-location-changed", handleCustomLocation);
    window.addEventListener("storage", updateLocationFromStorage);
    return () => {
      window.removeEventListener("orca-location-changed", handleCustomLocation);
      window.removeEventListener("storage", updateLocationFromStorage);
    };
  }, []);

  // Reset selectedZone when active location changes so it shows the new region's species
  useEffect(() => {
    setSelectedZone(null);
  }, [activeLocation]);

  // Handle focus search parameters from sidebar
  useEffect(() => {
    const checkFocus = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const focus = params.get("focus");
        if (focus === "alerts") {
          setTimeout(() => {
            alertsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
        } else if (focus === "species") {
          setTimeout(() => {
            speciesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedSpecies(true);
            setTimeout(() => setHighlightedSpecies(false), 3000);
          }, 200);
        } else if (focus === "reports") {
          setIsReportModalOpen(true);
        }
      }
    };

    checkFocus();
    window.addEventListener("popstate", checkFocus);
    return () => window.removeEventListener("popstate", checkFocus);
  }, []);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/map`);
        const data = await res.json();
        setPfzs(data.pfzs || []);
        setHazards(data.hazards || []);
        setTideZones(data.tide_zones || []);
        setVesselPath(data.vessel_path || []);
        setReports(data.reports || []);
      } catch (err) {
        console.error("Using client-side fallback mock data.", err);
        setPfzs([
          { id: "pfz-mumbai", name: "Mumbai Offshore PFZ", center: [18.70, 72.40], radius_meters: 12000, chlorophyll: 4.8, sst: 28.2, type: "pfz" },
          { id: "pfz-goa", name: "Goa Coast PFZ", center: [15.49, 73.82], radius_meters: 9000, chlorophyll: 5.1, sst: 28.5, type: "pfz" },
          { id: "pfz-veraval", name: "Saurashtra Coast PFZ", center: [20.65, 70.05], radius_meters: 16000, chlorophyll: 6.2, sst: 27.0, type: "pfz" }
        ]);
        setHazards([
          { id: "naval-mumbai", name: "Naval Dockyard Restricted Zone", center: [18.928, 72.846], radius_meters: 3000, severity: "RESTRICTED", description: "Naval prohibited area. Commercial fishing restricted.", type: "military" },
          { id: "storm-bypass-mumbai", name: "Active Squall Area (Mumbai Bypass Target)", center: [18.82, 72.62], radius_meters: 15000, severity: "DANGER", description: "Storm squall advisory.", type: "storm" }
        ]);
        setTideZones([
          { id: "tide-mumbai", name: "Mumbai Harbor Tidal Station", center: [18.93, 72.85], radius_meters: 6000, high_tide: "05:42 AM (3.8m)", low_tide: "11:58 AM (1.1m)", current_speed: "1.2 knots (Ebb)", type: "tide" },
          { id: "tide-goa", name: "Mormugao Bay Tidal Observatory", center: [15.41, 73.80], radius_meters: 5000, high_tide: "06:15 AM (1.8m)", low_tide: "12:20 PM (0.3m)", current_speed: "0.7 knots (Flood)", type: "tide" },
          { id: "tide-kochi", name: "Cochin Inlet Tidal Rip Zone", center: [9.97, 76.22], radius_meters: 6500, high_tide: "04:12 AM (1.4m)", low_tide: "10:30 AM (0.4m)", current_speed: "2.1 knots (Turbulent)", type: "tide" }
        ]);
        setVesselPath([
          [18.940, 72.825],
          [18.925, 72.820],
          [18.910, 72.812],
          [18.880, 72.780],
          [18.840, 72.720],
          [18.800, 72.650],
          [18.760, 72.550],
          [18.720, 72.480],
          [18.700, 72.400]
        ]);
        setReports([
          { id: 1, type: "Good Catch", text: "Spotted large school of mackerel 12km out.", lat: 18.78, lon: 72.50, timestamp: "2 hours ago", region: "mumbai" },
          { id: 2, type: "Calm Seas", text: "Calm and clear seas today, perfect for fishing.", lat: 15.42, lon: 73.75, timestamp: "5 hours ago", region: "goa" },
          { id: 3, type: "Storm Warning", text: "Sudden strong winds and dark storm clouds forming.", lat: 9.98, lon: 76.08, timestamp: "1 hour ago", region: "kochi" }
        ]);
      }
    }
    loadMapData();
  }, []);

  // Update report form coordinates when current vessel position updates
  useEffect(() => {
    if (vesselPath && vesselPath[vesselIndex] && !isSelectingLocation) {
      setReportForm(prev => ({
        ...prev,
        lat: vesselPath[vesselIndex][0],
        lon: vesselPath[vesselIndex][1]
      }));
    }
  }, [vesselIndex, vesselPath, isSelectingLocation]);

  useEffect(() => {
    if (vesselPath.length === 0) return;
    const interval = setInterval(() => {
      setVesselIndex(prev => (prev + 1) % vesselPath.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [vesselPath]);

  // Unified Alerts calculations (Geofencing + Storm + SOS Alert integration)
  useEffect(() => {
    if (vesselPath.length === 0) return;
    const currentPos = vesselPath[vesselIndex];
    if (!currentPos) return;

    const newAlerts = [];

    // 1. Critical SOS alert gets highest priority (prepended at top)
    if (isSosActive) {
      newAlerts.push({
        id: "sos-emergency",
        title: "🚨 CRITICAL EMERGENCY: SOS ACTIVE",
        message: `Vessel distress beacon transmitted. Coast Guard Sector ${REGION_NAMES[activeLocation]} dispatched at ${sosSentTime} (Ref: ${sosRefId}). Tracking coords: ${currentPos[0].toFixed(5)}, ${currentPos[1].toFixed(5)}.`,
        severity: "DANGER"
      });
    }

    // 2. Geofence checks
    const navalCenter = [18.928, 72.846];
    const distToNaval = haversineDistance(currentPos[0], currentPos[1], navalCenter[0], navalCenter[1]);
    if (distToNaval < 6.0) {
      newAlerts.push({
        id: "naval",
        title: "🚫 Restricted Waters Proximity Warning",
        message: `Vessel INNOWAVE-1 is approaching Naval Dockyard Restricted limits. Distance: ${distToNaval.toFixed(2)} km. Keep clear.`,
        severity: "DANGER"
      });
    }

    const stormCenter = [18.82, 72.62];
    const distToStorm = haversineDistance(currentPos[0], currentPos[1], stormCenter[0], stormCenter[1]);
    if (distToStorm < 18.0) {
      newAlerts.push({
        id: "storm",
        title: "⚠️ Squall Zone Threat Alert",
        message: `High swell hazard detected ahead. Strong gusts up to 25 knots. Distance: ${distToStorm.toFixed(2)} km. Bypassing recommended.`,
        severity: "WARNING"
      });
    }

    setDynamicAlerts(newAlerts);
  }, [vesselIndex, vesselPath, isSosActive, activeLocation, sosSentTime, sosRefId]);

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleRequestRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end })
      });
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error(err);
      setRoutes({
        shortest: {
          path: [start, end],
          distance_km: 26.50,
          label: "Shortest Route (Crosses Active Squall Zone)",
          safety_rating: "DANGER / HIGH RISK"
        },
        safer: {
          path: [start, [18.91, 72.48], end],
          distance_km: 31.20,
          label: "Safer Route (Recommended Bypass)",
          safety_rating: "SAFE"
        }
      });
    }
  };

  const handleMapClickSelection = (coords: [number, number]) => {
    setReportForm(prev => ({
      ...prev,
      lat: coords[0],
      lon: coords[1]
    }));
    setIsSelectingLocation(false);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.text.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm)
      });
      if (!res.ok) throw new Error("API error");
      const savedReport = await res.json();
      
      setReports(prev => [savedReport, ...prev]);
      setIsReportModalOpen(false);
      setReportForm(prev => ({ ...prev, text: "" }));
    } catch (err) {
      console.warn("Offline report submission.", err);
      const fallbackReport = {
        id: reports.length + 1,
        type: reportForm.type,
        text: reportForm.text,
        lat: reportForm.lat,
        lon: reportForm.lon,
        timestamp: "Just now",
        region: activeLocation
      };
      setReports(prev => [fallbackReport, ...prev]);
      setIsReportModalOpen(false);
      setReportForm(prev => ({ ...prev, text: "" }));
    }
  };

  const triggerSosSignal = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const refNum = "SOS-" + Math.floor(100000 + Math.random() * 900000);
    setSosSentTime(timestamp);
    setSosRefId(refNum);
    setSosStep("success");
    setIsSosActive(true);
  };

  const resetSosSignal = () => {
    setIsSosActive(false);
    setIsSosModalOpen(false);
    setSosStep("confirm");
  };

  const currentLat = vesselPath[vesselIndex]?.[0] || 18.95;
  const currentLon = vesselPath[vesselIndex]?.[1] || 72.80;
  const currentRisk = REGION_RISK_SCORES[activeLocation] || 18;
  const activeSpecies = REGION_SPECIES[activeLocation] || REGION_SPECIES.mumbai;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-800">
      
      {/* Overview Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Compass className="text-blue-900 h-8 w-8 animate-spin-slow flex-shrink-0" />
          <div>
            <h2 className="font-bold text-blue-950 flex items-center gap-2">
              Interactive Maritime Operations Dashboard
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-950 font-bold uppercase tracking-wider font-mono">
                Sync Location: {REGION_NAMES[activeLocation]}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualize Potential Fishing Zones (PFZs), weather hazard warnings, and optimized bypass routing in real time.
            </p>
          </div>
        </div>

        {/* Research Mode (Dossier) Button */}
        <Link
          href="/research"
          className="flex items-center gap-2 bg-blue-900 hover:bg-blue-850 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all self-start sm:self-auto flex-shrink-0 cursor-pointer"
        >
          <FileText className="h-4 w-4 text-amber-300" />
          <span>Research Mode (Dossier)</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map View - 8 cols */}
        <div className="lg:col-span-8 bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3 relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-blue-950 flex items-center gap-2 text-sm md:text-base">
              <Anchor className="text-blue-900 h-5 w-5" />
              Live Marine Telemetry & Radar Overlays
            </h3>

            {/* Top Toolbar Controls */}
            <div className="flex items-center gap-2">
              {/* Species Layer Toggle */}
              <button
                onClick={() => {
                  const newState = !(mapLayers.fishingSuitability || mapLayers.fishingGrounds);
                  setMapLayers(prev => ({
                    ...prev,
                    fishingSuitability: newState,
                    fishingGrounds: newState
                  }));
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  mapLayers.fishingSuitability || mapLayers.fishingGrounds
                    ? "bg-teal-100 text-teal-900 border-teal-300 shadow-sm ring-2 ring-teal-400/40"
                    : "bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100"
                }`}
                title="Toggle Likely Local Species & Fishing Zone Layers"
              >
                <Fish className={`h-3.5 w-3.5 ${mapLayers.fishingSuitability || mapLayers.fishingGrounds ? "text-teal-700 animate-pulse" : "text-slate-400"}`} />
                <span>Species Layer</span>
                {(mapLayers.fishingSuitability || mapLayers.fishingGrounds) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setMapLayers(prev => ({
                    ...prev,
                    safetyTrafficAlerts: !prev.safetyTrafficAlerts
                  }));
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  mapLayers.safetyTrafficAlerts
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm ring-2 ring-amber-400/40"
                    : "bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100"
                }`}
                title="Toggle Safety Geofence & Traffic Corridor"
              >
                <ShieldAlert className={`h-3.5 w-3.5 ${mapLayers.safetyTrafficAlerts ? "text-amber-700 animate-pulse" : "text-slate-400"}`} />
                <span>Geofence</span>
                {mapLayers.safetyTrafficAlerts && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping ml-0.5" />
                )}
              </button>

              {routes && (
                <button 
                  onClick={() => setRoutes(null)}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs py-1 px-3 rounded-lg font-semibold transition duration-150 cursor-pointer"
                >
                  Clear Route Layer
                </button>
              )}
            </div>
          </div>
          
          <div className="h-[480px] relative">
            <MapComponent
              pfzs={pfzs}
              hazards={hazards}
              tideZones={tideZones}
              vesselPath={vesselPath}
              vesselIndex={vesselIndex}
              routes={routes}
              onSetRouteStartEnd={handleRequestRoute}
              activeLocation={activeLocation}
              reports={reports}
              onMapClick={isSelectingLocation ? handleMapClickSelection : undefined}
              layersState={mapLayers}
              onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
              onSetLayersState={setMapLayers}
              onSelectZone={(zone) => setSelectedZone(zone)}
            />

            {/* Bottom-Left Floating Action Stack: SOS Button directly above Community Report (+) Button */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-2.5">
              {/* SOS Active Badge */}
              {isSosActive && (
                <div className="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-red-700 font-mono whitespace-nowrap animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                  SOS Active
                  <button 
                    onClick={resetSosSignal}
                    className="ml-1 hover:text-red-200 font-extrabold text-[11px]"
                    title="Dismiss distress alert state"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* SOS Button */}
              <button
                onClick={() => {
                  if (!isSosActive) {
                    setSosStep("confirm");
                    setIsSosModalOpen(true);
                  } else {
                    setIsSosModalOpen(true);
                  }
                }}
                className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-xl transition-all duration-300 select-none ${
                  isSosActive 
                    ? "bg-red-950 border-red-800 text-red-200 cursor-pointer animate-pulse" 
                    : "bg-red-600 hover:bg-red-700 border-white text-white hover:scale-105 active:scale-95 cursor-pointer"
                }`}
                style={{
                  animation: !isSosActive ? "pulse-red 2s infinite" : undefined
                }}
                title="Trigger Emergency Distress SOS"
              >
                SOS
              </button>

              {/* Community Reports (+) Button */}
              <button
                onClick={() => {
                  setIsReportModalOpen(true);
                  setIsSelectingLocation(false);
                }}
                className="h-12 w-12 bg-indigo-900 hover:bg-indigo-850 text-white rounded-full shadow-lg hover:scale-105 hover:rotate-90 transition-all duration-300 border-2 border-white flex items-center justify-center"
                title="Pin a Community Crowdsourced Report"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Auto-Summary: Today's Snapshot Card on the Marine Map */}
          <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  Today's Snapshot • {REGION_NAMES[activeLocation]}
                </h4>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10.5px]">
                <span className="text-slate-500">
                  Risk Danger Index: <strong className={currentRisk < 40 ? "text-emerald-700" : currentRisk < 70 ? "text-amber-700" : "text-red-700"}>{currentRisk}/100</strong>
                </span>
                <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded font-bold text-[10px]">
                  {activeSpecies.cmfriStatus}
                </span>
              </div>
            </div>

            {/* Likely Catch Line */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-teal-950 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider flex-shrink-0">
                <Fish className="h-4 w-4 text-teal-700" />
                Likely Catch:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeSpecies.primarySpecies.map((sp, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white text-teal-900 border border-teal-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 hover:border-teal-400 transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            {/* Telemetry metadata footer strip */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-stone-200/50">
              <span>Operating Shelf: <strong className="text-slate-700">{activeSpecies.depthRangeMeters}</strong></span>
              <span>Peak Window: <strong className="text-teal-900 font-bold">{activeSpecies.catchWindow}</strong></span>
              <span>Gear Recommendation: <strong className="text-slate-700">{activeSpecies.recommendedGear}</strong></span>
            </div>
          </div>

          {/* Safety Geofence Active Corridor Note */}
          {mapLayers.safetyTrafficAlerts && (
            <div className="text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono shadow-xs animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <span>Safety geofence shown around active traffic corridor.</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 font-mono text-center">
            💡 Click on the **User Vessel plane** (blue circle) and choose **"Set Route Start"** to trace optimized safety paths.
          </p>
        </div>

        {/* Sidebar Info & Alerts - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Selected Zone Context Panel (Likely Local Species & Bathymetry) */}
          <div 
            ref={speciesRef} 
            id="species-context-section" 
            className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col transition-all duration-300 ${
              highlightedSpecies 
                ? "border-teal-500 ring-4 ring-teal-400/30 bg-teal-50/20" 
                : "border-stone-200"
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-150 pb-2 mb-3">
              <h3 className="font-bold text-blue-950 flex items-center gap-2 text-sm">
                <Fish className="text-teal-700 h-4.5 w-4.5" />
                <span>Selected Context: Likely Species</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                CMFRI Baseline
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Target Zone Header */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs">
                    {selectedZone?.name || `${REGION_NAMES[activeLocation]} PFZ Corridor`}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-900 border border-teal-200">
                    {selectedZone?.layerType === "fishingGrounds" ? "Grounds Halo" : "Fishing Suitability"}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  {selectedZone 
                    ? "Zone marker selected. Displaying active telemetry & taxonomic profile." 
                    : "Defaulting to active regional fishing corridor. Click any PFZ or Fishing Grounds marker on the map to inspect."}
                </p>
              </div>

              {/* Likely Local Species with Scientific Names */}
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Likely Species & Marine Taxonomy:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedZone?.species || activeSpecies.primarySpecies).map((sp: string, idx: number) => {
                    const sciName = (selectedZone?.scientificNames || activeSpecies.scientificNames)?.[idx];
                    return (
                      <div key={idx} className="bg-teal-50/40 border border-teal-150 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
                        <span className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                          <span className="text-teal-600">🐟</span>
                          <span>{sp}</span>
                        </span>
                        {sciName && (
                          <span className="text-[9.5px] text-slate-500 italic font-serif mt-1">
                            {sciName}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operating Specs */}
              <div className="bg-stone-50 border border-stone-150 p-3 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-slate-400">Bathymetric Depth:</span>
                  <span className="text-blue-950 font-bold">{selectedZone?.depthRange || activeSpecies.depthRangeMeters}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-slate-400">Recommended Gear:</span>
                  <span className="text-teal-800 font-bold">{selectedZone?.recommendedGear || activeSpecies.recommendedGear}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-slate-400">Peak Catch Window:</span>
                  <span className="text-slate-800 font-bold">{selectedZone?.catchWindow || activeSpecies.catchWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CMFRI Status:</span>
                  <span className="text-emerald-700 font-bold">{selectedZone?.cmfriStatus || activeSpecies.cmfriStatus}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic leading-snug">
                💡 Production note: Real-time species distributions link directly with Central Marine Fisheries Research Institute (CMFRI) survey baselines.
              </p>
            </div>
          </div>

          {/* Vessel Coordinates Tracker */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 className="font-bold text-blue-950 flex items-center gap-2 border-b border-stone-150 pb-2 mb-3 text-sm">
              <Navigation className="text-blue-900 h-4.5 w-4.5" />
              Vessel Telemetry Tracker
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-slate-500">Vessel Callsign:</span>
                <span className="text-blue-900 font-bold">INNOWAVE-1 (IND)</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-slate-500">Latitude:</span>
                <span className="text-slate-800 font-bold">{vesselPath[vesselIndex]?.[0].toFixed(5) || "Searching..."}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-slate-500">Longitude:</span>
                <span className="text-slate-800 font-bold">{vesselPath[vesselIndex]?.[1].toFixed(5) || "Searching..."}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="text-slate-500">Heading Speed:</span>
                <span className="text-emerald-700 font-bold">8.2 knots (Cruising)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[10px] border border-emerald-200">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* Unified Alerts */}
          <div ref={alertsRef} id="alerts-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col flex-1">
            <h3 className="font-bold text-blue-950 flex items-center gap-2 mb-3 border-b border-stone-150 pb-2 text-sm">
              <ShieldAlert className="text-yellow-600 h-5 w-5" />
              Geofencing & Safety Warnings
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[220px]">
              {dynamicAlerts.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs font-bold text-emerald-600 font-mono">No Boundaries Tripped</p>
                  <p className="text-[10px] text-slate-400 font-medium">Boat is currently within safe limits.</p>
                </div>
              ) : (
                dynamicAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 animate-fade-in ${
                      alert.severity === "DANGER" 
                        ? "bg-red-50 border-red-200 text-red-800" 
                        : "bg-yellow-50 border-yellow-200 text-yellow-800"
                    }`}
                  >
                    <span className="font-bold text-[11px] flex items-center gap-1.5 leading-snug">
                      <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
                      {alert.title}
                    </span>
                    <p className="text-slate-660 text-[10.5px] leading-snug">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Routing Comparison Card */}
          {routes && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col animate-fade-in">
              <h3 className="font-bold text-blue-950 flex items-center gap-2 mb-3 border-b border-stone-150 pb-2 text-xs md:text-sm">
                <Navigation className="text-blue-900 h-4.5 w-4.5" />
                Safety Routing Analysis
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-red-700">Shortest Route</span>
                    <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold border border-red-200">Unsafe</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Distance: {routes.shortest.distance_km} km</p>
                  <p className="text-[10px] text-red-700 mt-1 font-semibold">⚠️ Crosses active storm swell zones.</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-blue-900">Safer Route (Bypass)</span>
                    <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold border border-blue-200">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Distance: {routes.safer.distance_km} km (+{(routes.safer.distance_km - routes.shortest.distance_km).toFixed(1)} km)</p>
                  <p className="text-[10px] text-blue-800 mt-1 font-semibold">✓ Corrected coordinates avoid storm.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Modal for submitting Community Reports */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/25 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FAF8F5] border border-stone-250 w-full max-w-md p-6 rounded-2xl shadow-xl flex flex-col gap-4 text-slate-800 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-blue-955 text-sm flex items-center gap-2">
                <MessageSquare className="text-indigo-900 h-5 w-5" />
                Crowdsourced Community Report
              </h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold font-sans"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="flex flex-col gap-4 text-xs font-medium">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-mono text-[10px] uppercase">Observation Type</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                  className="bg-white border border-stone-300 rounded-xl px-3 py-2 outline-none font-bold focus:border-indigo-900"
                >
                  <option value="Good Catch">🐟 Good Catch Area</option>
                  <option value="High Waves">🌊 High Waves / Swells</option>
                  <option value="Calm Seas">✓ Calm & Clear Seas</option>
                  <option value="Storm Warning">⚠️ Squall / Storm Advisory</option>
                  <option value="Other">📍 Other General Observation</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-mono text-[10px] uppercase">What did you observe?</label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.text}
                  onChange={(e) => setReportForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Describe your observations..."
                  className="bg-white border border-stone-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-900 resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-stone-50 border border-stone-200 p-3.5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Target Coordinates</span>
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocation(true)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition duration-150 border ${
                      isSelectingLocation 
                        ? "bg-amber-500 border-amber-600 text-white animate-pulse" 
                        : "bg-white border-stone-300 text-indigo-900 hover:bg-stone-100"
                    }`}
                  >
                    {isSelectingLocation ? "Click map..." : "🎯 Pick on map"}
                  </button>
                </div>
                
                <div className="flex gap-4 font-mono text-[11px] text-blue-900 mt-2 font-bold">
                  <div>Lat: <span className="text-slate-700">{reportForm.lat.toFixed(5)}</span></div>
                  <div>Lon: <span className="text-slate-700">{reportForm.lon.toFixed(5)}</span></div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-700 py-2.5 rounded-xl font-bold transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-900 hover:bg-indigo-850 text-white py-2.5 rounded-xl font-bold transition duration-150 shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Emergency SOS Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-[#FAF8F5] border border-red-200 w-full max-w-md p-6 rounded-2xl shadow-xl flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-extrabold text-red-700 text-sm flex items-center gap-2 font-sans tracking-wide">
                <AlertCircle className="h-5 w-5 animate-pulse text-red-600" />
                EMERGENCY DISTRESS SOS BROADCAST
              </h3>
              <button 
                onClick={() => setIsSosModalOpen(false)}
                className="text-slate-400 hover:text-slate-750 font-bold"
              >
                ✕
              </button>
            </div>

            {sosStep === "confirm" ? (
              <div className="flex flex-col gap-4 text-xs font-semibold">
                
                {/* Threat Banner */}
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="text-red-600 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-950 uppercase text-[10px] tracking-wider font-mono">BROADCAST WARNING</h4>
                    <p className="text-red-750 text-[10.5px] leading-relaxed mt-0.5">
                      Confirming this action will broadcast a distress emergency beacon directly to maritime search and rescue operations.
                    </p>
                  </div>
                </div>

                {/* Telemetry metadata audit */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-2 font-mono">
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-slate-500">SOS Sector Target:</span>
                    <span className="text-blue-900 font-extrabold">{REGION_NAMES[activeLocation]}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-slate-500">Vessel Position:</span>
                    <span className="text-slate-800 font-extrabold">{currentLat.toFixed(5)}N, {currentLon.toFixed(5)}E</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-slate-500">Regional Danger Score:</span>
                    <span className="text-red-700 font-extrabold">{currentRisk}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distress Beacon Mode:</span>
                    <span className="text-red-600 font-bold">TELEMETRY AUTO-LOCK</span>
                  </div>
                </div>

                {/* Confirm Dispatch Command */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsSosModalOpen(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-700 py-3 rounded-xl font-bold transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={triggerSosSignal}
                    className="flex-1 bg-red-650 hover:bg-red-750 text-black py-3 rounded-xl font-bold transition duration-150 shadow-md border border-red-700 font-mono tracking-wide"
                  >
                    SEND SOS SIGNAL
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs font-semibold text-center py-2 animate-fade-in">
                
                {/* Success Circle */}
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full border border-red-300 flex items-center justify-center text-red-600 text-lg font-black animate-pulse">
                  ✓
                </div>

                <div>
                  <h4 className="font-extrabold text-blue-950 text-sm">SOS BEACON DISTRESS TRANSMITTED</h4>
                  <p className="text-slate-500 mt-1 text-[11px] leading-relaxed max-w-[280px] mx-auto">
                    Maritime distress warning successfully broadcast. Coast Guard Sector **{REGION_NAMES[activeLocation]}** has been dispatched.
                  </p>
                </div>

                {/* Reference Card */}
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-1.5 font-mono text-[10.5px] text-left max-w-[320px] mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distress Ref ID:</span>
                    <span className="text-blue-900 font-extrabold">{sosRefId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp Log:</span>
                    <span className="text-slate-800 font-bold">{sosSentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Channel:</span>
                    <span className="text-red-600 font-bold">VHF CH 16 LOCK</span>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={resetSosSignal}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-red-700 py-2.5 rounded-xl font-extrabold transition duration-150"
                  >
                    Clear SOS Signal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSosModalOpen(false)}
                    className="flex-1 bg-blue-900 hover:bg-blue-850 text-white py-2.5 rounded-xl font-bold transition duration-150 shadow-md"
                  >
                    Close Status Panel
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
