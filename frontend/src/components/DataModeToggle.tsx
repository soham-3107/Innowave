"use client";

import { useState, useEffect, useRef } from "react";
import { Info, Radio, Activity } from "lucide-react";

interface DataModeToggleProps {
  compact?: boolean;
  className?: string;
}

export default function DataModeToggle({ compact = false, className = "" }: DataModeToggleProps) {
  const [dataMode, setDataMode] = useState<"simulated" | "live">("simulated");
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize and sync across tabs/components
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("innowave-data-mode") || "simulated";
      if (saved === "simulated" || saved === "live") {
        setDataMode(saved);
      }

      const handleModeChange = (e: any) => {
        if (e.detail && (e.detail === "simulated" || e.detail === "live")) {
          setDataMode(e.detail);
        }
      };

      window.addEventListener("innowave-datamode-changed", handleModeChange);

      return () => {
        window.removeEventListener("innowave-datamode-changed", handleModeChange);
      };
    }
  }, []);

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  const handleSelectMode = (mode: "simulated" | "live") => {
    setDataMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("innowave-data-mode", mode);
      window.dispatchEvent(new CustomEvent("innowave-datamode-changed", { detail: mode }));
    }
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* Compact layout for Sidebar Footer */}
      {compact ? (
        <div className="flex flex-col gap-1.5 bg-white border border-stone-200/90 p-2.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Radio className={`h-3.5 w-3.5 ${dataMode === "live" ? "text-emerald-600 animate-pulse" : "text-blue-900"}`} />
              <span>Data Mode</span>
            </div>

            {/* Simulated Info Tooltip Trigger Icon */}
            {dataMode === "simulated" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-blue-900 transition-colors p-0.5 rounded cursor-pointer"
                title="Telemetry Ingest Details"
                aria-label="Data mode details"
              >
                <Info className="h-3.5 w-3.5 text-blue-900/70" />
              </button>
            )}
          </div>

          {/* Labeled Segmented Toggle: Simulated | Live */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-100/90 rounded-lg border border-stone-200/60 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => handleSelectMode("simulated")}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-md transition-all font-semibold cursor-pointer ${
                dataMode === "simulated"
                  ? "bg-white text-blue-950 font-bold shadow-xs border border-stone-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dataMode === "simulated" ? "bg-amber-500" : "bg-slate-300"}`} />
              <span>Simulated</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode("live")}
              className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-md transition-all font-semibold cursor-pointer ${
                dataMode === "live"
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dataMode === "live" ? "bg-white animate-ping" : "bg-slate-300"}`} />
              <span>Live</span>
            </button>
          </div>
        </div>
      ) : (
        /* Full Toolbar Layout (for Dashboard / Marine Map) */
        <div className="flex items-center gap-2 bg-white border border-stone-200/90 px-2.5 py-1 rounded-xl shadow-xs text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold font-mono text-[11px]">
            <Radio className={`h-3.5 w-3.5 ${dataMode === "live" ? "text-emerald-600 animate-pulse" : "text-blue-900"}`} />
            <span>Data Mode:</span>
          </div>

          <div className="flex items-center p-0.5 bg-stone-100/90 rounded-lg border border-stone-200/60 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleSelectMode("simulated")}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`flex items-center gap-1.5 py-0.5 px-2 rounded-md transition-all font-semibold cursor-pointer ${
                dataMode === "simulated"
                  ? "bg-white text-blue-950 font-bold shadow-xs border border-stone-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dataMode === "simulated" ? "bg-amber-500" : "bg-slate-300"}`} />
              <span>Simulated</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode("live")}
              className={`flex items-center gap-1.5 py-0.5 px-2 rounded-md transition-all font-semibold cursor-pointer ${
                dataMode === "live"
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dataMode === "live" ? "bg-white animate-ping" : "bg-slate-300"}`} />
              <span>Live</span>
            </button>
          </div>

          {/* Info Tooltip Icon */}
          {dataMode === "simulated" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-blue-900 transition-colors p-1 rounded-full cursor-pointer"
              title="Telemetry Details"
              aria-label="Data mode details"
            >
              <Info className="h-3.5 w-3.5 text-blue-900/70" />
            </button>
          )}
        </div>
      )}

      {/* Floating Info Tooltip */}
      {showTooltip && dataMode === "simulated" && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${compact ? "bottom-full left-0 mb-2 w-[210px]" : "top-full left-0 mt-2 w-72"} bg-slate-950/95 backdrop-blur-md text-slate-100 text-[11px] leading-relaxed p-3 rounded-xl shadow-2xl border border-slate-700/80 pointer-events-auto transition-opacity duration-200`}
        >
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">Telemetry Mode: Simulated</p>
              <p className="text-slate-300 font-sans text-[11px] leading-snug">
                Vessel telemetry simulated for demo. Production build connects to <span className="text-amber-300 font-semibold">[INCOIS / ISRO Bhuvan / NAVIC AIS feed]</span>.
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className={`absolute ${compact ? "top-full left-6 -mt-1 border-t-slate-950" : "bottom-full left-6 -mb-1 border-b-slate-950"} border-4 border-transparent`} />
        </div>
      )}

      {/* Live Mode Tooltip */}
      {showTooltip && dataMode === "live" && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${compact ? "bottom-full left-0 mb-2 w-[210px]" : "top-full left-0 mt-2 w-72"} bg-slate-950/95 backdrop-blur-md text-slate-100 text-[11px] leading-relaxed p-3 rounded-xl shadow-2xl border border-emerald-700/80 pointer-events-auto transition-opacity duration-200`}
        >
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold text-white mb-1">Telemetry Mode: Live Ingest</p>
              <p className="text-slate-300 font-sans text-[11px] leading-snug">
                Production live ingest stream enabled. Polling <span className="text-emerald-300 font-semibold">INCOIS / ISRO Bhuvan / NAVIC AIS feed</span>.
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className={`absolute ${compact ? "top-full left-6 -mt-1 border-t-slate-950" : "bottom-full left-6 -mb-1 border-b-slate-950"} border-4 border-transparent`} />
        </div>
      )}
    </div>
  );
}
