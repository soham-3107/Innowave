"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, X, ChevronDown, ChevronUp } from "lucide-react";
import { REGION_SPECIES } from "@/data/speciesData";
import { ALL_IMBL_BOUNDARIES, calculateDistanceToNearestIMBL } from "@/data/imblData";

export interface ChartLayersState {
  fishingSuitability: boolean;
  fishingGrounds: boolean;
  weatherSeaState: boolean;
  seaDepthContours: boolean;
  geologicalBorders: boolean;
  safetyTrafficAlerts: boolean;
  imblBoundary: boolean;
}

interface MapComponentProps {
  pfzs: any[];
  hazards: any[];
  tideZones?: any[];
  vesselPath: [number, number][];
  vesselIndex: number;
  routes: any;
  onSetRouteStartEnd: (start: [number, number], end: [number, number]) => void;
  activeLocation?: string;
  reports?: any[];
  onMapClick?: (coords: [number, number]) => void;
  layersState?: ChartLayersState;
  onToggleLayer?: (key: keyof ChartLayersState) => void;
  onSetLayersState?: (state: ChartLayersState) => void;
  onSelectZone?: (zone: any) => void;
}

const REGION_COORDS: Record<string, [number, number]> = {
  mumbai: [18.95, 72.80],
  goa: [15.49, 73.82],
  kochi: [9.93, 76.15],
  chennai: [13.08, 80.30],
  veraval: [20.90, 70.37],
  vizag: [17.68, 83.30]
};

// Generate realistic offshore bathymetric depth contours along the coastline
function getBathymetricContours(region: string, center: [number, number]) {
  const [lat, lon] = center;
  const isWest = ["mumbai", "goa", "kochi", "veraval"].includes(region);
  const sign = isWest ? -1 : 1;

  return [
    {
      depth: 10,
      label: "10m Depth",
      color: "#38bdf8",
      weight: 2.5,
      dash: undefined,
      path: [
        [lat - 0.28, lon + sign * 0.08] as [number, number],
        [lat - 0.12, lon + sign * 0.11] as [number, number],
        [lat, lon + sign * 0.13] as [number, number],
        [lat + 0.12, lon + sign * 0.12] as [number, number],
        [lat + 0.28, lon + sign * 0.09] as [number, number]
      ]
    },
    {
      depth: 50,
      label: "50m Depth",
      color: "#0284c7",
      weight: 2.5,
      dash: "6, 4",
      path: [
        [lat - 0.32, lon + sign * 0.22] as [number, number],
        [lat - 0.14, lon + sign * 0.26] as [number, number],
        [lat, lon + sign * 0.30] as [number, number],
        [lat + 0.14, lon + sign * 0.27] as [number, number],
        [lat + 0.32, lon + sign * 0.23] as [number, number]
      ]
    },
    {
      depth: 100,
      label: "100m Shelf",
      color: "#1e3a8a",
      weight: 3.2,
      dash: undefined,
      path: [
        [lat - 0.38, lon + sign * 0.42] as [number, number],
        [lat - 0.16, lon + sign * 0.48] as [number, number],
        [lat, lon + sign * 0.52] as [number, number],
        [lat + 0.16, lon + sign * 0.49] as [number, number],
        [lat + 0.38, lon + sign * 0.44] as [number, number]
      ]
    }
  ];
}

// Generate geological borders and sediment channels
function getGeologicalFeatures(region: string, center: [number, number]) {
  const [lat, lon] = center;
  const isWest = ["mumbai", "goa", "kochi", "veraval"].includes(region);
  const sign = isWest ? -1 : 1;

  return {
    faultLine: [
      [lat - 0.30, lon + sign * 0.34] as [number, number],
      [lat - 0.10, lon + sign * 0.37] as [number, number],
      [lat + 0.08, lon + sign * 0.35] as [number, number],
      [lat + 0.30, lon + sign * 0.39] as [number, number]
    ],
    sedimentPolygon: [
      [lat - 0.18, lon + sign * 0.16] as [number, number],
      [lat - 0.04, lon + sign * 0.20] as [number, number],
      [lat + 0.12, lon + sign * 0.17] as [number, number],
      [lat + 0.06, lon + sign * 0.12] as [number, number],
      [lat - 0.14, lon + sign * 0.11] as [number, number]
    ]
  };
}

// Generate safety traffic corridor polygon
function getTrafficCorridor(center: [number, number]): [number, number][] {
  const [lat, lon] = center;
  return [
    [lat - 0.24, lon - 0.04],
    [lat + 0.24, lon - 0.07],
    [lat + 0.24, lon + 0.01],
    [lat - 0.24, lon + 0.04]
  ];
}

export default function MapComponent({
  pfzs,
  hazards,
  tideZones = [],
  vesselPath,
  vesselIndex,
  routes,
  onSetRouteStartEnd,
  activeLocation = "mumbai",
  reports = [],
  onMapClick,
  layersState,
  onToggleLayer,
  onSetLayersState,
  onSelectZone
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const mapClickCallbackRef = useRef<any>(null);
  const zoneSelectCallbackRef = useRef<any>(null);

  // Internal layer state (default: IMBL active)
  const [internalLayers, setInternalLayers] = useState<ChartLayersState>({
    fishingSuitability: false,
    fishingGrounds: false,
    weatherSeaState: false,
    seaDepthContours: false,
    geologicalBorders: false,
    safetyTrafficAlerts: false,
    imblBoundary: true
  });

  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Use controlled props if available, otherwise local state
  const activeLayers = layersState || internalLayers;

  const handleToggle = (key: keyof ChartLayersState) => {
    if (onToggleLayer) {
      onToggleLayer(key);
    } else {
      setInternalLayers(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleSetAll = (state: ChartLayersState) => {
    if (onSetLayersState) {
      onSetLayersState(state);
    } else {
      setInternalLayers(state);
    }
  };

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  // Click outside to collapse dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLayersOpen(false);
      }
    }
    if (isLayersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLayersOpen]);

  // Dynamic ref updates prevent map recreate loops on props update
  useEffect(() => {
    mapClickCallbackRef.current = onMapClick;
    zoneSelectCallbackRef.current = onSelectZone;
  }, [onMapClick, onSelectZone]);

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

      const currentCenter = REGION_COORDS[activeLocation] || REGION_COORDS.mumbai;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView(currentCenter, 9);

        // OpenStreetMap raster tiles (100% free, no API key required)
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

      // Clear existing overlay layers
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];

      // Custom DivIcon for user boat
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

      // ==========================================
      // LAYER 1: Fishing Suitability (Green PFZ Zones)
      // ==========================================
      if (activeLayers.fishingSuitability && pfzs && pfzs.length > 0) {
        const speciesData = REGION_SPECIES[activeLocation] || REGION_SPECIES.mumbai;
        const speciesList = speciesData.primarySpecies;

        pfzs.forEach(pfz => {
          const circle = L.circle(pfz.center, {
            color: "#059669",
            fillColor: "#34d399",
            fillOpacity: 0.22,
            weight: 2,
            radius: pfz.radius_meters
          }).addTo(map);

          circle.on("click", () => {
            if (zoneSelectCallbackRef.current) {
              zoneSelectCallbackRef.current({
                ...pfz,
                layerType: "fishingSuitability",
                species: speciesList,
                scientificNames: speciesData.scientificNames,
                depthRange: speciesData.depthRangeMeters,
                recommendedGear: speciesData.recommendedGear,
                catchWindow: speciesData.catchWindow,
                cmfriStatus: speciesData.cmfriStatus
              });
            }
          });

          const speciesBadgesHtml = speciesList.map(s => `<span style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:600;display:inline-block;margin:1px;">${s}</span>`).join(" ");

          circle.bindPopup(`
            <div class="p-1 font-sans text-xs" style="min-width: 180px;">
              <div class="flex items-center gap-1 text-emerald-800 font-bold mb-1">
                <span>🐟</span>
                <span class="text-sm">${pfz.name}</span>
              </div>
              <p><strong>Chlorophyll:</strong> ${pfz.chlorophyll} mg/m³</p>
              <p><strong>SST:</strong> ${pfz.sst}°C</p>
              <p><strong>Bathymetric Depth:</strong> ${speciesData.depthRangeMeters}</p>
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #d1fae5;">
                <span style="font-size:9px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:3px;">Likely Local Species (CMFRI):</span>
                <div>${speciesBadgesHtml}</div>
              </div>
              <p class="text-emerald-700 font-semibold mt-1" style="font-size:10px;">✓ ${speciesData.cmfriStatus}</p>
            </div>
          `);

          circle.bindTooltip("PFZ Zone", {
            permanent: true,
            direction: "center",
            className: "custom-map-label"
          }).openTooltip();

          layersRef.current.push(circle);
        });
      }

      // ==========================================
      // LAYER 2: Fishing Grounds (Activity Halos)
      // ==========================================
      if (activeLayers.fishingGrounds && pfzs && pfzs.length > 0) {
        const speciesData = REGION_SPECIES[activeLocation] || REGION_SPECIES.mumbai;
        const speciesList = speciesData.primarySpecies;

        pfzs.forEach(pfz => {
          const haloRadius = Math.round(pfz.radius_meters * 1.65);
          const haloCircle = L.circle(pfz.center, {
            color: "#0d9488",
            fillColor: "#2dd4bf",
            fillOpacity: 0.12,
            weight: 2,
            dashArray: "5, 6",
            radius: haloRadius
          }).addTo(map);

          haloCircle.on("click", () => {
            if (zoneSelectCallbackRef.current) {
              zoneSelectCallbackRef.current({
                ...pfz,
                layerType: "fishingGrounds",
                species: speciesList,
                scientificNames: speciesData.scientificNames,
                depthRange: speciesData.depthRangeMeters,
                recommendedGear: speciesData.recommendedGear,
                catchWindow: speciesData.catchWindow,
                cmfriStatus: speciesData.cmfriStatus
              });
            }
          });

          const speciesBadgesHtml = speciesList.map(s => `<span style="background:#f0fdfa;color:#115e59;border:1px solid #99f6e4;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:600;display:inline-block;margin:1px;">${s}</span>`).join(" ");

          haloCircle.bindPopup(`
            <div class="p-1 font-sans text-xs" style="min-width: 180px;">
              <div class="flex items-center gap-1 text-teal-800 font-bold mb-1">
                <span>🎯</span>
                <span class="text-sm">Fishing Grounds Halo</span>
              </div>
              <p>Active fleet drift halo surrounding ${pfz.name}.</p>
              <p><strong>Halo Extent:</strong> ${(haloRadius / 1000).toFixed(1)} km radius</p>
              <p><strong>Operating Depth:</strong> ${speciesData.depthRangeMeters}</p>
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #ccfbf1;">
                <span style="font-size:9px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:3px;">Target Pelagic Species:</span>
                <div>${speciesBadgesHtml}</div>
              </div>
              <p class="text-teal-700 font-semibold mt-1" style="font-size:10px;">⚡ Gear: ${speciesData.recommendedGear}</p>
            </div>
          `);

          haloCircle.bindTooltip("Fishing Grounds Halo", {
            permanent: true,
            direction: "top",
            className: "custom-map-label-halo"
          }).openTooltip();

          layersRef.current.push(haloCircle);
        });
      }

      // ==========================================
      // LAYER 3: Weather & Sea State (Squall / Storms)
      // ==========================================
      if (activeLayers.weatherSeaState && hazards && hazards.length > 0) {
        hazards.filter(h => h.type === "storm").forEach(storm => {
          const stormCircle = L.circle(storm.center, {
            color: "#ea580c",
            fillColor: "#fca5a5",
            fillOpacity: 0.28,
            weight: 2,
            radius: storm.radius_meters
          }).addTo(map);

          stormCircle.bindPopup(`
            <div class="p-1 font-sans text-xs">
              <div class="flex items-center gap-1 text-red-700 font-bold mb-1">
                <span>⚠️</span>
                <span class="text-sm">${storm.name}</span>
              </div>
              <p><strong>Classification:</strong> ${storm.severity}</p>
              <p>${storm.description}</p>
              <p class="text-amber-800 font-semibold mt-1">🌊 High swell & squall advisory</p>
            </div>
          `);

          stormCircle.bindTooltip("Squall Zone", {
            permanent: true,
            direction: "center",
            className: "custom-map-label-weather"
          }).openTooltip();

          layersRef.current.push(stormCircle);
        });
      }

      // ==========================================
      // LAYER 4: Sea Depth Contours (10m, 50m, 100m)
      // ==========================================
      if (activeLayers.seaDepthContours) {
        const contours = getBathymetricContours(activeLocation, currentCenter);
        contours.forEach(contour => {
          const polyline = L.polyline(contour.path, {
            color: contour.color,
            weight: contour.weight,
            dashArray: contour.dash,
            opacity: 0.85
          }).addTo(map);

          polyline.bindPopup(`
            <div class="p-1 font-sans text-xs">
              <div class="flex items-center gap-1 text-sky-900 font-bold mb-1">
                <span>🌊</span>
                <span class="text-sm">${contour.label}</span>
              </div>
              <p><strong>Bathymetric Depth:</strong> ${contour.depth} meters</p>
              <p>Offshore continental shelf depth gradient.</p>
            </div>
          `);

          // Place label at middle vertex
          const midPoint = contour.path[Math.floor(contour.path.length / 2)];
          const labelMarker = L.circleMarker(midPoint, {
            radius: 2,
            opacity: 0,
            fillOpacity: 0
          }).addTo(map);

          labelMarker.bindTooltip(contour.label, {
            permanent: true,
            direction: "center",
            className: "custom-map-label-depth"
          }).openTooltip();

          layersRef.current.push(polyline);
          layersRef.current.push(labelMarker);
        });
      }

      // ==========================================
      // LAYER 5: Geological Borders (Faults & Sediment)
      // ==========================================
      if (activeLayers.geologicalBorders) {
        const geoFeatures = getGeologicalFeatures(activeLocation, currentCenter);

        // Dashed fault line
        const faultLine = L.polyline(geoFeatures.faultLine, {
          color: "#9333ea",
          weight: 2.5,
          dashArray: "8, 8",
          opacity: 0.9
        }).addTo(map);

        faultLine.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="flex items-center gap-1 text-purple-900 font-bold mb-1">
              <span>⛰️</span>
              <span class="text-sm">Continental Shelf Sediment Fault</span>
            </div>
            <p>Geological structural boundary separating inner shelf sediments from rocky seabed.</p>
          </div>
        `);

        // Label on fault line
        const midFault = geoFeatures.faultLine[1];
        const faultLabelMarker = L.circleMarker(midFault, {
          radius: 2,
          opacity: 0,
          fillOpacity: 0
        }).addTo(map);

        faultLabelMarker.bindTooltip("Sediment Fault Line", {
          permanent: true,
          direction: "center",
          className: "custom-map-label-geo"
        }).openTooltip();

        // Shaded sediment channel polygon
        const sedimentPolygon = L.polygon(geoFeatures.sedimentPolygon, {
          color: "#7c3aed",
          fillColor: "#c084fc",
          fillOpacity: 0.14,
          weight: 1.5,
          dashArray: "4, 4"
        }).addTo(map);

        sedimentPolygon.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <h4 class="font-bold text-purple-900 text-sm mb-1">Tidal Sediment Channel</h4>
            <p>Soft alluvial silt deposit corridor. Suitable for demersal species.</p>
          </div>
        `);

        layersRef.current.push(faultLine);
        layersRef.current.push(faultLabelMarker);
        layersRef.current.push(sedimentPolygon);
      }

      // ==========================================
      // LAYER 6: Safety & Traffic Alerts (Corridor + Restricted)
      // ==========================================
      if (activeLayers.safetyTrafficAlerts) {
        // Highlighted Traffic Corridor Band
        const corridorCoords = getTrafficCorridor(currentCenter);
        const corridorPolygon = L.polygon(corridorCoords, {
          color: "#d97706",
          fillColor: "#fde68a",
          fillOpacity: 0.22,
          weight: 2,
          dashArray: "6, 6"
        }).addTo(map);

        corridorPolygon.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="flex items-center gap-1 text-amber-900 font-bold mb-1">
              <span>🛡️</span>
              <span class="text-sm">Active Shipping & Safety Corridor</span>
            </div>
            <p>High-density vessel traffic corridor. Geofenced separation scheme active.</p>
          </div>
        `);

        // Label on corridor
        const corridorMid: [number, number] = [corridorCoords[0][0] + 0.05, corridorCoords[0][1]];
        const corridorLabelMarker = L.circleMarker(corridorMid, {
          radius: 2,
          opacity: 0,
          fillOpacity: 0
        }).addTo(map);

        corridorLabelMarker.bindTooltip("Safety Corridor", {
          permanent: true,
          direction: "center",
          className: "custom-map-label-corridor"
        }).openTooltip();

        layersRef.current.push(corridorPolygon);
        layersRef.current.push(corridorLabelMarker);

        // Restricted & Boundary Hazard Zones
        if (hazards && hazards.length > 0) {
          hazards.filter(h => h.type !== "storm").forEach(hazard => {
            const isBoundary = hazard.type === "boundary";
            const color = isBoundary ? "#d97706" : "#dc2626";
            const fillColor = isBoundary ? "#fde047" : "#fca5a5";

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

            let hazardLabel = isBoundary ? "Border Zone" : "Restricted Zone";
            circle.bindTooltip(hazardLabel, {
              permanent: true,
              direction: "center",
              className: "custom-map-label-hazard"
            }).openTooltip();

            layersRef.current.push(circle);
          });
        }
      }

      // ==========================================
      // LAYER 7: International Maritime Boundary Lines (IMBL)
      // ==========================================
      if (activeLayers.imblBoundary) {
        ALL_IMBL_BOUNDARIES.forEach(imbl => {
          const polyline = L.polyline(imbl.coordinates, {
            color: imbl.color,
            weight: 3.5,
            dashArray: imbl.dashArray,
            opacity: 0.95
          }).addTo(map);

          polyline.bindPopup(`
            <div class="p-1 font-sans text-xs max-w-[240px]">
              <div class="flex items-center gap-1.5 text-red-700 font-black mb-1">
                <span>🛑</span>
                <span class="text-xs">${imbl.name}</span>
              </div>
              <p class="mb-1 text-slate-700"><strong>Sector:</strong> ${imbl.sector}</p>
              <p class="mb-1 text-slate-700"><strong>Legal Protocol:</strong> ${imbl.treatyReference}</p>
              <div class="bg-red-50 border border-red-200 text-red-800 p-1 rounded font-bold text-[10px]">
                ⚠️ 5.0 NM Maritime Proximity Warning Buffer Enforced
              </div>
            </div>
          `);

          // Midpoint marker with persistent label
          const midIndex = Math.floor(imbl.coordinates.length / 2);
          const midPoint = imbl.coordinates[midIndex];
          const labelMarker = L.circleMarker(midPoint, {
            radius: 3,
            color: "#b91c1c",
            fillColor: "#ef4444",
            fillOpacity: 1
          }).addTo(map);

          labelMarker.bindTooltip(`${imbl.countryPair} IMBL`, {
            permanent: true,
            direction: "top",
            className: "custom-map-label-hazard"
          }).openTooltip();

          layersRef.current.push(polyline);
          layersRef.current.push(labelMarker);
        });

        // Draw proximity line from vessel to nearest IMBL point if within alert range
        if (vesselPath && vesselPath.length > 0 && vesselIndex < vesselPath.length) {
          const currentPos = vesselPath[vesselIndex];
          const proximity = calculateDistanceToNearestIMBL(currentPos[0], currentPos[1], 15.0);

          if (proximity.distanceNm <= 10.0) {
            const vectorLine = L.polyline([currentPos, proximity.nearestPoint], {
              color: proximity.distanceNm <= 5.0 ? "#dc2626" : "#f59e0b",
              weight: 2.5,
              dashArray: "4, 4",
              opacity: 0.9
            }).addTo(map);

            const midVector: [number, number] = [
              (currentPos[0] + proximity.nearestPoint[0]) / 2,
              (currentPos[1] + proximity.nearestPoint[1]) / 2
            ];

            const distMarker = L.circleMarker(midVector, {
              radius: 2,
              opacity: 0,
              fillOpacity: 0
            }).addTo(map);

            distMarker.bindTooltip(`⚠️ ${proximity.distanceNm.toFixed(2)} NM to IMBL`, {
              permanent: true,
              direction: "center",
              className: proximity.distanceNm <= 5.0 ? "custom-map-label-hazard" : "custom-map-label-corridor"
            }).openTooltip();

            layersRef.current.push(vectorLine);
            layersRef.current.push(distMarker);
          }
        }
      }

      // ==========================================
      // PERMANENT BASE LAYERS (Vessel & Routes)
      // ==========================================
      if (vesselPath && vesselPath.length > 0 && vesselIndex < vesselPath.length) {
        const currentPos = vesselPath[vesselIndex];
        const boatMarker = L.marker(currentPos, { icon: boatIcon }).addTo(map);
        boatMarker.bindPopup(`
          <div class="p-1 font-sans text-xs text-slate-800">
            <p class="font-bold text-blue-900 text-sm mb-1">User Vessel (ORCA-1)</p>
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

        if (vesselIndex === 0 && !activeLocation) {
          map.panTo(currentPos);
        }
      }

      // Routes Layer
      if (routes) {
        const shortestPolyline = L.polyline(routes.shortest.path, {
          color: "#ef4444",
          dashArray: "6, 6",
          weight: 4,
          opacity: 0.8
        }).addTo(map);
        layersRef.current.push(shortestPolyline);

        const saferPolyline = L.polyline(routes.safer.path, {
          color: "#1e3a8a",
          weight: 5,
          opacity: 0.9
        }).addTo(map);
        layersRef.current.push(saferPolyline);

        routes.safer.path.forEach((pt: [number, number], index: number) => {
          if (index > 0 && index < routes.safer.path.length - 1) {
            const waypointMarker = L.circleMarker(pt, {
              radius: 6,
              color: "#1e3a8a",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 3
            }).addTo(map);
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
  }, [pfzs, hazards, tideZones, vesselPath, vesselIndex, routes, reports, activeLayers, activeLocation]);

  // Layer list definitions with requested names and subtexts
  const layerList: {
    key: keyof ChartLayersState;
    name: string;
    subtext: string;
    dotColor: string;
  }[] = [
    {
      key: "imblBoundary",
      name: "International Boundary (IMBL)",
      subtext: "India-Pak & India-Sri Lanka sensitive borders",
      dotColor: "bg-red-500 border-red-600"
    },
    {
      key: "fishingSuitability",
      name: "Fishing Suitability",
      subtext: "Best modeled opportunity and species",
      dotColor: "bg-emerald-500 border-emerald-600"
    },
    {
      key: "fishingGrounds",
      name: "Fishing Grounds",
      subtext: "Activity halos around productive zones",
      dotColor: "bg-teal-500 border-teal-600"
    },
    {
      key: "weatherSeaState",
      name: "Weather & Sea State",
      subtext: "Wind, waves, visibility and temperature",
      dotColor: "bg-orange-500 border-orange-600"
    },
    {
      key: "seaDepthContours",
      name: "Sea Depth Contours",
      subtext: "10m, 50m and 100m shelf contours",
      dotColor: "bg-sky-500 border-sky-600"
    },
    {
      key: "geologicalBorders",
      name: "Geological Borders",
      subtext: "Shelf, sediment and tidal channel boundaries",
      dotColor: "bg-purple-500 border-purple-600"
    },
    {
      key: "safetyTrafficAlerts",
      name: "Safety & Traffic Alerts",
      subtext: "Corridor bands, naval buffers and geofenced zones",
      dotColor: "bg-amber-500 border-amber-600"
    }
  ];

  return (
    <div className="w-full h-full relative border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-10 animate-fade-in" />

      {/* Top-Right: Compact Dropdown Button & Floating Card */}
      <div ref={dropdownRef} className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2 text-slate-800">
        {/* Compact Dropdown Button */}
        <button
          onClick={() => setIsLayersOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md border transition-all duration-200 backdrop-blur-md cursor-pointer ${
            isLayersOpen
              ? "bg-blue-900 text-white border-blue-950 shadow-lg scale-102"
              : "bg-white/95 hover:bg-white text-slate-800 border-stone-200/90 hover:border-blue-900/40"
          }`}
          title="Toggle Chart Layers"
          aria-label="Chart Layers Dropdown"
        >
          <Layers className={`h-4 w-4 ${isLayersOpen ? "text-white" : "text-blue-900"}`} />
          <span>Chart Layers</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
              isLayersOpen
                ? "bg-blue-800 text-blue-100"
                : "bg-blue-50 border border-blue-200 text-blue-950"
            }`}
          >
            {activeCount}/7
          </span>
          {isLayersOpen ? (
            <ChevronUp className="h-3.5 w-3.5 opacity-80" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          )}
        </button>

        {/* Expandable Floating Card: "Chart Layers" */}
        {isLayersOpen && (
          <div className="w-72 bg-white/98 border border-stone-250 rounded-2xl shadow-2xl p-3.5 backdrop-blur-md animate-fade-in flex flex-col gap-2.5 select-none max-h-[430px] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-900" />
                <div>
                  <h4 className="text-xs font-extrabold text-blue-950 tracking-tight leading-none">Chart Layers</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Toggle overlay visibility</p>
                </div>
              </div>
              <button
                onClick={() => setIsLayersOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors cursor-pointer"
                title="Collapse Chart Layers"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Checklist of Layers with Names and Subtexts */}
            <div className="flex flex-col gap-1.5">
              {layerList.map(item => {
                const isChecked = activeLayers[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggle(item.key)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? "bg-blue-50/50 border-blue-150 text-slate-800 shadow-xs"
                        : "bg-stone-50/50 border-transparent text-slate-400 hover:bg-stone-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`w-2.5 h-2.5 rounded-full border shadow-xs flex-shrink-0 ${item.dotColor}`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-xs font-bold leading-snug truncate ${isChecked ? "text-blue-950" : "text-slate-600"}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          {item.subtext}
                        </span>
                      </div>
                    </div>

                    {/* Smooth Toggle Switch */}
                    <div
                      className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out flex-shrink-0 ${
                        isChecked ? "bg-blue-900" : "bg-stone-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          isChecked ? "translate-x-3.5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-semibold text-slate-500 px-1">
              <button
                onClick={() =>
                  handleSetAll({
                    fishingSuitability: true,
                    fishingGrounds: true,
                    weatherSeaState: true,
                    seaDepthContours: true,
                    geologicalBorders: true,
                    safetyTrafficAlerts: true,
                    imblBoundary: true
                  })
                }
                className="hover:text-blue-950 text-blue-900 font-bold transition-colors cursor-pointer"
              >
                All On
              </button>
              <span className="text-stone-300">•</span>
              <button
                onClick={() =>
                  handleSetAll({
                    fishingSuitability: false,
                    fishingGrounds: false,
                    weatherSeaState: false,
                    seaDepthContours: false,
                    geologicalBorders: false,
                    safetyTrafficAlerts: false,
                    imblBoundary: false
                  })
                }
                className="hover:text-red-700 text-slate-500 transition-colors cursor-pointer"
              >
                All Off
              </button>
              <span className="text-stone-300">•</span>
              <button
                onClick={() =>
                  handleSetAll({
                    fishingSuitability: false,
                    fishingGrounds: false,
                    weatherSeaState: false,
                    seaDepthContours: false,
                    geologicalBorders: false,
                    safetyTrafficAlerts: false,
                    imblBoundary: true
                  })
                }
                className="hover:text-blue-950 text-slate-500 transition-colors cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom-Right: ORCA Vessel Coordinates Telemetry */}
      <div className="absolute bottom-2 right-2 bg-white/95 border border-slate-200 px-3 py-2 rounded-lg z-20 text-xs font-mono max-w-[200px] shadow-md pointer-events-none text-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>
          <span className="text-blue-900 font-bold">ORCA-1 Vessel Active</span>
        </div>
        <div>
          Lat: {vesselPath[vesselIndex]?.[0].toFixed(4)}<br />
          Lon: {vesselPath[vesselIndex]?.[1].toFixed(4)}
        </div>
      </div>
    </div>
  );
}
