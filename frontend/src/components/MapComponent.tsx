"use client";

import { useEffect, useRef } from "react";

interface MapComponentProps {
  pfzs: any[];
  hazards: any[];
  vesselPath: [number, number][];
  vesselIndex: number;
  routes: any;
  onSetRouteStartEnd: (start: [number, number], end: [number, number]) => void;
  activeLocation?: string;
  reports?: any[];
  onMapClick?: (coords: [number, number]) => void;
}

const REGION_COORDS: Record<string, [number, number]> = {
  mumbai: [18.95, 72.80],
  goa: [15.49, 73.82],
  kochi: [9.93, 76.15],
  chennai: [13.08, 80.30],
  veraval: [20.90, 70.37],
  vizag: [17.68, 83.30]
};

export default function MapComponent({
  pfzs,
  hazards,
  vesselPath,
  vesselIndex,
  routes,
  onSetRouteStartEnd,
  activeLocation = "mumbai",
  reports = [],
  onMapClick
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const mapClickCallbackRef = useRef<any>(null);

  // Dynamic ref updates prevent map recreate loops on props update
  useEffect(() => {
    mapClickCallbackRef.current = onMapClick;
  }, [onMapClick]);

  // Monitor location synchronization and pan view
  useEffect(() => {
    if (mapRef.current && activeLocation) {
      const coords = REGION_COORDS[activeLocation] || REGION_COORDS.mumbai;
      mapRef.current.setView(coords, 9);
    }
  }, [activeLocation]);

  useEffect(() => {
    let L: any;
    let isMounted = true;

    async function initMap() {
      L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      if (!mapRef.current) {
        const initialCoords = REGION_COORDS[activeLocation] || REGION_COORDS.mumbai;
        mapRef.current = L.map(mapContainerRef.current).setView(initialCoords, 9);

        // OpenStreetMap - 100% free and open, zero API key watermarks!
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapRef.current);

        // Bind clicking events once
        mapRef.current.on("click", (e: any) => {
          if (mapClickCallbackRef.current) {
            mapClickCallbackRef.current([e.latlng.lat, e.latlng.lng]);
          }
        });
      }

      const map = mapRef.current;

      // Clear layers
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];

      // Navy highlighted custom DivIcon for boat
      const boatIcon = L.divIcon({
        className: "custom-boat-icon",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-blue-600 opacity-20"></span>
            <div class="relative bg-blue-900 text-white p-2 rounded-full border-2 border-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transform -rotate-45">
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // 1. PFZ Zones (Green circles)
      pfzs.forEach(pfz => {
        const circle = L.circle(pfz.center, {
          color: "#059669",
          fillColor: "#34d399",
          fillOpacity: 0.15,
          weight: 2,
          radius: pfz.radius_meters
        }).addTo(map);

        circle.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <h3 class="font-bold text-emerald-800 text-sm mb-1">${pfz.name}</h3>
            <p><strong>Chlorophyll:</strong> ${pfz.chlorophyll} mg/m³</p>
            <p><strong>SST:</strong> ${pfz.sst}°C</p>
            <p class="text-emerald-700 font-semibold mt-1">✓ High Potential Fishing Zone</p>
          </div>
        `);

        // Visible centered tag label
        circle.bindTooltip("PFZ Zone", {
          permanent: true,
          direction: "center",
          className: "custom-map-label"
        }).openTooltip();

        layersRef.current.push(circle);
      });

      // 2. Hazard Zones (Red/Yellow circles)
      hazards.forEach(hazard => {
        const isStorm = hazard.type === "storm";
        const isBoundary = hazard.type === "boundary";
        
        const color = isStorm ? "#dc2626" : isBoundary ? "#d97706" : "#ea580c";
        const fillColor = isStorm ? "#fca5a5" : isBoundary ? "#fde047" : "#fdba74";

        const circle = L.circle(hazard.center, {
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.25,
          weight: 2,
          radius: hazard.radius_meters
        }).addTo(map);

        circle.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <h3 class="font-bold text-red-700 text-sm mb-1">${hazard.name}</h3>
            <p><strong>Classification:</strong> ${hazard.severity}</p>
            <p>${hazard.description}</p>
          </div>
        `);

        // Match clean labels based on hazard content
        let hazardLabel = "Squall Zone";
        const name_lower = hazard.name.toLowerCase();
        if (name_lower.includes("naval") || name_lower.includes("military") || name_lower.includes("restricted")) {
          hazardLabel = "Restricted Zone";
        } else if (name_lower.includes("border") || name_lower.includes("boundary") || name_lower.includes("imbl")) {
          hazardLabel = "Border Zone";
        } else if (name_lower.includes("storm") || name_lower.includes("cyclone") || name_lower.includes("squall")) {
          hazardLabel = "Storm Zone";
        }

        circle.bindTooltip(hazardLabel, {
          permanent: true,
          direction: "center",
          className: "custom-map-label-hazard"
        }).openTooltip();

        layersRef.current.push(circle);
      });

      // 3. Community Reports Pins (Distinct Indigo Speech Bubble Icons)
      if (reports && reports.length > 0) {
        const reportIcon = L.divIcon({
          className: "custom-report-icon",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="bg-indigo-900 border-2 border-white text-white p-1.5 rounded-full shadow-md hover:bg-indigo-850 hover:scale-105 transition-all duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        reports.forEach(rep => {
          const marker = L.marker([rep.lat, rep.lon], { icon: reportIcon }).addTo(map);
          marker.bindPopup(`
            <div class="p-2 font-sans text-xs text-slate-800 max-w-[200px]">
              <div class="flex justify-between items-center mb-1 pb-1 border-b border-stone-100">
                <span class="font-extrabold text-indigo-900 uppercase tracking-wider text-[9px] bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">${rep.type}</span>
                <span class="text-[9px] text-slate-400 font-mono font-medium">${rep.timestamp}</span>
              </div>
              <p class="text-slate-650 leading-relaxed italic">"${rep.text}"</p>
              <p class="text-[9px] text-slate-400 mt-1 font-mono">Coords: ${rep.lat.toFixed(4)}, ${rep.lon.toFixed(4)}</p>
            </div>
          `);
          layersRef.current.push(marker);
        });
      }

      // 4. Plot Current Vessel Marker
      if (vesselPath && vesselPath.length > 0 && vesselIndex < vesselPath.length) {
        const currentPos = vesselPath[vesselIndex];
        const boatMarker = L.marker(currentPos, { icon: boatIcon }).addTo(map);
        boatMarker.bindPopup(`
          <div class="p-1 font-sans text-xs text-slate-800">
            <p class="font-bold text-blue-900 text-sm mb-1">User Vessel (INNOWAVE-1)</p>
            <p>Coordinates: ${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}</p>
            <button id="set-route-start" class="mt-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-1.5 px-3 rounded w-full transition duration-150 shadow-sm">
              Set Route Start
            </button>
          </div>
        `);
        
        boatMarker.on("popupopen", () => {
          document.getElementById("set-route-start")?.addEventListener("click", () => {
            const endPos: [number, number] = [18.70, 72.40];
            onSetRouteStartEnd(currentPos, endPos);
            boatMarker.closePopup();
          });
        });

        layersRef.current.push(boatMarker);

        // Center on initial boat index only if active location is not explicit
        if (vesselIndex === 0 && !activeLocation) {
          map.panTo(currentPos);
        }
      }

      // 5. Navigation Routes
      if (routes) {
        // Shortest Route - Red dashed line
        const shortestPolyline = L.polyline(routes.shortest.path, {
          color: "#ef4444",
          dashArray: "6, 6",
          weight: 4,
          opacity: 0.8
        }).addTo(map);
        
        shortestPolyline.bindPopup(`
          <div class="p-1 text-xs">
            <p class="font-bold text-red-600">${routes.shortest.label}</p>
            <p>Distance: ${routes.shortest.distance_km} km</p>
            <p class="text-red-600 font-semibold">⚠️ Safety: HIGH RISK</p>
          </div>
        `);
        layersRef.current.push(shortestPolyline);

        // Safer Route - Solid Navy Blue line
        const saferPolyline = L.polyline(routes.safer.path, {
          color: "#1e3a8a",
          weight: 5,
          opacity: 0.9
        }).addTo(map);

        saferPolyline.bindPopup(`
          <div class="p-1 text-xs">
            <p class="font-bold text-blue-950">${routes.safer.label}</p>
            <p>Distance: ${routes.safer.distance_km} km</p>
            <p class="text-emerald-700 font-semibold">✓ Safety: RECOMMENDED BYPASS</p>
          </div>
        `);
        layersRef.current.push(saferPolyline);

        // Waypoints
        routes.safer.path.forEach((pt: [number, number], index: number) => {
          if (index > 0 && index < routes.safer.path.length - 1) {
            const waypointMarker = L.circleMarker(pt, {
              radius: 6,
              color: "#1e3a8a",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 3
            }).addTo(map);
            waypointMarker.bindPopup(`<span class="text-xs font-semibold text-blue-900">Bypass Coordinates Waypoint</span>`);
            layersRef.current.push(waypointMarker);
          }
        });

        const bounds = L.latLngBounds([routes.shortest.path[0], routes.shortest.path[1]]);
        if (routes.safer.path[1]) {
          bounds.extend(routes.safer.path[1]);
        }
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [pfzs, hazards, vesselPath, vesselIndex, routes, reports]);

  return (
    <div className="w-full h-full relative border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-10 animate-fade-in" />
      <div className="absolute bottom-2 right-2 bg-white/95 border border-slate-200 px-3 py-2 rounded-lg z-20 text-xs font-mono max-w-[200px] shadow-md pointer-events-none text-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>
          <span className="text-blue-900 font-bold">INNOWAVE-1 Vessel Active</span>
        </div>
        <div>
          Lat: {vesselPath[vesselIndex]?.[0].toFixed(4)}<br />
          Lon: {vesselPath[vesselIndex]?.[1].toFixed(4)}
        </div>
      </div>
    </div>
  );
}
