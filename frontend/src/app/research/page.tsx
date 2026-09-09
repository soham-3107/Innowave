"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Sparkles, 
  Download, 
  Upload, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Waves, 
  Wind, 
  Fish, 
  BrainCircuit, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  RefreshCw,
  Clock,
  MapPin,
  Eye
} from "lucide-react";
import { REGION_SPECIES } from "@/data/speciesData";

interface ResearchReport {
  reportId: string;
  generatedAt: string;
  region: string;
  regionName: string;
  coordinates: { lat: number; lon: number };
  executiveSummary: string;
  weather: {
    windSpeed: number;
    windDirection: string;
    condition: string;
    temperature: number;
    barometerHpa: number;
    visibilityKm: number;
    gustRisk: string;
  };
  ocean: {
    waveHeight: number;
    sst: number;
    swellPeriod: number;
    seaState: string;
    currentSpeed: number;
    tideHigh: string;
    tideLow: string;
  };
  satellite: {
    chlorophyll: number;
    sstAnomaly: number;
    pfzStatus: string;
    planktonDensity: string;
    catchLikelihoodPct: number;
    targetSpecies: string[];
  };
  speciesInfo?: {
    primarySpecies: string[];
    scientificNames: string[];
    depthRangeMeters: string;
    recommendedGear: string;
    catchWindow: string;
    cmfriStatus: string;
    chlorophyllFront?: string;
  };
  risk: {
    dangerScore: number;
    dangerLevel: "SAFE" | "CAUTION" | "DANGER";
    imblDistanceKm: number;
    closestRestrictedZone: string;
    restrictedDistKm: number;
    hazardNotes: string;
  };
  communityReports: {
    type: string;
    text: string;
    timestamp: string;
  }[];
  trendProjection: {
    day: string;
    catchPct: number;
    waveHeight: number;
  }[];
}

const REGION_NAMES: Record<string, string> = {
  mumbai: "Mumbai Coast",
  goa: "Goa Coast",
  kochi: "Kochi Coast",
  chennai: "Chennai Coast",
  veraval: "Veraval / Gujarat Coast",
  vizag: "Visakhapatnam Coast"
};

const REGION_DATABASE: Record<string, Omit<ResearchReport, "reportId" | "generatedAt" | "executiveSummary">> = {
  mumbai: {
    region: "mumbai",
    regionName: "Mumbai Coast",
    coordinates: { lat: 18.95, lon: 72.80 },
    weather: {
      windSpeed: 12.5,
      windDirection: "WSW",
      condition: "Partly Cloudy",
      temperature: 29.5,
      barometerHpa: 1012,
      visibilityKm: 12,
      gustRisk: "Low"
    },
    ocean: {
      waveHeight: 1.2,
      sst: 28.2,
      swellPeriod: 8.0,
      seaState: "Slightly Rough",
      currentSpeed: 0.6,
      tideHigh: "05:42 AM (3.8m)",
      tideLow: "11:58 AM (1.1m)"
    },
    satellite: {
      chlorophyll: 4.8,
      sstAnomaly: 0.4,
      pfzStatus: "High Potential Zone",
      planktonDensity: "High",
      catchLikelihoodPct: 78,
      targetSpecies: ["Indian Mackerel", "Bombay Duck", "Silver Pomfret"]
    },
    risk: {
      dangerScore: 18,
      dangerLevel: "SAFE",
      imblDistanceKm: 320.0,
      closestRestrictedZone: "Naval Dockyard Zone",
      restrictedDistKm: 8.5,
      hazardNotes: "Commercial navigation corridor active. Naval dockyard prohibited zone 8.5km east."
    },
    communityReports: [
      { type: "Good Catch", text: "Spotted large school of mackerel 12km out.", timestamp: "2 hours ago" },
      { type: "Calm Seas", text: "Calm sea conditions beyond harbor boundary line.", timestamp: "6 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 70, waveHeight: 1.6 },
      { day: "Tue", catchPct: 65, waveHeight: 1.8 },
      { day: "Wed", catchPct: 74, waveHeight: 1.4 },
      { day: "Thu", catchPct: 78, waveHeight: 1.2 },
      { day: "Fri", catchPct: 82, waveHeight: 1.0 },
      { day: "Sat", catchPct: 85, waveHeight: 0.9 },
      { day: "Sun", catchPct: 88, waveHeight: 0.8 }
    ]
  },
  goa: {
    region: "goa",
    regionName: "Goa Coast",
    coordinates: { lat: 15.49, lon: 73.82 },
    weather: {
      windSpeed: 9.8,
      windDirection: "NW",
      condition: "Sunny and Clear",
      temperature: 30.2,
      barometerHpa: 1013,
      visibilityKm: 16,
      gustRisk: "Negligible"
    },
    ocean: {
      waveHeight: 0.8,
      sst: 28.5,
      swellPeriod: 7.2,
      seaState: "Calm",
      currentSpeed: 0.4,
      tideHigh: "06:15 AM (1.8m)",
      tideLow: "12:20 PM (0.3m)"
    },
    satellite: {
      chlorophyll: 5.1,
      sstAnomaly: 0.6,
      pfzStatus: "High Potential Zone",
      planktonDensity: "High",
      catchLikelihoodPct: 85,
      targetSpecies: ["Oil Sardines", "Kingfish", "Squid"]
    },
    risk: {
      dangerScore: 15,
      dangerLevel: "SAFE",
      imblDistanceKm: 380.0,
      closestRestrictedZone: "Mormugao Port Limit",
      restrictedDistKm: 11.5,
      hazardNotes: "Open coastal waters, optimal navigational safety and low wave swell."
    },
    communityReports: [
      { type: "Calm Seas", text: "Calm and clear seas today, perfect for fishing.", timestamp: "5 hours ago" },
      { type: "Good Catch", text: "Bountiful sardine schools observed around 15.49N.", timestamp: "8 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 80, waveHeight: 1.1 },
      { day: "Tue", catchPct: 82, waveHeight: 0.9 },
      { day: "Wed", catchPct: 84, waveHeight: 0.8 },
      { day: "Thu", catchPct: 85, waveHeight: 0.8 },
      { day: "Fri", catchPct: 88, waveHeight: 0.7 },
      { day: "Sat", catchPct: 90, waveHeight: 0.6 },
      { day: "Sun", catchPct: 92, waveHeight: 0.6 }
    ]
  },
  kochi: {
    region: "kochi",
    regionName: "Kochi Coast",
    coordinates: { lat: 9.93, lon: 76.15 },
    weather: {
      windSpeed: 28.0,
      windDirection: "SW",
      condition: "Heavy Thunderstorms",
      temperature: 27.8,
      barometerHpa: 998,
      visibilityKm: 4,
      gustRisk: "Extreme Squall"
    },
    ocean: {
      waveHeight: 3.8,
      sst: 29.0,
      swellPeriod: 11.5,
      seaState: "Very Rough",
      currentSpeed: 1.8,
      tideHigh: "04:12 AM (1.4m)",
      tideLow: "10:30 AM (0.4m)"
    },
    satellite: {
      chlorophyll: 1.2,
      sstAnomaly: 1.2,
      pfzStatus: "Low Potential Zone",
      planktonDensity: "Moderate",
      catchLikelihoodPct: 24,
      targetSpecies: ["Coastal Anchovies"]
    },
    risk: {
      dangerScore: 85,
      dangerLevel: "DANGER",
      imblDistanceKm: 210.0,
      closestRestrictedZone: "Cochin Naval Base Limit",
      restrictedDistKm: 4.2,
      hazardNotes: "Active cyclonic squall cell. High risk of vessel capsizing. Small craft advisory active."
    },
    communityReports: [
      { type: "Storm Warning", text: "Sudden strong winds and dark storm clouds forming.", timestamp: "1 hour ago" },
      { type: "Storm Warning", text: "Severe squall alert issued by local harbor master.", timestamp: "3 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 15, waveHeight: 4.5 },
      { day: "Tue", catchPct: 18, waveHeight: 4.1 },
      { day: "Wed", catchPct: 20, waveHeight: 3.9 },
      { day: "Thu", catchPct: 24, waveHeight: 3.8 },
      { day: "Fri", catchPct: 35, waveHeight: 3.2 },
      { day: "Sat", catchPct: 45, waveHeight: 2.5 },
      { day: "Sun", catchPct: 58, waveHeight: 2.0 }
    ]
  },
  chennai: {
    region: "chennai",
    regionName: "Chennai Coast",
    coordinates: { lat: 13.08, lon: 80.30 },
    weather: {
      windSpeed: 14.2,
      windDirection: "ENE",
      condition: "Overcast",
      temperature: 31.0,
      barometerHpa: 1009,
      visibilityKm: 10,
      gustRisk: "Moderate"
    },
    ocean: {
      waveHeight: 1.6,
      sst: 29.5,
      swellPeriod: 8.5,
      seaState: "Moderate",
      currentSpeed: 0.8,
      tideHigh: "06:30 AM (1.2m)",
      tideLow: "12:45 PM (0.2m)"
    },
    satellite: {
      chlorophyll: 3.1,
      sstAnomaly: 0.2,
      pfzStatus: "Moderate Potential Zone",
      planktonDensity: "Moderate",
      catchLikelihoodPct: 62,
      targetSpecies: ["Red Snapper", "Trevally", "Cuttlefish"]
    },
    risk: {
      dangerScore: 32,
      dangerLevel: "SAFE",
      imblDistanceKm: 145.0,
      closestRestrictedZone: "Port Trust Geofence",
      restrictedDistKm: 6.8,
      hazardNotes: "Commercial traffic channel. Normal operations outside container berths."
    },
    communityReports: [
      { type: "Other", text: "Steady east-northeasterly swells, local fleet operating normally.", timestamp: "4 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 55, waveHeight: 1.9 },
      { day: "Tue", catchPct: 58, waveHeight: 1.8 },
      { day: "Wed", catchPct: 60, waveHeight: 1.7 },
      { day: "Thu", catchPct: 62, waveHeight: 1.6 },
      { day: "Fri", catchPct: 68, waveHeight: 1.4 },
      { day: "Sat", catchPct: 72, waveHeight: 1.2 },
      { day: "Sun", catchPct: 75, waveHeight: 1.1 }
    ]
  },
  veraval: {
    region: "veraval",
    regionName: "Veraval / Gujarat Coast",
    coordinates: { lat: 20.90, lon: 70.37 },
    weather: {
      windSpeed: 18.0,
      windDirection: "W",
      condition: "Breezy and Hazy",
      temperature: 28.6,
      barometerHpa: 1008,
      visibilityKm: 9,
      gustRisk: "Moderate Gusts"
    },
    ocean: {
      waveHeight: 2.2,
      sst: 27.2,
      swellPeriod: 9.0,
      seaState: "Rough",
      currentSpeed: 0.9,
      tideHigh: "07:10 AM (2.8m)",
      tideLow: "13:20 PM (0.8m)"
    },
    satellite: {
      chlorophyll: 6.2,
      sstAnomaly: -0.2,
      pfzStatus: "Very High Potential Zone",
      planktonDensity: "Very High",
      catchLikelihoodPct: 91,
      targetSpecies: ["Yellowfin Tuna", "Ribbon Fish", "Hilsa"]
    },
    risk: {
      dangerScore: 48,
      dangerLevel: "CAUTION",
      imblDistanceKm: 78.0,
      closestRestrictedZone: "Sensitive Boundary Buffer",
      restrictedDistKm: 12.0,
      hazardNotes: "Caution: 78km from International Maritime Boundary Line. Coast Guard patrol area."
    },
    communityReports: [
      { type: "Good Catch", text: "Rich plankton density, caught massive haul of tuna.", timestamp: "6 hours ago" },
      { type: "High Waves", text: "Noticeable cross swells, stay within 20nm zone.", timestamp: "9 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 84, waveHeight: 2.6 },
      { day: "Tue", catchPct: 86, waveHeight: 2.4 },
      { day: "Wed", catchPct: 88, waveHeight: 2.3 },
      { day: "Thu", catchPct: 91, waveHeight: 2.2 },
      { day: "Fri", catchPct: 93, waveHeight: 2.0 },
      { day: "Sat", catchPct: 95, waveHeight: 1.8 },
      { day: "Sun", catchPct: 96, waveHeight: 1.6 }
    ]
  },
  vizag: {
    region: "vizag",
    regionName: "Visakhapatnam Coast",
    coordinates: { lat: 17.68, lon: 83.30 },
    weather: {
      windSpeed: 11.0,
      windDirection: "S",
      condition: "Clear skies with light haze",
      temperature: 30.8,
      barometerHpa: 1011,
      visibilityKm: 14,
      gustRisk: "Low"
    },
    ocean: {
      waveHeight: 1.1,
      sst: 28.8,
      swellPeriod: 7.8,
      seaState: "Slight",
      currentSpeed: 0.5,
      tideHigh: "05:15 AM (1.6m)",
      tideLow: "11:30 AM (0.3m)"
    },
    satellite: {
      chlorophyll: 5.5,
      sstAnomaly: 0.3,
      pfzStatus: "High Potential Zone",
      planktonDensity: "High",
      catchLikelihoodPct: 82,
      targetSpecies: ["Seer Fish (Surmai)", "Tiger Prawns", "Mackerel"]
    },
    risk: {
      dangerScore: 22,
      dangerLevel: "SAFE",
      imblDistanceKm: 420.0,
      closestRestrictedZone: "Eastern Naval Command Buffer",
      restrictedDistKm: 5.0,
      hazardNotes: "Deep-water port limits active. Military exercises restricted to outer sector."
    },
    communityReports: [
      { type: "Good Catch", text: "Excellent water visibility, good catch near harbor channel.", timestamp: "4 hours ago" }
    ],
    trendProjection: [
      { day: "Mon", catchPct: 75, waveHeight: 1.4 },
      { day: "Tue", catchPct: 78, waveHeight: 1.3 },
      { day: "Wed", catchPct: 80, waveHeight: 1.2 },
      { day: "Thu", catchPct: 82, waveHeight: 1.1 },
      { day: "Fri", catchPct: 85, waveHeight: 1.0 },
      { day: "Sat", catchPct: 87, waveHeight: 0.9 },
      { day: "Sun", catchPct: 90, waveHeight: 0.8 }
    ]
  }
};

export default function ResearchModePage() {
  const [activeLocation, setActiveLocation] = useState("mumbai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<ResearchReport | null>(null);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active location from localStorage and header changes
  useEffect(() => {
    const updateLocation = () => {
      const saved = localStorage.getItem("innowave-active-location") || localStorage.getItem("orca-active-location");
      if (saved && REGION_NAMES[saved]) {
        setActiveLocation(saved);
      }
    };

    updateLocation();

    const handleCustomLocation = (e: any) => {
      if (e.detail && REGION_NAMES[e.detail]) {
        setActiveLocation(e.detail);
      } else {
        updateLocation();
      }
    };

    window.addEventListener("innowave-location-changed", handleCustomLocation);
    window.addEventListener("orca-location-changed", handleCustomLocation);
    window.addEventListener("storage", updateLocation);
    return () => {
      window.removeEventListener("innowave-location-changed", handleCustomLocation);
      window.removeEventListener("orca-location-changed", handleCustomLocation);
      window.removeEventListener("storage", updateLocation);
    };
  }, []);

  // Update location selector and sync with localStorage
  const handleLocationChange = (loc: string) => {
    setActiveLocation(loc);
    localStorage.setItem("innowave-active-location", loc);
    localStorage.setItem("orca-active-location", loc);
    window.dispatchEvent(new CustomEvent("innowave-location-changed", { detail: loc }));
    window.dispatchEvent(new CustomEvent("orca-location-changed", { detail: loc }));
    setImportedStatus(null);
  };

  // Compile a comprehensive written summary
  const generateReportForRegion = (locKey: string, isAuto = false) => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = REGION_DATABASE[locKey] || REGION_DATABASE.mumbai;
      const speciesData = REGION_SPECIES[locKey] || REGION_SPECIES.mumbai;
      const now = new Date();
      const dateString = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });

      const summaryText = `Scientific Marine Intelligence Summary compiled for ${data.regionName} on ${dateString} at ${timeString}. Oceanic parameters indicate sea surface temperature measuring ${data.ocean.sst}°C with chlorophyll-a density concentration at ${data.satellite.chlorophyll} mg/m³ (${data.satellite.pfzStatus}). Atmospheric surface winds evaluate at ${data.weather.windSpeed} knots (${data.weather.windDirection}) yielding swell wave heights of ${data.ocean.waveHeight}m. Overall multi-agent safety classification ranks as ${data.risk.dangerLevel} with a composite threat index of ${data.risk.dangerScore}/100. Target species profile (${speciesData.cmfriStatus}): ${speciesData.primarySpecies.join(", ")}.`;

      const report: ResearchReport = {
        reportId: `INNOWAVE-RES-${locKey.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        generatedAt: `${dateString} • ${timeString}`,
        region: locKey,
        regionName: data.regionName,
        coordinates: data.coordinates,
        executiveSummary: summaryText,
        weather: data.weather,
        ocean: data.ocean,
        satellite: data.satellite,
        speciesInfo: {
          primarySpecies: speciesData.primarySpecies,
          scientificNames: speciesData.scientificNames,
          depthRangeMeters: speciesData.depthRangeMeters,
          recommendedGear: speciesData.recommendedGear,
          catchWindow: speciesData.catchWindow,
          cmfriStatus: speciesData.cmfriStatus,
          chlorophyllFront: speciesData.chlorophyllFront
        },
        risk: data.risk,
        communityReports: data.communityReports,
        trendProjection: data.trendProjection
      };

      setCurrentReport(report);
      setIsGenerating(false);
      if (!isAuto) {
        setImportedStatus(null);
      }
    }, 450);
  };

  // Auto-generate report on first load
  useEffect(() => {
    if (!currentReport) {
      generateReportForRegion(activeLocation, true);
    }
  }, [activeLocation]);

  // Export as CSV
  const handleExportCSV = () => {
    if (!currentReport) return;
    const speciesList = currentReport.speciesInfo?.primarySpecies || currentReport.satellite.targetSpecies;
    const sciTaxa = currentReport.speciesInfo?.scientificNames || [];
    const rows = [
      ["Category", "Parameter", "Value", "Unit", "Classification/Notes"],
      ["Header", "Report ID", currentReport.reportId, "ID", "Generated by INNOWAVE Multi-Agent Network"],
      ["Header", "Timestamp", currentReport.generatedAt, "DateTime", "Standard Marine Timestamp"],
      ["Header", "Location", currentReport.regionName, "Region", `Coords: ${currentReport.coordinates.lat}N, ${currentReport.coordinates.lon}E`],
      ["Atmospheric", "Wind Speed", currentReport.weather.windSpeed.toString(), "knots", currentReport.weather.windDirection],
      ["Atmospheric", "Condition", currentReport.weather.condition, "Text", `Visibility: ${currentReport.weather.visibilityKm} km`],
      ["Atmospheric", "Air Temperature", currentReport.weather.temperature.toString(), "°C", `Barometer: ${currentReport.weather.barometerHpa} hPa`],
      ["Atmospheric", "Gust Risk", currentReport.weather.gustRisk, "Level", "Sustained Vector Forecast"],
      ["Hydrodynamic", "Wave Height", currentReport.ocean.waveHeight.toString(), "meters", currentReport.ocean.seaState],
      ["Hydrodynamic", "Sea Surface Temp", currentReport.ocean.sst.toString(), "°C", `Anomaly: +${currentReport.satellite.sstAnomaly}°C`],
      ["Hydrodynamic", "Current Speed", currentReport.ocean.currentSpeed.toString(), "knots", "Surface drift rate"],
      ["Hydrodynamic", "Tidal Peaks", `High: ${currentReport.ocean.tideHigh}`, "Time/Height", `Low: ${currentReport.ocean.tideLow}`],
      ["Biochemical", "Chlorophyll-a", currentReport.satellite.chlorophyll.toString(), "mg/m³", currentReport.satellite.pfzStatus],
      ["Biochemical", "Plankton Density", currentReport.satellite.planktonDensity, "Level", "Satellite Synthetic Aperture Scan"],
      ["Biochemical", "Catch Likelihood", `${currentReport.satellite.catchLikelihoodPct}%`, "Probability", `Primary Targets: ${speciesList.join("; ")}`],
      ["Biochemical", "Likely Local Species", speciesList.join("; "), "Species List", `CMFRI Assessment: ${currentReport.speciesInfo?.cmfriStatus || "Active"}`],
      ["Biochemical", "Scientific Taxonomy", sciTaxa.join("; "), "Nomenclature", "Binomial Species Names"],
      ["Biochemical", "Operating Bathymetry", currentReport.speciesInfo?.depthRangeMeters || "Shelf Contours", "Depth", `Gear: ${currentReport.speciesInfo?.recommendedGear || "Pelagic Drift Nets"}`],
      ["Biochemical", "Optimal Catch Window", currentReport.speciesInfo?.catchWindow || "Morning", "Window", "Peak Shoaling Period"],
      ["Maritime Risk", "Danger Score", `${currentReport.risk.dangerScore}/100`, "Index", currentReport.risk.dangerLevel],
      ["Maritime Risk", "Distance to IMBL", currentReport.risk.imblDistanceKm.toString(), "km", "Territorial Waters Limit"],
      ["Maritime Risk", "Closest Buffer", currentReport.risk.closestRestrictedZone, "Name", `${currentReport.risk.restrictedDistKm} km separation`],
      ["Community", "Total Reports", currentReport.communityReports.length.toString(), "Entries", currentReport.communityReports.map(r => `[${r.type}] ${r.text}`).join(" | ")],
      ["Attribution", "Data Sources Note", "CMFRI Survey Baseline", "Attribution", "In operational production, species distribution and pelagic biomass models are integrated with live CMFRI (Central Marine Fisheries Research Institute) data rather than static mapping."]
    ];

    const csvContent = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marine_research_${currentReport.region}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger File Import Dialog
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  // Process File Upload (JSON or CSV)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isJson = file.name.endsWith(".json");
    const isCsv = file.name.endsWith(".csv");

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        if (isJson) {
          const parsed = JSON.parse(text);
          if (parsed.reportId && parsed.region && parsed.weather && parsed.ocean) {
            setCurrentReport(parsed);
            setActiveLocation(parsed.region);
            setImportedStatus(`Loaded JSON Archive: "${file.name}"`);
          } else {
            alert("Uploaded JSON does not contain valid research session schema.");
          }
        } else if (isCsv) {
          // Parse CSV key values
          const lines = text.split("\n");
          let locKey = activeLocation;
          for (const line of lines) {
            if (line.includes("Location")) {
              for (const [key, val] of Object.entries(REGION_NAMES)) {
                if (line.toLowerCase().includes(val.toLowerCase()) || line.toLowerCase().includes(key)) {
                  locKey = key;
                  break;
                }
              }
            }
          }
          generateReportForRegion(locKey);
          setImportedStatus(`Loaded CSV Archive: "${file.name}" (repopulated parameters)`);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse the uploaded file. Ensure it is a valid JSON or CSV research export.");
      }
    };

    reader.readAsText(file);
    // Reset file input value so user can upload the same file again if desired
    e.target.value = "";
  };

  // Copy report summary text to clipboard
  const handleCopy = () => {
    if (!currentReport) return;
    const speciesList = currentReport.speciesInfo?.primarySpecies || currentReport.satellite.targetSpecies;
    const taxaList = currentReport.speciesInfo?.scientificNames || [];
    const fullText = `
${currentReport.regionName.toUpperCase()} — MARINE CONDITIONS RESEARCH DOSSIER
Document ID: ${currentReport.reportId}
Generated: ${currentReport.generatedAt}

EXECUTIVE SUMMARY:
${currentReport.executiveSummary}

1. ATMOSPHERIC & WEATHER
• Wind Speed: ${currentReport.weather.windSpeed} knots (${currentReport.weather.windDirection})
• Skies: ${currentReport.weather.condition}
• Temperature: ${currentReport.weather.temperature}°C (Barometer: ${currentReport.weather.barometerHpa} hPa)
• Gust Risk: ${currentReport.weather.gustRisk}

2. OCEANOGRAPHIC & SWELL STATE
• Wave Swell Height: ${currentReport.ocean.waveHeight}m (${currentReport.ocean.seaState})
• Sea Surface Temperature: ${currentReport.ocean.sst}°C (Anomaly: +${currentReport.satellite.sstAnomaly}°C)
• Surface Current: ${currentReport.ocean.currentSpeed} knots
• Tidal Peaks: High Tide ${currentReport.ocean.tideHigh} | Low Tide ${currentReport.ocean.tideLow}

3. POTENTIAL FISHING ZONES (PFZ) & BIOMASS
• Chlorophyll-a: ${currentReport.satellite.chlorophyll} mg/m³ (${currentReport.satellite.pfzStatus})
• Plankton Density: ${currentReport.satellite.planktonDensity}
• Catch Likelihood: ${currentReport.satellite.catchLikelihoodPct}%
• Prime Target Species: ${currentReport.satellite.targetSpecies.join(", ")}

4. SPECIES OBSERVED & EXPECTED (CMFRI BASELINE)
• Likely Local Species: ${speciesList.join(", ")}
• Scientific Taxa: ${taxaList.join(", ")}
• Operating Depth Contours: ${currentReport.speciesInfo?.depthRangeMeters || "15 - 45m Shelf Contours"}
• Recommended Gear: ${currentReport.speciesInfo?.recommendedGear || "Pelagic Drift Nets & Gillnets"}
• Peak Catch Window: ${currentReport.speciesInfo?.catchWindow || "Early Morning"}
• CMFRI Classification: ${currentReport.speciesInfo?.cmfriStatus || "High Pelagic Biomass Zone"}
*(Production Note: In live deployment, species distributions are populated directly via CMFRI survey integrations)*

5. MARITIME SAFETY & RISK
• Danger Score: ${currentReport.risk.dangerScore}/100 (${currentReport.risk.dangerLevel})
• Distance to IMBL Boundary: ${currentReport.risk.imblDistanceKm} km
• Closest Restricted Area: ${currentReport.risk.closestRestrictedZone} (${currentReport.risk.restrictedDistKm} km)
• Safety Notes: ${currentReport.risk.hazardNotes}

6. CROWDSOURCED COMMUNITY OBSERVATIONS (${currentReport.communityReports.length} logs)
${currentReport.communityReports.map(r => `• [${r.type}] "${r.text}" (${r.timestamp})`).join("\n")}

Powered by INNOWAVE Multi-Agent Network (CMFRI Baseline Model Active)
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-800">
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json,.csv" 
        className="hidden" 
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-blue-900 text-white p-3 rounded-xl shadow-md flex-shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-blue-950 text-lg md:text-xl tracking-tight">
                Research Mode: Scientific Marine Dossier
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold font-mono">
                Multi-Agent Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Draft comprehensive mission research summaries, export structured data packages, and import past session archives.
            </p>
          </div>
        </div>

        {/* Global Location Selector */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-1.5 rounded-xl self-start md:self-auto">
          <MapPin className="h-4 w-4 text-blue-900 ml-1 flex-shrink-0" />
          <select
            value={activeLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-950 focus:outline-none cursor-pointer pr-2"
          >
            {Object.entries(REGION_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] border border-stone-200/80 p-3 rounded-2xl shadow-xs">
        {/* Left: Drafting Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateReportForRegion(activeLocation)}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-850 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>{isGenerating ? "Compiling Agents..." : "Generate Research Summary"}</span>
          </button>
        </div>

        {/* Center: Import Status Indicator */}
        {importedStatus && (
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{importedStatus}</span>
          </div>
        )}

        {/* Right: Export & Import Actions */}
        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={!currentReport}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold shadow-xs hover:border-blue-900/30 transition-all cursor-pointer disabled:opacity-40"
            title="Download telemetry tables as CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          {/* Import Session Button */}
          <button
            onClick={handleTriggerImport}
            className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-850 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Upload a previously saved JSON or CSV file to restore session"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Session</span>
          </button>
        </div>
      </div>

      {/* Main Combined Research Panel */}
      {currentReport && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          {/* Panel Top Metadata Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-150 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md">
                  {currentReport.reportId}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentReport.generatedAt}
                </span>
              </div>
              <h3 className="font-extrabold text-blue-950 text-lg md:text-xl mt-1">
                Marine Conditions Report: {currentReport.regionName}
              </h3>
            </div>

            {/* Dossier Report & Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg bg-white text-blue-950 shadow-xs font-bold transition-all cursor-default"
                >
                  Dossier Report
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Copy entire formatted text report to clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FAF8F5] border border-stone-200/80 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Multi-Agent Safety</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-extrabold text-sm md:text-base text-blue-950">
                  {currentReport.risk.dangerScore}/100
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                    currentReport.risk.dangerLevel === "SAFE"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentReport.risk.dangerLevel === "CAUTION"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentReport.risk.dangerLevel}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200/80 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Swell Wave Height</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-extrabold text-sm md:text-base text-blue-950">
                  {currentReport.ocean.waveHeight}m
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                  {currentReport.ocean.seaState}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200/80 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Surface Winds</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-extrabold text-sm md:text-base text-blue-950">
                  {currentReport.weather.windSpeed} kts
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                  {currentReport.weather.windDirection}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200/80 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Chlorophyll Density</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-extrabold text-sm md:text-base text-emerald-800">
                  {currentReport.satellite.chlorophyll} mg/m³
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {currentReport.satellite.catchLikelihoodPct}% Catch
                </span>
              </div>
            </div>
          </div>

          {/* Formatted Scientific Dossier */}
          <div className="flex flex-col gap-5 text-slate-700 text-xs leading-relaxed">
              {/* Executive Summary Callout */}
              <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-2xl">
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>📋</span> Executive Operational Summary
                </h4>
                <p className="text-slate-700 leading-relaxed font-sans text-xs">
                  {currentReport.executiveSummary}
                </p>
              </div>

              {/* Section 1: Weather */}
              <div className="border border-stone-150 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Wind className="h-4 w-4 text-orange-600" />
                  <span>1. Atmospheric Dynamics & Wind Analysis</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Sustained Wind Speed:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.weather.windSpeed} knots</strong> ({currentReport.weather.windDirection})
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Cloud & Sky State:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.weather.condition}</strong> (Temp: {currentReport.weather.temperature}°C)
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Barometer & Visibility:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.weather.barometerHpa} hPa</strong> • {currentReport.weather.visibilityKm} km visibility
                  </div>
                </div>
                <p className="text-slate-600 mt-1">
                  Weather models register <strong>{currentReport.weather.gustRisk}</strong> squall probability over the shelf. Barometric pressures remain steady.
                </p>
              </div>

              {/* Section 2: Ocean */}
              <div className="border border-stone-150 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Waves className="h-4 w-4 text-blue-700" />
                  <span>2. Oceanographic & Hydrodynamic Profile</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Significant Wave Height:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.ocean.waveHeight} meters</strong> ({currentReport.ocean.seaState})
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Sea Surface Temperature (SST):</span>
                    <strong className="text-blue-950 text-xs">{currentReport.ocean.sst}°C</strong> (Anomaly: +{currentReport.satellite.sstAnomaly}°C)
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Tidal Schedule:</span>
                    <strong className="text-blue-950 text-xs">High: {currentReport.ocean.tideHigh}</strong> | Low: {currentReport.ocean.tideLow}
                  </div>
                </div>
                <p className="text-slate-600 mt-1">
                  Dominant swell periodicity evaluated at <strong>{currentReport.ocean.swellPeriod}s</strong> with surface currents moving at <strong>{currentReport.ocean.currentSpeed} knots</strong>.
                </p>
              </div>

              {/* Section 3: Fishing Zones */}
              <div className="border border-stone-150 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Fish className="h-4 w-4 text-emerald-700" />
                  <span>3. Potential Fishing Zones (PFZ) & Marine Biomass</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Chlorophyll-a Concentration:</span>
                    <strong className="text-emerald-800 text-xs">{currentReport.satellite.chlorophyll} mg/m³</strong> ({currentReport.satellite.pfzStatus})
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Catch Likelihood Metric:</span>
                    <strong className="text-emerald-800 text-xs">{currentReport.satellite.catchLikelihoodPct}%</strong> modeled probability
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Prime Target Species:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.satellite.targetSpecies.join(", ")}</strong>
                  </div>
                </div>
                <p className="text-slate-600 mt-1">
                  Synthetic aperture and thermal imagery correlate ocean fronts with thermal gradients favorable for pelagic drift netting and line casting.
                </p>
              </div>

              {/* Section 4: Species Observed & Expected (CMFRI Baseline) */}
              {currentReport.speciesInfo && (
                <div className="border border-teal-200/80 bg-teal-50/25 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-150 pb-2">
                    <h4 className="font-extrabold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Fish className="h-4 w-4 text-teal-700" />
                      <span>4. Species Observed & Expected (CMFRI Baseline)</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100/90 text-teal-900 border border-teal-200">
                      {currentReport.speciesInfo.cmfriStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {currentReport.speciesInfo.primarySpecies.map((species, i) => {
                      const sciName = currentReport.speciesInfo?.scientificNames[i] || "";
                      return (
                        <div key={i} className="bg-white p-3 rounded-xl border border-teal-200 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs">
                              <span className="text-teal-600 text-sm">🐟</span>
                              <span>{species}</span>
                            </div>
                            {sciName && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5 font-serif">
                                {sciName}
                              </p>
                            )}
                          </div>
                          <span className="mt-2 text-[9px] font-mono font-bold text-teal-750 bg-teal-50 px-1.5 py-0.5 rounded self-start border border-teal-150">
                            Regional Catch Target
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] mt-0.5">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-slate-400 block text-[10px]">Bathymetric Operating Depth:</span>
                      <strong className="text-blue-950 text-xs">{currentReport.speciesInfo.depthRangeMeters}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-slate-400 block text-[10px]">Recommended Fleet Gear:</span>
                      <strong className="text-teal-800 text-xs">{currentReport.speciesInfo.recommendedGear}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-slate-400 block text-[10px]">Peak Catch Window:</span>
                      <strong className="text-blue-950 text-xs">{currentReport.speciesInfo.catchWindow}</strong>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-500 italic bg-white/80 p-2.5 rounded-xl border border-teal-150 leading-relaxed">
                    💡 <strong>Production Data Sources Note:</strong> In production deployment, species distribution and pelagic biomass models are pulled directly from <strong>CMFRI (Central Marine Fisheries Research Institute)</strong> seasonal surveys rather than static regional mapping.
                  </p>
                </div>
              )}

              {/* Section 5: Risk Assessment */}
              <div className="border border-stone-150 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  <span>5. Maritime Safety & Geofenced Risk Assessment</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Threat Danger Score:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.risk.dangerScore} / 100</strong> ({currentReport.risk.dangerLevel})
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Distance to IMBL Boundary:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.risk.imblDistanceKm} km</strong> offshore separation
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="text-slate-400 block text-[10px]">Closest Naval / Port Buffer:</span>
                    <strong className="text-blue-950 text-xs">{currentReport.risk.closestRestrictedZone}</strong> ({currentReport.risk.restrictedDistKm} km)
                  </div>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-150 text-xs text-slate-700">
                  <strong>Advisory Note:</strong> {currentReport.risk.hazardNotes}
                </div>
              </div>

              {/* Section 6: Crowdsourced Field Observations */}
              {currentReport.communityReports && currentReport.communityReports.length > 0 && (
                <div className="border border-stone-150 rounded-2xl p-4 flex flex-col gap-2.5">
                  <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                    <span>👥</span>
                    <span>6. Verified Crowdsourced Community Observations ({currentReport.communityReports.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {currentReport.communityReports.map((rep, idx) => (
                      <div key={idx} className="bg-stone-50 p-2.5 rounded-xl border border-stone-150 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded text-[10px] font-bold">
                            {rep.type}
                          </span>
                          <span className="text-slate-700 italic">"{rep.text}"</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{rep.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          {/* Section 3 Requirement: Powered by INNOWAVE Agent Network tag */}
          <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-900 text-white p-1.5 rounded-lg shadow-xs">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-blue-950 tracking-tight">
                Powered by INNOWAVE Agent Network
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans text-center sm:text-right">
              Multi-Agent Collaborative Intelligence: Planner • Weather • Ocean • Satellite • CMFRI Species • Community • GIS • Risk Agents
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
