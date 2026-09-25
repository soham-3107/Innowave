/**
 * International Maritime Boundary Line (IMBL) Data & Calculations
 * Real coordinates for India-Pakistan and India-Sri Lanka maritime boundaries
 * established under UNCLOS and bilateral treaties.
 */

export interface IMBLFeature {
  id: string;
  name: string;
  countryPair: string;
  treatyReference: string;
  sector: string;
  color: string;
  dashArray: string;
  coordinates: [number, number][]; // [lat, lon]
}

// 1. India - Pakistan IMBL (Arabian Sea / Sir Creek / Gujarat - Sindh sector)
export const INDIA_PAKISTAN_IMBL: IMBLFeature = {
  id: "imbl-india-pakistan",
  name: "India - Pakistan International Maritime Boundary Line",
  countryPair: "India - Pakistan",
  treatyReference: "Sir Creek Maritime Delimitation & 200nm Arabian Sea EEZ Boundary",
  sector: "Gujarat Coast / Arabian Sea Sector",
  color: "#ef4444",
  dashArray: "8, 6",
  coordinates: [
    [23.6800, 68.0300], // Near Sir Creek mouth
    [23.5200, 67.8000],
    [23.2500, 67.4200],
    [22.8000, 66.8500],
    [22.3500, 66.2800],
    [21.8000, 65.5000],
    [21.1500, 64.6000],
    [20.5000, 63.7000]  // 200 NM Exclusive Economic Zone Limit
  ]
};

// 2. India - Sri Lanka IMBL (Palk Strait, Palk Bay, Gulf of Mannar, Indian Ocean)
// Established under the 1974 & 1976 India-Sri Lanka Maritime Agreements
export const INDIA_SRI_LANKA_IMBL: IMBLFeature = {
  id: "imbl-india-sri-lanka",
  name: "India - Sri Lanka International Maritime Boundary Line",
  countryPair: "India - Sri Lanka",
  treatyReference: "1974 & 1976 Historic Waters & Maritime Boundary Agreements",
  sector: "Palk Bay & Gulf of Mannar Sector",
  color: "#dc2626",
  dashArray: "8, 6",
  coordinates: [
    [10.0833, 80.0500], // Palk Strait (Bay of Bengal entry)
    [9.9833, 79.8833],
    [9.8333, 79.6833],
    [9.6667, 79.5333],
    [9.5000, 79.4333],  // Kachchatheevu Sector
    [9.3667, 79.3667],  // Dhanushkodi - Talaimannar (Adam's Bridge)
    [9.1000, 79.4500],  // Gulf of Mannar Entry
    [8.8667, 79.3333],
    [8.3667, 78.9167],
    [7.8333, 78.4167],
    [7.0000, 77.8333]   // Southern Indian Ocean EEZ Boundary
  ]
};

export const ALL_IMBL_BOUNDARIES: IMBLFeature[] = [
  INDIA_PAKISTAN_IMBL,
  INDIA_SRI_LANKA_IMBL
];

// GeoJSON FeatureCollection representation for mapping
export const IMBL_GEOJSON = {
  type: "FeatureCollection",
  features: ALL_IMBL_BOUNDARIES.map(imbl => ({
    type: "Feature",
    properties: {
      id: imbl.id,
      name: imbl.name,
      countryPair: imbl.countryPair,
      treatyReference: imbl.treatyReference,
      sector: imbl.sector,
      stroke: imbl.color,
      strokeWidth: 3
    },
    geometry: {
      type: "LineString",
      coordinates: imbl.coordinates.map(([lat, lon]) => [lon, lat]) // GeoJSON uses [lon, lat]
    }
  }))
};

/**
 * Calculates haversine distance between two GPS coordinates in kilometers.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates minimum perpendicular or vertex distance from a point to a line segment.
 */
function distanceToSegmentKm(
  pLat: number,
  pLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): { distKm: number; nearestPoint: [number, number] } {
  // Simple flat approximation for short segments
  const x = (bLon - aLon) * Math.cos(((aLat + bLat) / 2 * Math.PI) / 180);
  const y = bLat - aLat;
  const px = (pLon - aLon) * Math.cos(((aLat + bLat) / 2 * Math.PI) / 180);
  const py = pLat - aLat;

  const lenSq = x * x + y * y;
  let t = 0;
  if (lenSq > 0) {
    t = Math.max(0, Math.min(1, (px * x + py * y) / lenSq));
  }

  const projLat = aLat + t * (bLat - aLat);
  const projLon = aLon + t * (bLon - aLon);

  return {
    distKm: haversineKm(pLat, pLon, projLat, projLon),
    nearestPoint: [projLat, projLon]
  };
}

export interface IMBLProximityResult {
  nearestBoundary: IMBLFeature;
  distanceKm: number;
  distanceNm: number;
  nearestPoint: [number, number];
  isAlert: boolean; // True when distance <= threshold (default 5 NM)
  alertSeverity: "CRITICAL" | "WARNING" | "CAUTION" | "SAFE";
  threatMessage: string;
}

/**
 * Calculates live distance from vessel GPS coordinates to the closest IMBL segment.
 * 1 Nautical Mile = 1.852 Kilometers
 * Alert Threshold: 5.0 Nautical Miles (~9.26 km)
 */
export function calculateDistanceToNearestIMBL(
  vesselLat: number,
  vesselLon: number,
  alertThresholdNm: number = 5.0
): IMBLProximityResult {
  let minDistanceKm = Infinity;
  let nearestBoundary = INDIA_PAKISTAN_IMBL;
  let nearestCoord: [number, number] = INDIA_PAKISTAN_IMBL.coordinates[0];

  for (const boundary of ALL_IMBL_BOUNDARIES) {
    const coords = boundary.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const segA = coords[i];
      const segB = coords[i + 1];
      const { distKm, nearestPoint } = distanceToSegmentKm(
        vesselLat,
        vesselLon,
        segA[0],
        segA[1],
        segB[0],
        segB[1]
      );

      if (distKm < minDistanceKm) {
        minDistanceKm = distKm;
        nearestBoundary = boundary;
        nearestCoord = nearestPoint;
      }
    }
  }

  const distanceNm = minDistanceKm / 1.852;
  const isAlert = distanceNm <= alertThresholdNm;

  let alertSeverity: "CRITICAL" | "WARNING" | "CAUTION" | "SAFE" = "SAFE";
  let threatMessage = `Operating inside safe Indian territorial waters (${distanceNm.toFixed(1)} NM from ${nearestBoundary.countryPair} IMBL).`;

  if (distanceNm <= 2.0) {
    alertSeverity = "CRITICAL";
    threatMessage = `IMMEDIATE HAZARD: Vessel is ${distanceNm.toFixed(2)} NM (${minDistanceKm.toFixed(2)} km) from ${nearestBoundary.name}. Risk of international maritime boundary crossing. Alter heading immediately.`;
  } else if (distanceNm <= 5.0) {
    alertSeverity = "WARNING";
    threatMessage = `SENSITIVE BOUNDARY ALERT: Vessel is ${distanceNm.toFixed(2)} NM (${minDistanceKm.toFixed(2)} km) from ${nearestBoundary.name}. Enforcing 5 NM maritime buffer protocol.`;
  } else if (distanceNm <= 10.0) {
    alertSeverity = "CAUTION";
    threatMessage = `CAUTION: Approaching ${nearestBoundary.countryPair} buffer sector (${distanceNm.toFixed(1)} NM). Maintain navigational vigilance.`;
  }

  return {
    nearestBoundary,
    distanceKm: minDistanceKm,
    distanceNm,
    nearestPoint: nearestCoord,
    isAlert,
    alertSeverity,
    threatMessage
  };
}
