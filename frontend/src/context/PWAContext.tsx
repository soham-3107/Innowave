"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  seedDefaultOfflineData, 
  getSyncMetadata, 
  saveCoastalRegionData, 
  getPendingReports, 
  removePendingReport 
} from "@/utils/indexedDb";

interface PWAContextType {
  isOffline: boolean;
  isSyncing: boolean;
  justSynced: boolean;
  lastSyncTime: string;
  lastSyncTimestamp: number | null;
  isInstallable: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<void>;
  manualSync: () => Promise<void>;
  dismissBanner: () => void;
  isBannerDismissed: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Format timestamp nicely for display
  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit",
      day: "2-digit",
      month: "short" 
    });
  };

  // Perform full data fetch & cache to IndexedDB
  const syncData = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsSyncing(true);

    try {
      // 1. Check if backend is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const mapRes = await fetch(`${API_BASE_URL}/api/map`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (mapRes.ok) {
        const mapData = await mapRes.json();
        
        // Save to IndexedDB
        const activeLoc = localStorage.getItem("orca-active-location") || "mumbai";
        await saveCoastalRegionData(activeLoc, {
          pfzs: mapData.pfzs || [],
          hazards: mapData.hazards || [],
          tideZones: mapData.tide_zones || [],
          reports: mapData.reports || []
        });

        const now = Date.now();
        const formatted = formatTime(now);
        setLastSyncTimestamp(now);
        setLastSyncTime(formatted);
        setIsOffline(false);
        setJustSynced(true);
        setIsBannerDismissed(false);

        // Process any pending offline reports
        const pending = await getPendingReports();
        for (const report of pending) {
          try {
            const repRes = await fetch(`${API_BASE_URL}/api/reports`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: report.type,
                text: report.text,
                lat: report.lat,
                lon: report.lon
              })
            });
            if (repRes.ok && report.id) {
              await removePendingReport(report.id);
            }
          } catch (e) {
            console.warn("Could not sync pending report:", e);
          }
        }

        setTimeout(() => {
          setJustSynced(false);
        }, 6000);
      } else {
        throw new Error("API returned non-200");
      }
    } catch {
      console.log("[ORCA PWA] Backend sync check completed. Active online status:", typeof navigator !== "undefined" ? navigator.onLine : true);
      if (typeof navigator !== "undefined") {
        setIsOffline(!navigator.onLine);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize service worker, IndexedDB, and event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check online status initially
    const online = navigator.onLine;
    setIsOffline(!online);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[ORCA PWA] Service Worker registered successfully, scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[ORCA PWA] Service Worker registration failed:", err);
        });
    }

    // Seed offline IndexedDB default data & load last sync time
    seedDefaultOfflineData().then(async () => {
      const meta = await getSyncMetadata();
      if (meta && meta.timestamp) {
        setLastSyncTimestamp(meta.timestamp);
        setLastSyncTime(meta.timeFormatted || formatTime(meta.timestamp));
      } else {
        const now = Date.now();
        setLastSyncTimestamp(now);
        setLastSyncTime(formatTime(now));
      }
    });

    // Check if app is in standalone PWA mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("[ORCA PWA] beforeinstallprompt event captured.");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[ORCA PWA] App was successfully installed!");
    };

    // Network status listeners
    const handleOnline = () => {
      console.log("[ORCA PWA] Device is back ONLINE. Auto-syncing...");
      setIsOffline(false);
      syncData();
    };

    const handleOffline = () => {
      console.log("[ORCA PWA] Device is OFFLINE. Engaging IndexedDB offline cache.");
      setIsOffline(true);
      setIsBannerDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync
    if (navigator.onLine) {
      syncData();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncData]);

  // Install PWA Trigger
  const installPWA = async () => {
    if (!deferredPrompt) {
      alert("To install ORCA to your home screen, open your browser menu and select 'Add to Home screen' or 'Install App'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[ORCA PWA] User install choice: ${outcome}`);
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const manualSync = async () => {
    await syncData();
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
  };

  return (
    <PWAContext.Provider
      value={{
        isOffline,
        isSyncing,
        justSynced,
        lastSyncTime,
        lastSyncTimestamp,
        isInstallable,
        isInstalled,
        installPWA,
        manualSync,
        dismissBanner,
        isBannerDismissed
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
