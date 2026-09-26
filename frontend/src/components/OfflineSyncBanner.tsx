"use client";

import { usePWA } from "@/context/PWAContext";
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Download, 
  X, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  HardDrive
} from "lucide-react";

export default function OfflineSyncBanner() {
  const { 
    isOffline, 
    isSyncing, 
    justSynced, 
    lastSyncTime, 
    isInstallable, 
    isInstalled, 
    installPWA, 
    manualSync,
    dismissBanner,
    isBannerDismissed
  } = usePWA();

  // If offline, display the prominent amber/red offline sync banner
  if (isOffline && !isBannerDismissed) {
    return (
      <div 
        id="pwa-offline-banner"
        className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-amber-100 border-b border-amber-600/40 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs z-30 animate-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-amber-500/20 text-amber-300 p-1.5 rounded-lg border border-amber-400/30 flex-shrink-0">
            <WifiOff className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
            <span className="font-extrabold text-amber-200 tracking-wide flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block flex-shrink-0" />
              Offline Mode Active:
            </span>
            <span className="text-amber-100/90 truncate font-medium">
              Showing data last synced at <strong className="text-white font-bold underline decoration-amber-400">{lastSyncTime || "earlier today"}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-amber-300/80 bg-black/20 px-2 py-0.5 rounded-md border border-amber-500/20">
            <HardDrive className="h-3 w-3" />
            Offline Cache
          </span>

          <button
            onClick={manualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Attempt connection and sync fresh marine intelligence"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Retry Sync"}</span>
          </button>

          {isInstallable && !isInstalled && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs transition-all cursor-pointer"
              title="Install ORCA to Home Screen"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          <button
            onClick={dismissBanner}
            className="p-1 text-amber-300 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss offline banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // If freshly synced when back online
  if (justSynced) {
    return (
      <div 
        id="pwa-synced-banner"
        className="bg-emerald-900 text-emerald-100 border-b border-emerald-600/40 px-4 py-2 shadow-xs flex items-center justify-between text-xs z-30 animate-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 text-emerald-300 p-1 rounded-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-emerald-100">
            Back Online — <strong>Synced just now.</strong> Marine intelligence and telemetry are up-to-date.
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          <span>Data Synchronized</span>
        </div>
      </div>
    );
  }

  return null;
}
