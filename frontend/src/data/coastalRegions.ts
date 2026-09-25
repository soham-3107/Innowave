export interface CoastalRegion {
  key: string;
  name: string;
  fullName: string;
  basin: string;
  state: string;
  aliases: string[];
}

export const COASTAL_REGIONS: CoastalRegion[] = [
  {
    key: "mumbai",
    name: "Mumbai Coast",
    fullName: "Mumbai Coast (Arabian Sea)",
    basin: "Arabian Sea",
    state: "Maharashtra",
    aliases: ["mumbai", "bombay", "maharashtra", "arabian sea", "west coast", "nhava sheva", "konkan", "sassoon docks", "mumb"]
  },
  {
    key: "goa",
    name: "Goa Coast",
    fullName: "Goa Coast (Arabian Sea)",
    basin: "Arabian Sea",
    state: "Goa",
    aliases: ["goa", "panaji", "panjim", "mormugao", "vasco", "arabian sea", "west coast", "konkan", "mandovi", "zuari"]
  },
  {
    key: "kochi",
    name: "Kochi Coast",
    fullName: "Kochi Coast (Arabian Sea)",
    basin: "Arabian Sea",
    state: "Kerala",
    aliases: ["kochi", "cochin", "kerala", "malabar", "arabian sea", "west coast", "ernakulam", "mattancherry", "munambam"]
  },
  {
    key: "chennai",
    name: "Chennai Coast",
    fullName: "Chennai Coast (Bay of Bengal)",
    basin: "Bay of Bengal",
    state: "Tamil Nadu",
    aliases: ["chennai", "madras", "tamil nadu", "coromandel", "bay of bengal", "east coast", "kasimedu", "ennore", "royapuram"]
  },
  {
    key: "veraval",
    name: "Veraval / Gujarat Coast",
    fullName: "Veraval / Gujarat Coast (Arabian Sea)",
    basin: "Arabian Sea",
    state: "Gujarat",
    aliases: ["veraval", "gujarat", "saurashtra", "somnath", "arabian sea", "west coast", "kandla", "porbandar", "okha", "gir somnath"]
  },
  {
    key: "vizag",
    name: "Visakhapatnam Coast",
    fullName: "Visakhapatnam Coast (Bay of Bengal)",
    basin: "Bay of Bengal",
    state: "Andhra Pradesh",
    aliases: ["vizag", "visakhapatnam", "andhra", "andhra pradesh", "bay of bengal", "east coast", "waltair", "gangavaram", "rishikonda"]
  }
];

export const REGION_RECORD: Record<string, CoastalRegion> = COASTAL_REGIONS.reduce((acc, region) => {
  acc[region.key] = region;
  return acc;
}, {} as Record<string, CoastalRegion>);

export const REGION_DATA: Record<string, { name: string; basin: string; state: string; fullName: string }> = COASTAL_REGIONS.reduce((acc, r) => {
  acc[r.key] = {
    name: r.name,
    basin: r.basin,
    state: r.state,
    fullName: r.fullName
  };
  return acc;
}, {} as Record<string, { name: string; basin: string; state: string; fullName: string }>);

export const REGION_NAMES: Record<string, string> = COASTAL_REGIONS.reduce((acc, region) => {
  acc[region.key] = region.name;
  return acc;
}, {} as Record<string, string>);

/**
 * Filter coastal regions based on user search query.
 * Matches on name, key, basin, state, and aliases.
 */
export function searchCoastalRegions(query: string): CoastalRegion[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return COASTAL_REGIONS;
  }

  return COASTAL_REGIONS.filter(region => {
    // Exact or prefix match on key
    if (region.key.toLowerCase().includes(normalized)) return true;
    // Match in name
    if (region.name.toLowerCase().includes(normalized)) return true;
    // Match in fullName
    if (region.fullName.toLowerCase().includes(normalized)) return true;
    // Match in basin
    if (region.basin.toLowerCase().includes(normalized)) return true;
    // Match in state
    if (region.state.toLowerCase().includes(normalized)) return true;
    // Match in any alias
    if (region.aliases.some(alias => alias.toLowerCase().includes(normalized))) return true;

    return false;
  });
}
