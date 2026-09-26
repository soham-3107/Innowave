"use client";

import { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart3, Waves, Wind, Compass, Sparkles } from "lucide-react";
import { COASTAL_REGIONS } from "@/data/coastalRegions";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Weekly historical/simulated datasets for analytics
const ANALYTICS_DATA: Record<string, any> = {
  mumbai: {
    name: "Mumbai Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [28.2, 28.3, 28.1, 28.4, 28.5, 28.2, 28.3],
    chlorophyll: [4.2, 4.5, 4.8, 5.1, 4.9, 4.6, 4.8],
    wind: [12.0, 14.5, 13.0, 11.0, 10.5, 12.5, 13.2],
    waves: [1.1, 1.3, 1.2, 1.0, 0.9, 1.2, 1.1],
    catch_likelihood: [70, 72, 68, 75, 78, 72, 74]
  },
  goa: {
    name: "Goa Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [28.5, 28.6, 28.4, 28.5, 28.7, 28.5, 28.6],
    chlorophyll: [4.8, 5.0, 5.1, 5.3, 5.2, 4.9, 5.1],
    wind: [9.0, 10.2, 9.8, 8.5, 9.2, 9.8, 10.4],
    waves: [0.8, 0.9, 0.8, 0.7, 0.8, 0.8, 0.9],
    catch_likelihood: [82, 85, 84, 88, 86, 85, 87]
  },
  kochi: {
    name: "Kochi Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [27.8, 27.5, 26.8, 26.5, 26.2, 26.6, 26.9],
    chlorophyll: [2.5, 2.1, 1.5, 1.2, 1.0, 1.3, 1.8],
    wind: [14.0, 18.2, 26.5, 28.0, 29.5, 22.0, 16.5],
    waves: [1.5, 2.2, 3.5, 3.8, 4.2, 2.8, 1.9],
    catch_likelihood: [60, 42, 18, 12, 10, 35, 55] // Dips sharply during storm swells
  },
  chennai: {
    name: "Chennai Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [29.1, 29.3, 29.5, 29.6, 29.4, 29.5, 29.7],
    chlorophyll: [2.8, 3.0, 3.1, 3.3, 3.2, 3.0, 3.1],
    wind: [8.5, 9.0, 9.5, 10.2, 8.8, 9.2, 9.8],
    waves: [0.7, 0.8, 0.8, 0.9, 0.7, 0.8, 0.8],
    catch_likelihood: [75, 78, 80, 82, 79, 81, 83]
  },
  veraval: {
    name: "Veraval / Gujarat Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [26.8, 27.0, 27.2, 27.1, 26.9, 27.0, 27.1],
    chlorophyll: [5.8, 6.0, 6.2, 6.5, 6.3, 6.1, 6.2],
    wind: [15.2, 17.0, 18.0, 19.5, 16.8, 17.5, 18.2],
    waves: [1.8, 2.0, 2.2, 2.5, 2.1, 1.9, 2.0],
    catch_likelihood: [88, 90, 89, 92, 91, 89, 92]
  },
  vizag: {
    name: "Visakhapatnam Coast",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sst: [28.5, 28.6, 28.7, 28.9, 28.8, 28.7, 28.8],
    chlorophyll: [4.9, 5.2, 5.5, 5.8, 5.4, 5.2, 5.5],
    wind: [11.5, 13.0, 14.0, 15.2, 13.8, 12.5, 14.2],
    waves: [1.2, 1.3, 1.4, 1.5, 1.3, 1.2, 1.4],
    catch_likelihood: [72, 74, 76, 78, 75, 73, 76]
  }
};

export default function AnalyticsPage() {
  const [selectedRegion, setSelectedRegion] = useState("mumbai");

  useEffect(() => {
    const updateLocation = () => {
      const saved = localStorage.getItem("orca-active-location");
      if (saved && ANALYTICS_DATA[saved]) {
        setSelectedRegion(saved);
      }
    };

    updateLocation();

    const handleCustomLocation = (e: any) => {
      if (e.detail && ANALYTICS_DATA[e.detail]) {
        setSelectedRegion(e.detail);
      } else {
        updateLocation();
      }
    };

    window.addEventListener("orca-location-changed", handleCustomLocation);
    window.addEventListener("storage", updateLocation);
    return () => {
      window.removeEventListener("orca-location-changed", handleCustomLocation);
      window.removeEventListener("storage", updateLocation);
    };
  }, []);

  const handleRegionChange = (val: string) => {
    setSelectedRegion(val);
    localStorage.setItem("orca-active-location", val);
    window.dispatchEvent(new CustomEvent("orca-location-changed", { detail: val }));
  };

  const data = ANALYTICS_DATA[selectedRegion];

  // 1. Biological Correlation Graph (SST vs Chlorophyll)
  const bioChartData = {
    labels: data.labels,
    datasets: [
      {
        type: "line" as const,
        label: "Sea Surface Temperature (°C)",
        borderColor: "#d97706",
        borderWidth: 3,
        pointBackgroundColor: "#d97706",
        data: data.sst,
        yAxisID: "y-sst",
        fill: false,
        tension: 0.3
      },
      {
        type: "bar" as const,
        label: "Chlorophyll-a Concentration (mg/m³)",
        backgroundColor: "rgba(13, 148, 136, 0.15)",
        borderColor: "#0d9488",
        borderWidth: 2,
        data: data.chlorophyll,
        yAxisID: "y-chloro",
        tension: 0.3
      }
    ]
  };

  const bioOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#334155", font: { family: "sans-serif", size: 11, weight: "bold" as const } }
      },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleColor: "#ffffff",
        borderColor: "rgba(15, 23, 42, 0.1)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(15, 23, 42, 0.05)" },
        ticks: { color: "#475569", font: { size: 10 } }
      },
      "y-sst": {
        position: "left" as const,
        title: { display: true, text: "Temperature (°C)", color: "#d97706", font: { size: 11, weight: "bold" as const } },
        grid: { color: "rgba(15, 23, 42, 0.06)" },
        ticks: { color: "#475569" },
        min: 24,
        max: 32
      },
      "y-chloro": {
        position: "right" as const,
        title: { display: true, text: "Chlorophyll-a (mg/m³)", color: "#0d9488", font: { size: 11, weight: "bold" as const } },
        grid: { drawOnChartArea: false },
        ticks: { color: "#475569" },
        min: 0,
        max: 8
      }
    }
  };

  // 2. Weather Threat Threshold Chart (Wind vs Waves)
  const weatherChartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Wind Speed (knots)",
        backgroundColor: "rgba(30, 58, 138, 0.1)",
        borderColor: "#1e3a8a",
        borderWidth: 2,
        data: data.wind,
        fill: true,
        tension: 0.2
      },
      {
        label: "Wave Height (m) [Scaled x10]",
        borderColor: "#dc2626",
        borderWidth: 3,
        pointBackgroundColor: "#dc2626",
        data: data.waves.map((w: number) => w * 10),
        fill: false,
        tension: 0.2
      }
    ]
  };

  const weatherOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#334155", font: { family: "sans-serif", size: 11, weight: "bold" as const } }
      },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleColor: "#ffffff",
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let val = context.raw;
            if (context.datasetIndex === 1) {
              label = "Wave Height (m)";
              val = (val / 10).toFixed(1);
            }
            return `${label}: ${val}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(15, 23, 42, 0.05)" },
        ticks: { color: "#475569" }
      },
      y: {
        title: { display: true, text: "Safety Metrics Index", color: "#1e3a8a", font: { size: 11, weight: "bold" as const } },
        grid: { color: "rgba(15, 23, 42, 0.06)" },
        ticks: { color: "#475569" },
        min: 0,
        max: 50
      }
    }
  };

  // 3. Trends & Predictions Chart (Fish Catch Likelihood vs Wave Height)
  const trendsChartData = {
    labels: data.labels,
    datasets: [
      {
        type: "line" as const,
        label: "Fish Catch Likelihood (%)",
        borderColor: "#4f46e5", // Indigo
        borderWidth: 3,
        pointBackgroundColor: "#4f46e5",
        data: data.catch_likelihood,
        yAxisID: "y-likelihood",
        fill: false,
        tension: 0.25
      },
      {
        type: "line" as const,
        label: "Wave Height Swells (m)",
        borderColor: "#e11d48", // Red/rose
        borderWidth: 2,
        pointBackgroundColor: "#e11d48",
        borderDash: [5, 5],
        data: data.waves,
        yAxisID: "y-waves",
        fill: false,
        tension: 0.2
      }
    ]
  };

  const trendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#334155", font: { family: "sans-serif", size: 11, weight: "bold" as const } }
      },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleColor: "#ffffff"
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(15, 23, 42, 0.05)" },
        ticks: { color: "#475569" }
      },
      "y-likelihood": {
        position: "left" as const,
        title: { display: true, text: "Catch Likelihood (%)", color: "#4f46e5", font: { size: 11, weight: "bold" as const } },
        grid: { color: "rgba(15, 23, 42, 0.06)" },
        ticks: { color: "#475569" },
        min: 0,
        max: 100
      },
      "y-waves": {
        position: "right" as const,
        title: { display: true, text: "Wave Swell Height (m)", color: "#e11d48", font: { size: 11, weight: "bold" as const } },
        grid: { drawOnChartArea: false },
        ticks: { color: "#475569" },
        min: 0,
        max: 5
      }
    }
  };

  const getPredictionInsight = (region: string) => {
    switch (region) {
      case "kochi":
        return "Severe storm wave heights peaking at 4.2m on Friday suppressed fish catch likelihood to a critical low of 10%. Likelihood is trending upward to 55% as wave conditions calm through the weekend.";
      case "goa":
        return "Goa's exceptionally calm wave swells (averaging under 0.9m) maintain a steady and highly optimal catch likelihood of 85-88% throughout the forecast window.";
      case "veraval":
        return "Nutrient-rich upwelling coupled with stable 2.0m waves provides peak historical fishing productivity, securing a 92% catch likelihood for Veraval coastal sectors.";
      case "chennai":
        return "Calm wave swells remaining below 0.9m ensure high fishing safety, keeping fish catch likelihood steadily rising to 83% by Sunday.";
      case "vizag":
        return "Consistent wave swells around 1.3m support a stable and productive fish catch profile, averaging 75% efficiency across all offshore sectors.";
      default: // mumbai
        return "Stable wave swells under 1.3m maintain a highly favorable fish catch likelihood, averaging 72% across all Mumbai coastal sectors.";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-800">
      
      {/* Page Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-900 h-8 w-8 flex-shrink-0 animate-pulse" />
          <div>
            <h2 className="font-bold text-blue-950 flex items-center gap-2">
              Ocean Telemetry & Biological Analytics
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-950 font-bold uppercase tracking-wider font-mono">
                Sync Location: {data.name}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data reflects the last 7 days for <strong className="text-blue-900">{data.name}</strong>. SST gradients and chlorophyll vectors are updated hourly.
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Select Sector:</span>
          <select 
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="bg-white border border-stone-300 rounded-xl px-4 py-2 text-xs md:text-sm font-bold text-blue-900 outline-none cursor-pointer focus:border-blue-900 shadow-sm"
          >
            {COASTAL_REGIONS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Chart.js Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Bio-Productivity Correlation */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-blue-900" />
              SST vs Chlorophyll-a PFZ Correlation
            </h3>
            <p className="text-[11px] text-slate-500">
              High chlorophyll concentrations (green bars) coincide with optimized thermal zones (amber line).
            </p>
          </div>
          <div className="h-[320px] w-full relative">
            <Line data={bioChartData as any} options={bioOptions} />
          </div>
        </div>

        {/* Chart 2: Safety Thresholds */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
              <Waves className="h-4.5 w-4.5 text-rose-600" />
              Wind Speed & Wave Swell Safety Indices
            </h3>
            <p className="text-[11px] text-slate-500">
              Plots wind velocity (blue area) and wave heights (scaled red line) against threshold safety limits.
            </p>
          </div>
          <div className="h-[320px] w-full relative">
            <Bar data={weatherChartData} options={weatherOptions} />
          </div>
        </div>

      </div>

      {/* New Section: Historical Trends & Predictions (Fish Catch Likelihood vs Wave Height) */}
      <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm animate-fade-in">
        <div className="flex items-center justify-between pb-1 border-b border-stone-150">
          <div>
            <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-700" />
              Historical Trends & Predictions: Fish Catch Likelihood vs Waves
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Correlates weekly fishing yields (indigo line, %) with swell roughness (dashed red line, meters) to outline catch forecast efficiency.
            </p>
          </div>
        </div>
        
        <div className="h-[320px] w-full relative">
          <Line data={trendsChartData} options={trendsOptions} />
        </div>

        {/* AI Insight banner box */}
        <div className="bg-[#FAF8F5] border border-stone-250 p-3.5 rounded-xl text-xs text-slate-700 flex items-center gap-2.5 shadow-sm">
          <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md font-mono">
            AI Insight
          </span>
          <span className="leading-relaxed font-semibold italic">"{getPredictionInsight(selectedRegion)}"</span>
        </div>
      </div>

      {/* Analytics Insights (General Summary) */}
      <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
        <h4 className="font-bold text-blue-950 text-xs uppercase font-mono tracking-wider">AI Ecological Insights - {data.name}</h4>
        <div className="text-xs text-slate-655 space-y-2 leading-relaxed font-sans">
          {selectedRegion === "kochi" ? (
            <p>
              ⚠️ **Storm System Advisory**: High wind speeds peaking at **{data.wind[4]} knots** and corresponding wave heights of **{data.waves[4]}m** on Friday indicate a violent squall cell. Plankton levels have dropped due to turbulent storm-mixing, creating a low potential fishing zone. Fishing is highly discouraged.
            </p>
          ) : selectedRegion === "goa" ? (
            <p>
              ✓ **Highly Productive Reef Zones**: Goa's chlorophyll is stable and high at **{data.chlorophyll[3]} mg/m³** with smooth sea conditions. Wind currents are under 10 knots, showing ideal artisanal fishing weather.
            </p>
          ) : selectedRegion === "veraval" ? (
            <p>
              ✅ **Peak Biomass Activity**: Chlorophyll-a readings are exceptionally high at **{data.chlorophyll[3]} mg/m³** with stable temperatures (~{data.sst[3]}°C). This denotes highly active coastal upwelling. Wind and waves are moderate, representing optimal fishing yield conditions.
            </p>
          ) : (
            <p>
              ✓ **Stable Marine Ecology**: Consistent Sea Surface Temperature anomalies (~{data.sst[0]}°C) and moderate chlorophyll density verify a standard ecological profile. Normal tidal levels and wind speeds under 15 knots indicate safe conditions for standard navigation.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
