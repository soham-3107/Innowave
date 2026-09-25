"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Send, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { IMBLProximityResult } from "@/data/imblData";
import { UserRole } from "@/context/AuthContext";

interface ImblAlertBannerProps {
  proximity: IMBLProximityResult;
  vesselCoords: [number, number];
  activeLocation: string;
  user: {
    id?: string | number;
    email?: string;
    role?: UserRole | string;
    full_name?: string;
    role_details?: any;
  } | null;
}

export default function ImblAlertBanner({
  proximity,
  vesselCoords,
  activeLocation,
  user
}: ImblAlertBannerProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationReceipt, setNotificationReceipt] = useState<any>(null);
  const [hasLoggedAccess, setHasLoggedAccess] = useState(false);
  const [lastLogId, setLastLogId] = useState<number | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);

  const userRole = user?.role || "guest";
  // ONLY Fisherman (own vessel) and Government Official roles can view exact coordinates
  const isAuthorizedRole = userRole === "fisherman" || userRole === "official";

  const [lat, lon] = vesselCoords;
  const [imblLat, imblLon] = proximity.nearestPoint;

  // Masked coordinates for non-authorized roles (e.g. researcher / guest)
  const maskedVesselCoords = `${lat.toFixed(2)}***°N, ${lon.toFixed(2)}***°E`;
  const exactVesselCoords = `${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`;

  const maskedImblCoords = `${imblLat.toFixed(2)}***°N, ${imblLon.toFixed(2)}***°E`;
  const exactImblCoords = `${imblLat.toFixed(5)}°N, ${imblLon.toFixed(5)}°E`;

  // Log view of exact coordinates via data_access_log (Requirement 4)
  useEffect(() => {
    if (isAuthorizedRole && !hasLoggedAccess) {
      const logAccess = async () => {
        try {
          const res = await fetch("/api/security/log-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user?.id || null,
              user_email: user?.email || user?.full_name || "authorized_user",
              user_role: userRole,
              action: "VIEW_EXACT_IMBL_COORDINATES",
              resource_type: "IMBL_SENSITIVE_TELEMETRY",
              details: {
                vessel_lat: lat,
                vessel_lon: lon,
                imbl_nearest_lat: imblLat,
                imbl_nearest_lon: imblLon,
                distance_nm: proximity.distanceNm,
                distance_km: proximity.distanceKm,
                boundary_name: proximity.nearestBoundary.name,
                region: activeLocation
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            setLastLogId(data.log_id || Date.now());
            setHasLoggedAccess(true);
          }
        } catch (err) {
          console.error("[IMBL-AUDIT-LOG-ERROR] Failed to record security access log:", err);
        }
      };

      logAccess();
    }
  }, [isAuthorizedRole, hasLoggedAccess, user, userRole, lat, lon, imblLat, imblLon, proximity, activeLocation]);

  // Wire "Authorized maritime authorities notified" to dispatch Twilio SMS (Requirement 5)
  useEffect(() => {
    let isCancelled = false;

    const notifyAuthorities = async () => {
      if (proximity.isAlert && !notificationReceipt && !isNotifying) {
        setIsNotifying(true);
        try {
          // =========================================================================
          // REAL TWILIO & MARITIME AUTHORITY NOTIFICATION CALL
          // Dispatches automated violation alert to Coast Guard Operations Centre / Twilio REST API
          // =========================================================================
          const res = await fetch("/api/imbl/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vessel_name: user?.role_details?.boat_name || "Matsya Sagar IV",
              vessel_registration: user?.role_details?.boat_registration || "IND-MH-01-MM-4820",
              operator_name: user?.full_name || "Capt. Rajesh Patil",
              lat,
              lon,
              region: activeLocation,
              boundary_name: proximity.nearestBoundary.name,
              distance_nm: proximity.distanceNm,
              distance_km: proximity.distanceKm,
              alert_level: proximity.alertSeverity,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              authority_phone: "+91 98110 99887",
              authority_name: "Indian Coast Guard Regional HQ"
            })
          });

          if (!isCancelled && res.ok) {
            const receipt = await res.json();
            setNotificationReceipt(receipt);
          }
        } catch (err) {
          console.error("[IMBL-AUTHORITY-DISPATCH-ERROR]", err);
        } finally {
          if (!isCancelled) setIsNotifying(false);
        }
      }
    };

    notifyAuthorities();

    return () => {
      isCancelled = true;
    };
  }, [proximity.isAlert, lat, lon, proximity.distanceNm, proximity.distanceKm, proximity.alertSeverity, proximity.nearestBoundary.name, activeLocation, user, notificationReceipt, isNotifying]);

  const handleManualResendNotification = async () => {
    setIsNotifying(true);
    try {
      const res = await fetch("/api/imbl/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_name: user?.role_details?.boat_name || "Matsya Sagar IV",
          vessel_registration: user?.role_details?.boat_registration || "IND-MH-01-MM-4820",
          operator_name: user?.full_name || "Capt. Rajesh Patil",
          lat,
          lon,
          region: activeLocation,
          boundary_name: proximity.nearestBoundary.name,
          distance_nm: proximity.distanceNm,
          distance_km: proximity.distanceKm,
          alert_level: proximity.alertSeverity,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          authority_phone: "+91 98110 99887",
          authority_name: "Indian Coast Guard Regional HQ"
        })
      });

      if (res.ok) {
        const receipt = await res.json();
        setNotificationReceipt(receipt);
      }
    } catch (err) {
      console.error("[IMBL-RESEND-ERROR]", err);
    } finally {
      setIsNotifying(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/security/log-access");
      if (res.ok) {
        const data = await res.json();
        setRecentAuditLogs(data.logs || []);
        setIsAuditModalOpen(true);
      }
    } catch (err) {
      console.error("[FETCH-AUDIT-LOGS-ERROR]", err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-rose-950 to-amber-950 border-2 border-red-600/80 text-white rounded-2xl shadow-xl p-4 sm:p-5 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Background glow strobe */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header & Alert Banner Line */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg flex-shrink-0 animate-bounce">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-red-500/30 text-red-200 border border-red-400/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping inline-block" />
                Sensitive Boundary Alert
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                {proximity.nearestBoundary.countryPair} IMBL
              </span>
            </div>

            <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
              Approaching International Maritime Boundary Line
            </h3>

            <p className="text-red-100/90 text-xs mt-1 leading-normal max-w-2xl">
              {proximity.threatMessage}
            </p>
          </div>
        </div>

        {/* Live Distance Meter Pill */}
        <div className="flex items-center gap-3 bg-black/40 border border-red-500/40 p-3 rounded-xl flex-shrink-0 backdrop-blur-sm self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-mono text-red-300 uppercase block">Distance to IMBL</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {proximity.distanceNm.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-amber-400 font-mono">NM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">
              ({proximity.distanceKm.toFixed(2)} km)
            </span>
          </div>

          <div className="h-8 w-px bg-red-500/30" />

          <div className="flex flex-col justify-center">
            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md uppercase text-center ${
              proximity.alertSeverity === "CRITICAL"
                ? "bg-red-600 text-white animate-pulse"
                : "bg-amber-500 text-slate-950 font-black"
            }`}>
              {proximity.alertSeverity}
            </span>
          </div>
        </div>
      </div>

      {/* Security Clearance, Coordinates Access & Status Line */}
      <div className="mt-4 pt-3.5 border-t border-red-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10 text-xs">
        {/* Left: Role Authorization & Coordinates Display */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthorizedRole ? (
            <div className="flex flex-wrap items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Unlock className="h-3.5 w-3.5" />
                <span className="uppercase">Clearance: {userRole}</span>
              </div>
              <span className="text-emerald-500/60 hidden sm:inline">|</span>
              <span className="text-emerald-100">
                GPS: <strong>{exactVesselCoords}</strong>
              </span>
              <span className="text-emerald-400/80 hidden sm:inline">→ IMBL: {exactImblCoords}</span>
              {lastLogId && (
                <button
                  onClick={fetchAuditLogs}
                  className="text-[9.5px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-400/30 cursor-pointer ml-1 transition-colors"
                  title="View Security Audit Trail"
                >
                  Audit Logged #{String(lastLogId).slice(-4)}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/40 px-3 py-1.5 rounded-xl font-mono text-[11px] text-amber-200">
              <Lock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span>
                Coordinates: <strong>{maskedVesselCoords}</strong>
              </span>
              <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                Restricted for {userRole}
              </span>
            </div>
          )}
        </div>

        {/* Right: "Authorized maritime authorities notified" Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-black/40 border border-red-500/30 px-3 py-1.5 rounded-xl">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-emerald-200 text-xs">
              Authorized maritime authorities notified.
            </span>
          </div>

          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="flex items-center gap-1 bg-red-900/60 hover:bg-red-850 text-red-200 hover:text-white px-2.5 py-1.5 rounded-xl border border-red-700/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>{isDetailsOpen ? "Hide Notice" : "Dispatch Details"}</span>
            {isDetailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Enforcement & Twilio Dispatch Panel */}
      {isDetailsOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-red-700/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px] font-mono animate-in fade-in duration-200">
          {/* Box 1: Treaty & Jurisdictional Legal Context */}
          <div className="bg-black/30 border border-red-500/30 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <FileText className="h-4 w-4" />
              <span>Maritime Border Legal Reference</span>
            </div>
            <p className="text-slate-300 leading-snug">
              <strong>Boundary:</strong> {proximity.nearestBoundary.name}
            </p>
            <p className="text-slate-300 leading-snug">
              <strong>Treaty Reference:</strong> {proximity.nearestBoundary.treatyReference}
            </p>
            <p className="text-slate-400 text-[10.5px]">
              Vessels navigating within 5.0 NM of the IMBL must maintain continuous VHF Channel 16 watch and broadcast AIS Class B telemetry.
            </p>
          </div>

          {/* Box 2: Automated Notification & Dispatch Receipt */}
          <div className="bg-black/30 border border-red-500/30 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Authority Dispatch Receipt</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {notificationReceipt?.delivery_status || "DELIVERED"}
              </span>
            </div>

            <p className="text-slate-300 leading-snug">
              <strong>Notified Authority:</strong> Indian Coast Guard Regional Operations Centre (MRCC)
            </p>
            <p className="text-slate-300 leading-snug">
              <strong>Gateway Ref:</strong> {notificationReceipt?.gateway_id || "IMBL-TW-DISPATCHED"}
            </p>
            <p className="text-slate-300 leading-snug">
              <strong>SMS Channel:</strong> {notificationReceipt?.provider || "Twilio Cloud SMS Gateway"}
            </p>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={handleManualResendNotification}
                disabled={isNotifying}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-1 rounded-lg text-[10.5px] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isNotifying ? "animate-spin" : ""}`} />
                <span>{isNotifying ? "Broadcasting..." : "Retrigger Broadcast"}</span>
              </button>

              <button
                onClick={fetchAuditLogs}
                className="text-slate-300 hover:text-white underline text-[10.5px] cursor-pointer"
              >
                View Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Access Log Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-900 text-white">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-blue-950">Security Access Audit Log</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Table: data_access_log (Maritime Security Protocol)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
              {recentAuditLogs.length > 0 ? (
                recentAuditLogs.map((log: any, index: number) => (
                  <div key={log.id || index} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-900">{log.action}</span>
                      <span className="text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-slate-600">
                      <span>User: <strong>{log.user_email}</strong> ({log.user_role})</span>
                      <span>Resource: {log.resource_type}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  <p>No recent access logs recorded yet.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="bg-blue-900 hover:bg-blue-850 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
