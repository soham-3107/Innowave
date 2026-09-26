/**
 * ORCA Marine Intelligence - IndexedDB Offline Storage Service
 * Persists regional telemetry, PFZ coordinates, hazards, tides, species, risk scores, and safety alerts.
 */

export interface CoastalRegionData {
  regionKey: string;
  name: string;
  name_hi?: string;
  name_mr?: string;
  timestamp: number;
  lastSyncedDate: string;
  weather: {
    wind_speed: number;
    wind_speed_kmh: number;
    wind_gusts: number;
    wind_direction: string;
    barometric_pressure: number;
    pressure_trend: string;
    humidity: number;
    visibility_nm: number;
    condition: string;
    air_temperature: number;
    warnings: string[];
  };
  ocean: {
    wave_height: number;
    sst: number;
    swell_period: number;
    swell_direction: string;
    sea_state: string;
    current_speed: number;
    current_direction: string;
    underwater_visibility_m?: number;
  };
  satellite: {
    chlorophyll: number;
    sst_anomaly: number;
    pfz_status: string;
    thermal_front: string;
    plankton_density?: string;
    sensor_source?: string;
  };
  tide: {
    high_tide_1: string;
    low_tide_1: string;
    high_tide_2?: string;
    low_tide_2?: string;
    current_speed?: string;
    sandbar_clearance_m?: number;
  };
  dangerIndex: number;
  dangerLevel: "SAFE" | "CAUTION" | "DANGER";
  safetyExplanation: string;
  speciesInfo: {
    primarySpecies: string[];
    scientificNames?: string[];
    depthRangeMeters: string;
    recommendedGear: string;
    catchWindow: string;
    cmfriStatus: string;
    prices?: string;
  };
  pfzs: any[];
  hazards: any[];
  tideZones: any[];
  reports: any[];
  emergency: {
    helpline: string;
    vhf: string;
  };
}

export interface PendingReport {
  id?: number;
  type: string;
  text: string;
  lat: number;
  lon: number;
  timestamp: string;
  createdAt: number;
}

const DB_NAME = "orca_marine_offline_db";
const DB_VERSION = 1;
const STORE_REGIONS = "coastal_regions";
const STORE_META = "app_metadata";
const STORE_PENDING_REPORTS = "pending_reports";

// Initial baseline mock data used for initial offline seed if never fetched online
const DEFAULT_SEED_DATA: Record<string, CoastalRegionData> = {
  mumbai: {
    regionKey: "mumbai",
    name: "Mumbai Coast",
    name_hi: "मुंबई तट",
    name_mr: "मुंबई किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 12.5,
      wind_speed_kmh: 23.2,
      wind_gusts: 16.0,
      wind_direction: "WSW",
      barometric_pressure: 1012.4,
      pressure_trend: "Steady",
      humidity: 74,
      visibility_nm: 6.5,
      condition: "Partly Cloudy",
      air_temperature: 29.5,
      warnings: []
    },
    ocean: {
      wave_height: 1.2,
      sst: 28.2,
      swell_period: 8.0,
      swell_direction: "WSW (245°)",
      sea_state: "Slightly Rough (Douglas Scale 3)",
      current_speed: 0.6,
      current_direction: "SSE",
      underwater_visibility_m: 4.5
    },
    satellite: {
      chlorophyll: 4.8,
      sst_anomaly: 0.4,
      pfz_status: "High Potential Zone",
      thermal_front: "28.2°C to 27.4°C convergence boundary located 18-32 km offshore WSW",
      plankton_density: "High (Diatom bloom active)",
      sensor_source: "ISRO Oceansat-3 (EOS-06)"
    },
    tide: {
      high_tide_1: "05:42 AM (3.8m)",
      low_tide_1: "11:58 AM (1.1m)",
      high_tide_2: "18:15 PM (3.5m)",
      low_tide_2: "00:20 AM (0.9m)",
      current_speed: "1.2 knots (Ebb)",
      sandbar_clearance_m: 2.2
    },
    dangerIndex: 18,
    dangerLevel: "SAFE",
    safetyExplanation: "Conditions are normal and favorable for all small and mechanized fishing vessels.",
    speciesInfo: {
      primarySpecies: ["Indian Mackerel", "Silver Pomfret", "Bombay Duck", "Oil Sardines"],
      scientificNames: ["Rastrelliger kanagurta", "Pampus argenteus", "Harpadon nehereus", "Sardinella longiceps"],
      depthRangeMeters: "15 - 45m Shelf Contours",
      recommendedGear: "Pelagic Drift Nets & Gillnets",
      catchWindow: "Early Morning (05:00 - 09:30 AM)",
      cmfriStatus: "High Pelagic Biomass Zone",
      prices: "₹750 - ₹950/kg for Pomfret, ₹140 - ₹220/kg for Mackerel"
    },
    pfzs: [
      { id: "pfz-mumbai", name: "Mumbai Offshore PFZ", center: [18.70, 72.40], radius_meters: 12000, chlorophyll: 4.8, sst: 28.2, type: "pfz" }
    ],
    hazards: [
      { id: "naval-mumbai", name: "Naval Dockyard Restricted Zone", center: [18.928, 72.846], radius_meters: 3000, severity: "RESTRICTED", description: "Naval movements only", type: "military" },
      { id: "storm-bypass-mumbai", name: "Active Squall Area", center: [18.82, 72.62], radius_meters: 15000, severity: "DANGER", description: "Squall corridor with wind shear", type: "storm" }
    ],
    tideZones: [
      { id: "tide-mumbai", name: "Mumbai Harbor Tidal Station", center: [18.93, 72.85], radius_meters: 6000, high_tide: "05:42 AM (3.8m)", low_tide: "11:58 AM (1.1m)", current_speed: "1.2 knots (Ebb)", type: "tide" }
    ],
    reports: [
      { id: 1, type: "Good Catch", text: "Heavy Silver Pomfret shoaling at 22m depth contour west of Sassoon Docks.", lat: 18.91, lon: 72.75, timestamp: "25 mins ago", region: "mumbai" },
      { id: 2, type: "Hazard", text: "Discarded nylon gillnet snagged near outer harbor channel buoy.", lat: 18.89, lon: 72.79, timestamp: "1 hour ago", region: "mumbai" }
    ],
    emergency: {
      helpline: "1554 (MRCC Mumbai 022-24316558)",
      vhf: "VHF Channel 16 (156.800 MHz)"
    }
  },
  goa: {
    regionKey: "goa",
    name: "Goa Coast",
    name_hi: "गोवा तट",
    name_mr: "गोवा किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 9.5,
      wind_speed_kmh: 17.6,
      wind_gusts: 13.0,
      wind_direction: "NW",
      barometric_pressure: 1013.2,
      pressure_trend: "Steady",
      humidity: 68,
      visibility_nm: 9.0,
      condition: "Sunny and Clear",
      air_temperature: 30.2,
      warnings: []
    },
    ocean: {
      wave_height: 0.8,
      sst: 28.7,
      swell_period: 7.2,
      swell_direction: "WNW (290°)",
      sea_state: "Calm (Douglas Scale 2)",
      current_speed: 0.4,
      current_direction: "SE",
      underwater_visibility_m: 6.0
    },
    satellite: {
      chlorophyll: 5.1,
      sst_anomaly: 0.3,
      pfz_status: "Prime Catch Zone",
      thermal_front: "Strong 28.5°C to 27.8°C thermal gradient running parallel 20-40 km offshore",
      plankton_density: "Optimal",
      sensor_source: "ISRO Oceansat-3 & MODIS"
    },
    tide: {
      high_tide_1: "06:15 AM (1.8m)",
      low_tide_1: "12:20 PM (0.3m)",
      high_tide_2: "18:40 PM (1.7m)",
      low_tide_2: "00:50 AM (0.2m)",
      current_speed: "0.7 knots (Flood)",
      sandbar_clearance_m: 1.6
    },
    dangerIndex: 15,
    dangerLevel: "SAFE",
    safetyExplanation: "Calm sea state and optimal chlorophyll fronts make today an ideal harvest window.",
    speciesInfo: {
      primarySpecies: ["Kingfish (Surmai)", "Yellowfin Tuna", "Indian Mackerel", "Seer Fish"],
      scientificNames: ["Scomberomorus commerson", "Thunnus albacares", "Rastrelliger kanagurta", "Scomberomorus guttatus"],
      depthRangeMeters: "25 - 60m Mid-Shelf",
      recommendedGear: "Trolling Lines & Hook-and-Line",
      catchWindow: "Dawn & Dusk Tidal Influx",
      cmfriStatus: "Prime Pelagic Predator Corridor",
      prices: "₹650 - ₹900/kg for Surmai, ₹240 - ₹350/kg for Tuna"
    },
    pfzs: [
      { id: "pfz-goa", name: "Goa Coast PFZ", center: [15.49, 73.82], radius_meters: 9000, chlorophyll: 5.1, sst: 28.5, type: "pfz" }
    ],
    hazards: [],
    tideZones: [
      { id: "tide-goa", name: "Mormugao Bay Tidal Observatory", center: [15.41, 73.80], radius_meters: 5000, high_tide: "06:15 AM (1.8m)", low_tide: "12:20 PM (0.3m)", current_speed: "0.7 knots (Flood)", type: "tide" }
    ],
    reports: [
      { id: 3, type: "Good Catch", text: "Kingfish surface schools spotted 14 nm southwest of Mormugao breakwater.", lat: 15.35, lon: 73.70, timestamp: "40 mins ago", region: "goa" }
    ],
    emergency: {
      helpline: "1554 (ICG Station Goa 0832-2520616)",
      vhf: "VHF Channel 16"
    }
  },
  kochi: {
    regionKey: "kochi",
    name: "Kochi Coast",
    name_hi: "कोच्चि तट",
    name_mr: "कोची किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 28.0,
      wind_speed_kmh: 51.8,
      wind_gusts: 38.0,
      wind_direction: "W",
      barometric_pressure: 998.2,
      pressure_trend: "Falling Rapidly",
      humidity: 92,
      visibility_nm: 2.0,
      condition: "Severe Thunderstorm / Squall Advisory",
      air_temperature: 25.8,
      warnings: ["Squall Warning: Gale winds exceeding 35 kts", "High Wave Advisory (3.8m swell)"]
    },
    ocean: {
      wave_height: 3.8,
      sst: 26.5,
      swell_period: 12.0,
      swell_direction: "WSW (240°)",
      sea_state: "Rough to Very Rough (Douglas Scale 6)",
      current_speed: 1.8,
      current_direction: "SSE",
      underwater_visibility_m: 1.2
    },
    satellite: {
      chlorophyll: 1.4,
      sst_anomaly: -0.8,
      pfz_status: "Unfavorable",
      thermal_front: "Disrupted by monsoonal cyclonic wind shear",
      plankton_density: "Low",
      sensor_source: "ISRO Oceansat-3"
    },
    tide: {
      high_tide_1: "04:12 AM (1.4m)",
      low_tide_1: "10:30 AM (0.4m)",
      high_tide_2: "16:45 PM (1.3m)",
      low_tide_2: "22:50 PM (0.3m)",
      current_speed: "2.1 knots (Turbulent)",
      sandbar_clearance_m: 1.8
    },
    dangerIndex: 75,
    dangerLevel: "DANGER",
    safetyExplanation: "HIGH RISK: Severe cyclonic squall, gale gusts to 38 kts, and 3.8m swells. All small craft advised to remain in harbor.",
    speciesInfo: {
      primarySpecies: ["Indian Oil Sardines", "Malabar Anchovy", "Karikkadi Prawns", "Threadfin Bream"],
      scientificNames: ["Sardinella longiceps", "Encrasicholina devisi", "Parapenaeopsis stylifera", "Nemipterus japonicus"],
      depthRangeMeters: "10 - 35m Coastal Upwelling",
      recommendedGear: "Ring Seine & Bottom Trawls (Suspended)",
      catchWindow: "Not recommended during active squall",
      cmfriStatus: "High Inshore Coastal Shoaling (Storm Disrupt)",
      prices: "₹120 - ₹180/kg for Sardines"
    },
    pfzs: [],
    hazards: [
      { id: "storm-kochi", name: "Kochi Cyclonic Wind Zone", center: [9.93, 76.15], radius_meters: 35000, severity: "DANGER", description: "Wind speed 28 knots, waves 3.8m. Heavy thunderstorms present.", type: "storm" }
    ],
    tideZones: [
      { id: "tide-kochi", name: "Cochin Inlet Tidal Rip Zone", center: [9.97, 76.22], radius_meters: 6500, high_tide: "04:12 AM (1.4m)", low_tide: "10:30 AM (0.4m)", current_speed: "2.1 knots (Turbulent)", type: "tide" }
    ],
    reports: [
      { id: 4, type: "Hazard", text: "Dangerous 3.8m breaking surf near Cochin bar mouth. Ingress risky.", lat: 9.96, lon: 76.21, timestamp: "15 mins ago", region: "kochi" }
    ],
    emergency: {
      helpline: "1554 (MRCC Kochi 0484-2218844)",
      vhf: "VHF Channel 16"
    }
  },
  chennai: {
    regionKey: "chennai",
    name: "Chennai Coast",
    name_hi: "चेन्नई तट",
    name_mr: "चेन्नई किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 10.0,
      wind_speed_kmh: 18.5,
      wind_gusts: 14.0,
      wind_direction: "ENE",
      barometric_pressure: 1011.8,
      pressure_trend: "Steady",
      humidity: 78,
      visibility_nm: 7.5,
      condition: "Passing Clouds",
      air_temperature: 30.8,
      warnings: []
    },
    ocean: {
      wave_height: 0.9,
      sst: 29.5,
      swell_period: 6.8,
      swell_direction: "E (090°)",
      sea_state: "Slight (Douglas Scale 2)",
      current_speed: 0.5,
      current_direction: "NNE",
      underwater_visibility_m: 5.0
    },
    satellite: {
      chlorophyll: 3.1,
      sst_anomaly: 0.2,
      pfz_status: "Moderate Potential",
      thermal_front: "Stable Front (3.1 mg/m³)",
      plankton_density: "Moderate",
      sensor_source: "ISRO Oceansat-3"
    },
    tide: {
      high_tide_1: "06:30 AM (1.2m)",
      low_tide_1: "12:45 PM (0.2m)",
      high_tide_2: "18:55 PM (1.1m)",
      low_tide_2: "01:00 AM (0.1m)",
      current_speed: "0.4 knots (Slack)",
      sandbar_clearance_m: 2.0
    },
    dangerIndex: 12,
    dangerLevel: "SAFE",
    safetyExplanation: "Mild easterly swell and good visibility across Coromandel shelf.",
    speciesInfo: {
      primarySpecies: ["Ribbonfish", "Squid & Cuttlefish", "Tiger Prawns", "Lesser Sardines"],
      scientificNames: ["Trichiurus lepturus", "Uroteuthis duvaucelii", "Penaeus monodon", "Sardinella gibbosa"],
      depthRangeMeters: "20 - 50m Shelf Boundary",
      recommendedGear: "Trawl Nets & Light Jigging",
      catchWindow: "Late Evening & Night Drift",
      cmfriStatus: "Active Cephalopod & Demersal Shoal",
      prices: "₹300 - ₹450/kg for Squid, ₹450 - ₹650/kg for Tiger Prawns"
    },
    pfzs: [
      { id: "pfz-chennai", name: "Coromandel Offshore PFZ", center: [12.90, 80.60], radius_meters: 10000, chlorophyll: 3.1, sst: 29.5, type: "pfz" }
    ],
    hazards: [],
    tideZones: [
      { id: "tide-chennai", name: "Chennai Port Tidal Station", center: [13.10, 80.32], radius_meters: 5000, high_tide: "06:30 AM (1.2m)", low_tide: "12:45 PM (0.2m)", current_speed: "0.4 knots (Slack)", type: "tide" }
    ],
    reports: [
      { id: 5, type: "Good Catch", text: "Squid schools gathering near illuminated drift buoys 12 km east of Marina.", lat: 13.05, lon: 80.38, timestamp: "55 mins ago", region: "chennai" }
    ],
    emergency: {
      helpline: "1554 (MRCC Chennai 044-23460405)",
      vhf: "VHF Channel 16"
    }
  },
  veraval: {
    regionKey: "veraval",
    name: "Veraval / Gujarat Coast",
    name_hi: "वेरावल तट",
    name_mr: "वेरावळ किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 16.5,
      wind_speed_kmh: 30.5,
      wind_gusts: 22.0,
      wind_direction: "NW",
      barometric_pressure: 1010.5,
      pressure_trend: "Steady",
      humidity: 65,
      visibility_nm: 8.0,
      condition: "Breezy / High Bio-Production",
      air_temperature: 28.0,
      warnings: ["Caution: High bio-production zone close to International Maritime Boundary"]
    },
    ocean: {
      wave_height: 1.9,
      sst: 27.0,
      swell_period: 8.5,
      swell_direction: "WNW",
      sea_state: "Moderate (Douglas Scale 4)",
      current_speed: 1.1,
      current_direction: "SE",
      underwater_visibility_m: 4.0
    },
    satellite: {
      chlorophyll: 6.2,
      sst_anomaly: 0.1,
      pfz_status: "Very High Potential",
      thermal_front: "Pronounced chlorophyll bloom across Saurashtra continental edge",
      plankton_density: "Dense Diatom & Copepod Bloom",
      sensor_source: "ISRO Oceansat-3"
    },
    tide: {
      high_tide_1: "07:10 AM (2.8m)",
      low_tide_1: "13:20 PM (0.8m)",
      high_tide_2: "19:40 PM (2.6m)",
      low_tide_2: "01:45 AM (0.7m)",
      current_speed: "1.4 knots (Surge)",
      sandbar_clearance_m: 2.5
    },
    dangerIndex: 45,
    dangerLevel: "CAUTION",
    safetyExplanation: "CAUTION: Prime fishing grounds with high yield, but mariners must observe the IMBL boundary buffer zone.",
    speciesInfo: {
      primarySpecies: ["Silver Pomfret", "Ghol Fish", "Ribbonfish", "Cuttlefish", "Croaker (Doma)"],
      scientificNames: ["Pampus argenteus", "Protonibea diacanthus", "Trichiurus lepturus", "Sepia pharaonis"],
      depthRangeMeters: "30 - 75m Saurashtra Bank",
      recommendedGear: "Bottom Trawl & Heavy Gillnets",
      catchWindow: "Morning High Slack Tide",
      cmfriStatus: "Highest Marine Landing Bio-Hub",
      prices: "₹800 - ₹1200/kg for Ghol, ₹700 - ₹900/kg for Pomfret"
    },
    pfzs: [
      { id: "pfz-veraval", name: "Saurashtra Coast PFZ", center: [20.65, 70.05], radius_meters: 16000, chlorophyll: 6.2, sst: 27.0, type: "pfz" }
    ],
    hazards: [
      { id: "border-alert-veraval", name: "Sensitive Boundary Buffer Zone", center: [21.5, 68.9], radius_meters: 45000, severity: "CAUTION", description: "Approaching International Maritime Boundary. Coast Guard patrol area.", type: "boundary" }
    ],
    tideZones: [
      { id: "tide-veraval", name: "Veraval Harbor Tidal Station", center: [20.91, 70.36], radius_meters: 6000, high_tide: "07:10 AM (2.8m)", low_tide: "13:20 PM (0.8m)", current_speed: "1.4 knots (Surge)", type: "tide" }
    ],
    reports: [
      { id: 6, type: "Good Catch", text: "Rich Ghol and Pomfret schools reported on 40m contour line.", lat: 20.82, lon: 70.18, timestamp: "1 hour ago", region: "veraval" }
    ],
    emergency: {
      helpline: "1554 (ICG Station Veraval 02876-244199)",
      vhf: "VHF Channel 16"
    }
  },
  vizag: {
    regionKey: "vizag",
    name: "Visakhapatnam Coast",
    name_hi: "विशाखापट्टनम तट",
    name_mr: "विशाखापट्टणम किनारपट्टी",
    timestamp: Date.now(),
    lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
    weather: {
      wind_speed: 11.2,
      wind_speed_kmh: 20.7,
      wind_gusts: 15.0,
      wind_direction: "SE",
      barometric_pressure: 1012.0,
      pressure_trend: "Steady",
      humidity: 75,
      visibility_nm: 7.0,
      condition: "Clear and Mild",
      air_temperature: 29.8,
      warnings: []
    },
    ocean: {
      wave_height: 1.3,
      sst: 28.8,
      swell_period: 7.5,
      swell_direction: "SSE",
      sea_state: "Moderate (Douglas Scale 3)",
      current_speed: 0.8,
      current_direction: "NE",
      underwater_visibility_m: 4.8
    },
    satellite: {
      chlorophyll: 5.5,
      sst_anomaly: 0.3,
      pfz_status: "High Potential Zone",
      thermal_front: "Coastal upwelling plume off Dolphin's Nose headland",
      plankton_density: "High",
      sensor_source: "ISRO Oceansat-3"
    },
    tide: {
      high_tide_1: "05:15 AM (1.6m)",
      low_tide_1: "11:30 AM (0.3m)",
      high_tide_2: "17:40 PM (1.5m)",
      low_tide_2: "23:50 PM (0.2m)",
      current_speed: "0.8 knots (Moderate)",
      sandbar_clearance_m: 2.1
    },
    dangerIndex: 22,
    dangerLevel: "SAFE",
    safetyExplanation: "Favorable conditions for deep oceanic trawlers and pelagic surface longlining.",
    speciesInfo: {
      primarySpecies: ["Yellowfin Tuna", "Sailfish", "Deep Sea Prawns", "Seer Fish"],
      scientificNames: ["Thunnus albacares", "Istiophorus platypterus", "Aristeus alcocki", "Scomberomorus commerson"],
      depthRangeMeters: "50 - 180m Continental Drop-off",
      recommendedGear: "Deep Water Trawls & Pelagic Longlines",
      catchWindow: "Early Morning Slope Influx",
      cmfriStatus: "Deep Sea Ocean Pelagic Corridor",
      prices: "₹260 - ₹380/kg for Tuna, ₹500 - ₹750/kg for Deep Sea Prawns"
    },
    pfzs: [
      { id: "pfz-vizag", name: "Vizag PFZ", center: [17.50, 83.55], radius_meters: 14000, chlorophyll: 5.5, sst: 28.8, type: "pfz" }
    ],
    hazards: [],
    tideZones: [
      { id: "tide-vizag", name: "Visakhapatnam Deep Port Tidal Zone", center: [17.70, 83.32], radius_meters: 5500, high_tide: "05:15 AM (1.6m)", low_tide: "11:30 AM (0.3m)", current_speed: "0.8 knots (Moderate)", type: "tide" }
    ],
    reports: [
      { id: 7, type: "Good Catch", text: "Yellowfin tuna pods moving across the 100m shelf contour.", lat: 17.60, lon: 83.45, timestamp: "35 mins ago", region: "vizag" }
    ],
    emergency: {
      helpline: "1554 (MRCC Vizag 0891-2565173)",
      vhf: "VHF Channel 16"
    }
  }
};

/**
 * Initializes and upgrades IndexedDB instance
 */
export function openMarineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_REGIONS)) {
        db.createObjectStore(STORE_REGIONS, { keyPath: "regionKey" });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_PENDING_REPORTS)) {
        db.createObjectStore(STORE_PENDING_REPORTS, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Seeds baseline default data for all coastal sectors if not already populated.
 */
export async function seedDefaultOfflineData(): Promise<void> {
  try {
    const db = await openMarineDB();
    const tx = db.transaction([STORE_REGIONS, STORE_META], "readwrite");
    const regionStore = tx.objectStore(STORE_REGIONS);
    const metaStore = tx.objectStore(STORE_META);

    for (const [key, regionData] of Object.entries(DEFAULT_SEED_DATA)) {
      const getReq = regionStore.get(key);
      getReq.onsuccess = () => {
        if (!getReq.result) {
          regionStore.put(regionData);
        }
      };
    }

    const metaReq = metaStore.get("last_sync");
    metaReq.onsuccess = () => {
      if (!metaReq.result) {
        metaStore.put({
          key: "last_sync",
          timestamp: Date.now(),
          timeFormatted: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
          status: "seeded"
        });
      }
    };
  } catch (err) {
    console.warn("Failed to seed default offline IndexedDB data:", err);
  }
}

/**
 * Saves or updates coastal region telemetry in IndexedDB.
 */
export async function saveCoastalRegionData(regionKey: string, data: Partial<CoastalRegionData>): Promise<void> {
  try {
    const db = await openMarineDB();
    const tx = db.transaction([STORE_REGIONS, STORE_META], "readwrite");
    const store = tx.objectStore(STORE_REGIONS);
    const metaStore = tx.objectStore(STORE_META);

    const existingReq = store.get(regionKey);
    existingReq.onsuccess = () => {
      const existing = existingReq.result || DEFAULT_SEED_DATA[regionKey] || {};
      const updated: CoastalRegionData = {
        ...existing,
        ...data,
        regionKey,
        timestamp: Date.now(),
        lastSyncedDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
      };
      store.put(updated);
    };

    metaStore.put({
      key: "last_sync",
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
      activeRegion: regionKey,
      status: "live_synced"
    });
  } catch (err) {
    console.error(`Failed to save region ${regionKey} to IndexedDB:`, err);
  }
}

/**
 * Retrieves cached telemetry for a specific coastal region from IndexedDB.
 */
export async function getCoastalRegionData(regionKey: string): Promise<CoastalRegionData | null> {
  try {
    const db = await openMarineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_REGIONS, "readonly");
      const store = tx.objectStore(STORE_REGIONS);
      const req = store.get(regionKey);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as CoastalRegionData);
        } else {
          // Fallback to initial seed if available
          resolve(DEFAULT_SEED_DATA[regionKey] || null);
        }
      };

      req.onerror = () => {
        resolve(DEFAULT_SEED_DATA[regionKey] || null);
      };
    });
  } catch (err) {
    console.warn(`Failed to fetch region ${regionKey} from IndexedDB:`, err);
    return DEFAULT_SEED_DATA[regionKey] || null;
  }
}

/**
 * Retrieves all stored coastal regions.
 */
export async function getAllCoastalRegionsData(): Promise<Record<string, CoastalRegionData>> {
  try {
    const db = await openMarineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_REGIONS, "readonly");
      const store = tx.objectStore(STORE_REGIONS);
      const req = store.getAll();

      req.onsuccess = () => {
        const result: Record<string, CoastalRegionData> = { ...DEFAULT_SEED_DATA };
        if (req.result && Array.isArray(req.result)) {
          req.result.forEach((item: CoastalRegionData) => {
            if (item.regionKey) {
              result[item.regionKey] = item;
            }
          });
        }
        resolve(result);
      };

      req.onerror = () => {
        resolve(DEFAULT_SEED_DATA);
      };
    });
  } catch {
    return DEFAULT_SEED_DATA;
  }
}

/**
 * Retrieves global sync metadata (last sync timestamp and formatted time).
 */
export async function getSyncMetadata(): Promise<{ timestamp: number; timeFormatted: string; activeRegion?: string } | null> {
  try {
    const db = await openMarineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, "readonly");
      const store = tx.objectStore(STORE_META);
      const req = store.get("last_sync");

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Queues a community report when offline for background synchronization.
 */
export async function queuePendingReport(report: Omit<PendingReport, "id" | "createdAt">): Promise<void> {
  try {
    const db = await openMarineDB();
    const tx = db.transaction(STORE_PENDING_REPORTS, "readwrite");
    const store = tx.objectStore(STORE_PENDING_REPORTS);
    store.add({
      ...report,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to queue pending report:", err);
  }
}

/**
 * Retrieves all pending reports waiting for connectivity.
 */
export async function getPendingReports(): Promise<PendingReport[]> {
  try {
    const db = await openMarineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PENDING_REPORTS, "readonly");
      const store = tx.objectStore(STORE_PENDING_REPORTS);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve((req.result as PendingReport[]) || []);
      };

      req.onerror = () => {
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Removes a synced report from the queue.
 */
export async function removePendingReport(id: number): Promise<void> {
  try {
    const db = await openMarineDB();
    const tx = db.transaction(STORE_PENDING_REPORTS, "readwrite");
    const store = tx.objectStore(STORE_PENDING_REPORTS);
    store.delete(id);
  } catch (err) {
    console.error("Failed to delete pending report:", err);
  }
}
