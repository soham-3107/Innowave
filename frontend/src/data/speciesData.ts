export interface RegionSpeciesInfo {
  region: string;
  regionName: string;
  primarySpecies: string[];
  scientificNames: string[];
  depthRangeMeters: string;
  recommendedGear: string;
  catchWindow: string;
  cmfriStatus: string;
  chlorophyllFront: string;
}

export const REGION_SPECIES: Record<string, RegionSpeciesInfo> = {
  mumbai: {
    region: "mumbai",
    regionName: "Mumbai Coast",
    primarySpecies: ["Indian Mackerel", "Silver Pomfret", "Bombay Duck", "Oil Sardines"],
    scientificNames: ["Rastrelliger kanagurta", "Pampus argenteus", "Harpadon nehereus", "Sardinella longiceps"],
    depthRangeMeters: "15 - 45m Shelf Contours",
    recommendedGear: "Pelagic Drift Nets & Gillnets",
    catchWindow: "Early Morning (05:00 - 09:30 AM)",
    cmfriStatus: "High Pelagic Biomass Zone",
    chlorophyllFront: "Strong Front (4.8 mg/m³)"
  },
  goa: {
    region: "goa",
    regionName: "Goa Coast",
    primarySpecies: ["Kingfish (Surmai)", "Yellowfin Tuna", "Indian Mackerel", "Seer Fish"],
    scientificNames: ["Scomberomorus commerson", "Thunnus albacares", "Rastrelliger kanagurta", "Scomberomorus guttatus"],
    depthRangeMeters: "25 - 60m Mid-Shelf",
    recommendedGear: "Trolling Lines & Hook-and-Line",
    catchWindow: "Dawn & Dusk Tidal Influx",
    cmfriStatus: "Prime Pelagic Predator Corridor",
    chlorophyllFront: "Optimal Front (5.1 mg/m³)"
  },
  kochi: {
    region: "kochi",
    regionName: "Kochi Coast",
    primarySpecies: ["Indian Oil Sardines", "Malabar Anchovy", "Karikkadi Prawns", "Threadfin Bream"],
    scientificNames: ["Sardinella longiceps", "Encrasicholina devisi", "Parapenaeopsis stylifera", "Nemipterus japonicus"],
    depthRangeMeters: "10 - 35m Coastal Upwelling",
    recommendedGear: "Ring Seine & Bottom Trawls",
    catchWindow: "Pre-Dawn to Sunrise (04:30 - 07:30 AM)",
    cmfriStatus: "High Inshore Coastal Shoaling",
    chlorophyllFront: "Active Upwelling Plume (1.2 - 2.5 mg/m³)"
  },
  chennai: {
    region: "chennai",
    regionName: "Chennai Coast",
    primarySpecies: ["Ribbonfish", "Squid & Cuttlefish", "Tiger Prawns", "Lesser Sardines"],
    scientificNames: ["Trichiurus lepturus", "Uroteuthis duvaucelii", "Penaeus monodon", "Sardinella gibbosa"],
    depthRangeMeters: "20 - 50m Shelf Boundary",
    recommendedGear: "Trawl Nets & Light Jigging",
    catchWindow: "Late Evening & Night Drift",
    cmfriStatus: "Active Cephalopod & Demersal Shoal",
    chlorophyllFront: "Stable Front (3.1 mg/m³)"
  },
  veraval: {
    region: "veraval",
    regionName: "Veraval / Gujarat Coast",
    primarySpecies: ["Yellowfin Tuna", "Ribbonfish", "Silver Pomfret", "Croaker (Ghol)"],
    scientificNames: ["Thunnus albacares", "Trichiurus lepturus", "Pampus argenteus", "Protonibea diacanthus"],
    depthRangeMeters: "30 - 80m Shelf Slope",
    recommendedGear: "Longlines & Heavy Gillnets",
    catchWindow: "Early Morning (04:30 - 08:30 AM)",
    cmfriStatus: "Major Commercial Demersal/Pelagic Hub",
    chlorophyllFront: "High Plankton Density (6.2 mg/m³)"
  },
  vizag: {
    region: "vizag",
    regionName: "Visakhapatnam Coast",
    primarySpecies: ["Skipjack Tuna", "Tiger Prawns", "Indian Mackerel", "Anchovies"],
    scientificNames: ["Katsuwonus pelamis", "Penaeus monodon", "Rastrelliger kanagurta", "Stolephorus indicus"],
    depthRangeMeters: "25 - 70m Trench Margin",
    recommendedGear: "Purse Seine & Deep Handlines",
    catchWindow: "Morning High Slack Tide",
    cmfriStatus: "Oceanic Pelagic Migration Route",
    chlorophyllFront: "Strong Coastal Front (5.5 mg/m³)"
  }
};
