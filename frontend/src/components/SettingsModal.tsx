"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Settings, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Radio, 
  Database, 
  Check, 
  RefreshCw, 
  RotateCcw 
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [speed, setSpeed] = useState("1x");
  const [unitSystem, setUnitSystem] = useState("nautical");
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoSyncAgents, setAutoSyncAgents] = useState(true);
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSpeed = localStorage.getItem("orca-sim-speed") || "1x";
      const savedUnits = localStorage.getItem("orca-units") || "nautical";
      const savedAudio = localStorage.getItem("orca-audio-alerts") !== "false";
      const savedSync = localStorage.getItem("orca-agent-sync") !== "false";
      const savedApi = localStorage.getItem("orca-api-url") || (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

      setSpeed(savedSpeed);
      setUnitSystem(savedUnits);
      setAudioAlerts(savedAudio);
      setAutoSyncAgents(savedSync);
      setApiUrl(savedApi);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("orca-sim-speed", speed);
    localStorage.setItem("orca-units", unitSystem);
    localStorage.setItem("orca-audio-alerts", String(audioAlerts));
    localStorage.setItem("orca-agent-sync", String(autoSyncAgents));
    localStorage.setItem("orca-api-url", apiUrl);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setSpeed("1x");
    setUnitSystem("nautical");
    setAudioAlerts(true);
    setAutoSyncAgents(true);
    setApiUrl("http://127.0.0.1:8000");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-stone-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-900 text-white p-2 rounded-xl shadow-xs">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-blue-950 text-sm">Platform Preferences</h3>
              <p className="text-[10px] text-slate-400 font-mono">ORCA Marine Intelligence Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          {/* Unit System */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Measurement Units</label>
            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUnitSystem("nautical")}
                className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  unitSystem === "nautical"
                    ? "bg-white text-blue-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Nautical (kts, nm, °C)
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem("metric")}
                className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  unitSystem === "metric"
                    ? "bg-white text-blue-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Metric (km/h, km, °C)
              </button>
            </div>
          </div>

          {/* Simulation Playback Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Vessel & AIS Simulation Speed</label>
            <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl">
              {["1x", "5x", "10x"].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSpeed(rate)}
                  className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    speed === rate
                      ? "bg-white text-blue-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {rate} {rate === "1x" ? "Real-time" : "Accelerated"}
                </button>
              ))}
            </div>
          </div>

          {/* Hazard Proximity Audio */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <div className="flex items-center gap-2.5">
              {audioAlerts ? (
                <Volume2 className="h-4 w-4 text-blue-900" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
              <div>
                <p className="font-bold text-slate-800">Squall & IMBL Audio Chimes</p>
                <p className="text-[10px] text-slate-400">Audible warning sound on severe danger alerts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              className="h-4 w-4 text-blue-900 rounded border-stone-300 focus:ring-blue-900 cursor-pointer"
            />
          </div>

          {/* Multi-Agent Background Sync */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <Radio className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-800">Auto-Sync Agent Feeds</p>
                <p className="text-[10px] text-slate-400">Stream INCOIS PFZ and satellite chlorophyll updates</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSyncAgents}
              onChange={(e) => setAutoSyncAgents(e.target.checked)}
              className="h-4 w-4 text-blue-900 rounded border-stone-300 focus:ring-blue-900 cursor-pointer"
            />
          </div>

          {/* Backend API Endpoint */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              <span>Backend API Server Endpoint</span>
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-[#FAF8F5] border border-stone-200 px-3 py-2 rounded-xl text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Scientific Data Sources & CMFRI Note */}
          <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-3.5 flex flex-col gap-1.5 text-[10.5px]">
            <span className="font-bold text-blue-950 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔬</span> Data Sources & Scientific Attribution
            </span>
            <ul className="text-slate-500 space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>Oceanographic PFZs:</strong> INCOIS advisory thermal front feeds.</li>
              <li><strong>Species Distribution:</strong> In operational production, species distribution and biomass baselines are pulled directly from <strong>CMFRI (Central Marine Fisheries Research Institute)</strong> seasonal surveys rather than static mock mapping.</li>
              <li><strong>Bathymetry & Radar:</strong> GEBCO 15 arc-sec contours.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200/80 bg-[#FAF8F5] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-slate-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-850 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
            >
              {savedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : null}
              <span>{savedSuccess ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
